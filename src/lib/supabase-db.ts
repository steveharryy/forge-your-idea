// Supabase database helpers for Lovable Cloud
// Uses the clerk_user_id column to link records to Clerk users

import { supabase } from "@/integrations/supabase/client";

// ========== Types ==========
export interface Project {
  id: string;
  owner_id: string;
  clerk_user_id: string | null;
  title: string;
  tagline: string | null;
  description: string | null;
  problem: string | null;
  solution: string | null;
  tech_stack: string[] | null;
  category: string | null;
  demo_url: string | null;
  github_url: string | null;
  funding_goal: number | null;
  founder_name: string | null;
  founder_avatar: string | null;
  founder_university: string | null;
  logo_url: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  from_clerk_id: string | null;
  to_clerk_id: string | null;
  project_id: string;
  message: string;
  status: string | null;
  created_at: string;
  // Joined fields
  from_user_name?: string;
  from_user_avatar?: string;
  from_user_email?: string;
  project_title?: string;
}

// ========== Project Functions ==========

export async function createProject(data: {
  clerkUserId: string;
  title: string;
  tagline?: string;
  description?: string;
  problem?: string;
  solution?: string;
  tech_stack?: string[];
  category?: string;
  demo_url?: string;
  github_url?: string;
  funding_goal?: number;
  founder_name?: string;
  founder_avatar?: string;
  founder_university?: string;
  status?: string;
}): Promise<Project> {
  // For owner_id, we need a valid UUID. We'll use a deterministic UUID from clerk ID
  // or create a placeholder. The clerk_user_id is the actual identifier.
  const placeholderOwnerId = '00000000-0000-0000-0000-000000000000';
  
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      owner_id: placeholderOwnerId,
      clerk_user_id: data.clerkUserId,
      title: data.title,
      tagline: data.tagline || null,
      description: data.description || null,
      problem: data.problem || null,
      solution: data.solution || null,
      tech_stack: data.tech_stack || null,
      category: data.category || null,
      demo_url: data.demo_url || null,
      github_url: data.github_url || null,
      funding_goal: data.funding_goal || null,
      founder_name: data.founder_name || null,
      founder_avatar: data.founder_avatar || null,
      founder_university: data.founder_university || null,
      status: data.status || 'published',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    throw new Error(error.message);
  }

  return project as Project;
}

export async function getProjectsByClerkUser(clerkUserId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    throw new Error(error.message);
  }

  return (data || []) as Project[];
}

export async function getAllPublishedProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching published projects:', error);
    throw new Error(error.message);
  }

  return (data || []) as Project[];
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error fetching project:', error);
    throw new Error(error.message);
  }

  return data as Project;
}

export async function updateProject(
  projectId: string,
  clerkUserId: string,
  updates: Partial<Omit<Project, 'id' | 'owner_id' | 'clerk_user_id' | 'created_at'>>
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .eq('clerk_user_id', clerkUserId) // Ensure user owns the project
    .select()
    .single();

  if (error) {
    console.error('Error updating project:', error);
    throw new Error(error.message);
  }

  return data as Project;
}

export async function deleteProject(projectId: string, clerkUserId: string): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('clerk_user_id', clerkUserId);

  if (error) {
    console.error('Error deleting project:', error);
    throw new Error(error.message);
  }

  return true;
}

// ========== Contact Request Functions ==========

export async function getContactRequestsForClerkUser(clerkUserId: string): Promise<ContactRequest[]> {
  const { data, error } = await supabase
    .from('contact_requests')
    .select('*')
    .eq('to_clerk_id', clerkUserId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contact requests:', error);
    throw new Error(error.message);
  }

  return (data || []) as ContactRequest[];
}

export async function sendContactRequest(data: {
  fromClerkId: string;
  toClerkId: string;
  projectId: string;
  message: string;
}): Promise<ContactRequest> {
  const placeholderUserId = '00000000-0000-0000-0000-000000000000';
  
  const { data: request, error } = await supabase
    .from('contact_requests')
    .insert({
      from_user_id: placeholderUserId,
      to_user_id: placeholderUserId,
      from_clerk_id: data.fromClerkId,
      to_clerk_id: data.toClerkId,
      project_id: data.projectId,
      message: data.message,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending contact request:', error);
    throw new Error(error.message);
  }

  return request as ContactRequest;
}

export async function updateContactRequestStatus(
  requestId: string,
  clerkUserId: string,
  status: 'accepted' | 'declined'
): Promise<ContactRequest> {
  const { data, error } = await supabase
    .from('contact_requests')
    .update({ status })
    .eq('id', requestId)
    .eq('to_clerk_id', clerkUserId)
    .select()
    .single();

  if (error) {
    console.error('Error updating contact request:', error);
    throw new Error(error.message);
  }

  return data as ContactRequest;
}

export async function getSentContactRequests(clerkUserId: string): Promise<ContactRequest[]> {
  const { data, error } = await supabase
    .from('contact_requests')
    .select('*')
    .eq('from_clerk_id', clerkUserId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sent requests:', error);
    throw new Error(error.message);
  }

  return (data || []) as ContactRequest[];
}
