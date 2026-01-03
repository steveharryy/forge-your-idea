import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUp,
  ExternalLink,
  Github,
  Share2,
  Star,
  MessageCircle,
  Loader2,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import StartupCard from "@/components/startup/StartupCard";

const StartupDetail = () => {
  const { id } = useParams<{ id: string }>();

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch project details
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.owner_id)
        .maybeSingle();

      // Fetch team members
      const { data: team } = await supabase
        .from('team_members')
        .select('*')
        .eq('project_id', id);

      return { ...data, profile, team: team || [] };
    },
    enabled: !!id,
  });

  // Fetch related projects
  const { data: relatedProjects = [] } = useQuery({
    queryKey: ['projects', 'related', project?.category],
    queryFn: async () => {
      if (!project?.category || !id) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'published')
        .eq('category', project.category)
        .neq('id', id)
        .limit(3);
      
      if (error) throw error;

      // Fetch profiles for related projects
      const ownerIds = [...new Set(data?.map(p => p.owner_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', ownerIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      return (data || []).map(p => ({
        ...p,
        profile: profileMap.get(p.owner_id) || null
      }));
    },
    enabled: !!project?.category && !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Startup Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The startup you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/explore">Browse Startups</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="border-b border-border/50 bg-card/30">
        <div className="container py-6">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
          </Link>

          <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="h-24 w-24 lg:h-32 lg:w-32 rounded-2xl bg-secondary overflow-hidden ring-1 ring-border/50 shadow-soft">
                <img
                  src={project.logo_url || '/placeholder.svg'}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-display text-3xl lg:text-4xl font-bold">
                  {project.title}
                </h1>
                {project.status === 'featured' && (
                  <span className="badge-featured">
                    <Star className="h-3 w-3" />
                    Featured
                  </span>
                )}
              </div>

              <p className="text-lg text-muted-foreground mb-4">
                {project.tagline}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="secondary" className="text-sm">
                  {project.category}
                </Badge>
                <div className="flex items-center gap-2">
                  <img
                    src={project.founder_avatar || project.profile?.avatar_url || '/placeholder.svg'}
                    alt={project.founder_name || project.profile?.full_name || 'Founder'}
                    className="h-6 w-6 rounded-full ring-1 ring-border"
                  />
                  <span className="text-sm text-muted-foreground">
                    by{" "}
                    <span className="text-foreground">
                      {project.founder_name || project.profile?.full_name || 'Anonymous'}
                    </span>
                    {(project.founder_university || project.profile?.university) && (
                      <span className="text-muted-foreground">
                        {" "}• {project.founder_university || project.profile?.university}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <Button variant="hero" size="lg" className="gap-2">
                <ArrowUp className="h-5 w-5" />
                Upvote
              </Button>
              <div className="flex gap-2">
                {project.demo_url && (
                  <Button variant="outline" size="lg" asChild className="flex-1 lg:flex-none">
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Demo
                    </a>
                  </Button>
                )}
                {project.github_url && (
                  <Button variant="outline" size="icon" asChild>
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview */}
            <section>
              <h2 className="font-display text-xl font-semibold mb-4">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                {project.description || 'No description provided.'}
              </p>
            </section>

            {/* Problem */}
            {project.problem && (
              <section className="glass-card rounded-2xl p-6">
                <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    ?
                  </span>
                  The Problem
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {project.problem}
                </p>
              </section>
            )}

            {/* Solution */}
            {project.solution && (
              <section className="glass-card rounded-2xl p-6">
                <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    ✓
                  </span>
                  The Solution
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {project.solution}
                </p>
              </section>
            )}

            {/* Tech Stack */}
            {project.tech_stack && project.tech_stack.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-semibold mb-4">
                  Tech Stack
                </h2>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map((tech: string) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="px-4 py-2 text-sm"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Funding Goal */}
            {project.funding_goal && (
              <section className="glass-card rounded-2xl p-6">
                <h2 className="font-display text-xl font-semibold mb-4">
                  Funding Goal
                </h2>
                <p className="text-3xl font-bold text-primary">
                  ₹{project.funding_goal.toLocaleString('en-IN')}
                </p>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Founder Card */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-4">About the Founder</h3>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={project.founder_avatar || project.profile?.avatar_url || '/placeholder.svg'}
                  alt={project.founder_name || project.profile?.full_name || 'Founder'}
                  className="h-12 w-12 rounded-full ring-2 ring-border"
                />
                <div>
                  <p className="font-medium">{project.founder_name || project.profile?.full_name || 'Anonymous'}</p>
                  {(project.founder_university || project.profile?.university) && (
                    <p className="text-sm text-muted-foreground">
                      {project.founder_university || project.profile?.university}
                    </p>
                  )}
                </div>
              </div>
              {project.profile?.bio && (
                <p className="text-sm text-muted-foreground">
                  {project.profile.bio}
                </p>
              )}
            </div>

            {/* Team Members */}
            {project.team && project.team.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-4">Team</h3>
                <div className="space-y-3">
                  {project.team.map((member: any) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <img
                        src={member.avatar_url || '/placeholder.svg'}
                        alt={member.name}
                        className="h-10 w-10 rounded-full ring-1 ring-border"
                      />
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        {member.role && (
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discussion */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Discussion
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Join the conversation and share your thoughts.
              </p>
              <Button variant="secondary" className="w-full">
                Start Discussion
              </Button>
            </div>
          </div>
        </div>

        {/* Related Startups */}
        {relatedProjects.length > 0 && (
          <section className="mt-16 pt-12 border-t border-border/50">
            <h2 className="font-display text-2xl font-bold mb-6">
              More in {project.category}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedProjects.map((related: any) => (
                <StartupCard
                  key={related.id}
                  id={related.id}
                  name={related.title}
                  tagline={related.tagline || ''}
                  logo={related.logo_url || '/placeholder.svg'}
                  category={related.category || ''}
                  upvotes={0}
                  founder={{
                    name: related.profile?.full_name || 'Anonymous',
                    avatar: related.profile?.avatar_url || '/placeholder.svg',
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default StartupDetail;