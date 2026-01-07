import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  GraduationCap, Plus, LogOut, Rocket, Users, Eye, MessageSquare,
  ExternalLink, Github, Edit, Trash2, Loader2, FolderOpen, Bell, Settings,
  User, Lock, BellRing, Palette, Globe, Sun, Moon
} from 'lucide-react';
import logo from '@/assets/logo.png';

interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  problem: string;
  solution: string;
  tech_stack: string[];
  category: string;
  logo_url: string;
  demo_url: string;
  github_url: string;
  funding_goal: number;
  status: string;
  created_at: string;
}

interface ContactRequest {
  id: string;
  message: string;
  status: string;
  created_at: string;
  from_user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  } | null;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, userRole, signOut, loading: authLoading } = useAuth();
  const userId = user?.id;
  const [projects, setProjects] = useState<Project[]>([]);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    problem: '',
    solution: '',
    tech_stack: '',
    category: '',
    demo_url: '',
    github_url: '',
    funding_goal: '',
  });

  useEffect(() => {
    if (!authLoading && (!userId || userRole !== 'student')) {
      navigate('/auth');
    }
  }, [userId, userRole, authLoading, navigate]);

  useEffect(() => {
    if (userId) {
      fetchProjects();
      fetchContactRequests();
    }
  }, [userId]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  };

  const fetchContactRequests = async () => {
    const { data, error } = await supabase
      .from('contact_requests')
      .select('*')
      .eq('to_user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Fetch profiles for each request
      const requestsWithProfiles = await Promise.all(
        data.map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', request.from_user_id)
            .maybeSingle();
          return { ...request, profiles: profile };
        })
      );
      setContactRequests(requestsWithProfiles as ContactRequest[]);
    }
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData = {
      owner_id: userId,
      title: formData.title,
      tagline: formData.tagline,
      description: formData.description,
      problem: formData.problem,
      solution: formData.solution,
      tech_stack: formData.tech_stack.split(',').map(t => t.trim()).filter(Boolean),
      category: formData.category,
      demo_url: formData.demo_url,
      github_url: formData.github_url,
      funding_goal: formData.funding_goal ? parseFloat(formData.funding_goal) : null,
      status: 'published',
    };

    if (editingProject) {
      const { error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', editingProject.id);

      if (error) {
        toast.error('Failed to update project');
      } else {
        toast.success('Project updated!');
        fetchProjects();
      }
    } else {
      const { error } = await supabase
        .from('projects')
        .insert(projectData);

      if (error) {
        toast.error('Failed to create project');
      } else {
        toast.success('Project created!');
        fetchProjects();
      }
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteProject = async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete project');
    } else {
      toast.success('Project deleted');
      fetchProjects();
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      tagline: project.tagline || '',
      description: project.description || '',
      problem: project.problem || '',
      solution: project.solution || '',
      tech_stack: project.tech_stack?.join(', ') || '',
      category: project.category || '',
      demo_url: project.demo_url || '',
      github_url: project.github_url || '',
      funding_goal: project.funding_goal?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      tagline: '',
      description: '',
      problem: '',
      solution: '',
      tech_stack: '',
      category: '',
      demo_url: '',
      github_url: '',
      funding_goal: '',
    });
  };

  const handleRespondToRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('contact_requests')
      .update({ status })
      .eq('id', requestId);

    if (error) {
      toast.error('Failed to update request');
    } else {
      toast.success(`Request ${status}`);
      fetchContactRequests();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-card-strong border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src={logo} 
                alt="Vichaar Setu" 
                className="h-9 w-9 object-contain rounded-lg"
              />
              <span className="font-display text-xl font-bold hidden sm:block">Vichaar Setu</span>
            </Link>
            <Badge className="badge-student">
              <GraduationCap className="h-3 w-3" />
              Student
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {contactRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center">
                  {contactRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="glass-card-strong border-l border-border/50 flex flex-col">
                <SheetHeader>
                  <SheetTitle className="font-display text-xl">Settings</SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-1 mt-6 pr-4">
                  <div className="space-y-6 pb-6">
                    {/* Profile Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <User className="h-4 w-4" />
                        Profile
                      </div>
                      <div className="space-y-3 pl-6">
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/profile">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <BellRing className="h-4 w-4" />
                        Notifications
                      </div>
                      <div className="space-y-3 pl-6">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Email notifications</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Investor inquiries</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Project updates</span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    {/* Privacy Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        Privacy
                      </div>
                      <div className="space-y-3 pl-6">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Show profile publicly</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Allow contact requests</span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    {/* Appearance Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Palette className="h-4 w-4" />
                        Appearance
                      </div>
                      <div className="space-y-3 pl-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                            <span className="text-sm">Dark mode</span>
                          </div>
                          <Switch 
                            checked={theme === 'dark'} 
                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Links Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        Quick Links
                      </div>
                      <div className="space-y-2 pl-6">
                        <Button variant="ghost" className="w-full justify-start text-sm h-8" asChild>
                          <Link to="/about">About Us</Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-sm h-8" asChild>
                          <Link to="/blog">Blog</Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-sm h-8" asChild>
                          <Link to="/explore">Explore Startups</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-up">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Welcome back, <span className="gradient-text">Innovator</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your projects and connect with investors
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Projects', value: projects.length, icon: Rocket },
            { label: 'Investor Inquiries', value: contactRequests.length, icon: MessageSquare },
            { label: 'Profile Views', value: '—', icon: Eye },
          ].map((stat, i) => (
            <Card key={stat.label} className={`glass-card p-6 animate-fade-up stagger-${i + 1}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="glass-card">
            <TabsTrigger value="projects" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Rocket className="h-4 w-4 mr-2" />
              My Projects
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageSquare className="h-4 w-4 mr-2" />
              Inquiries
              {contactRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="ml-2 h-5 w-5 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                  {contactRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-4 w-4 mr-2" />
              Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Your Projects</h2>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-primary-gradient hover:opacity-90">
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card-strong max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">
                      {editingProject ? 'Edit Project' : 'Create New Project'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitProject} className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Project Name *</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="My Awesome Startup"
                          required
                          className="bg-secondary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger className="bg-secondary/50">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border shadow-lg z-50">
                            <SelectItem value="fintech">FinTech</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="edtech">EdTech</SelectItem>
                            <SelectItem value="ecommerce">E-commerce</SelectItem>
                            <SelectItem value="ai-ml">AI/ML</SelectItem>
                            <SelectItem value="saas">SaaS</SelectItem>
                            <SelectItem value="social-media">Social Media</SelectItem>
                            <SelectItem value="gaming">Gaming</SelectItem>
                            <SelectItem value="cleantech">CleanTech</SelectItem>
                            <SelectItem value="agritech">AgriTech</SelectItem>
                            <SelectItem value="proptech">PropTech</SelectItem>
                            <SelectItem value="foodtech">FoodTech</SelectItem>
                            <SelectItem value="logistics">Logistics</SelectItem>
                            <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                            <SelectItem value="iot">IoT</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Tagline</Label>
                      <Input
                        value={formData.tagline}
                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                        placeholder="A one-liner about your project"
                        className="bg-secondary/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detailed description of your project..."
                        rows={4}
                        className="bg-secondary/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Problem</Label>
                        <Textarea
                          value={formData.problem}
                          onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                          placeholder="What problem does it solve?"
                          rows={3}
                          className="bg-secondary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Solution</Label>
                        <Textarea
                          value={formData.solution}
                          onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                          placeholder="How does it solve the problem?"
                          rows={3}
                          className="bg-secondary/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Tech Stack (comma-separated)</Label>
                      <Input
                        value={formData.tech_stack}
                        onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                        placeholder="React, Node.js, PostgreSQL"
                        className="bg-secondary/50"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Demo URL</Label>
                        <Input
                          value={formData.demo_url}
                          onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                          placeholder="https://..."
                          className="bg-secondary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>GitHub URL</Label>
                        <Input
                          value={formData.github_url}
                          onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                          placeholder="https://github.com/..."
                          className="bg-secondary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Funding Goal ($)</Label>
                        <Input
                          type="number"
                          value={formData.funding_goal}
                          onChange={(e) => setFormData({ ...formData, funding_goal: e.target.value })}
                          placeholder="50000"
                          className="bg-secondary/50"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-primary-gradient">
                        {editingProject ? 'Save Changes' : 'Create Project'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {projects.length === 0 ? (
              <Card className="glass-card p-12 text-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">Start by creating your first project</p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-primary-gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {projects.map((project, i) => (
                  <Card key={project.id} className={`glass-card p-6 hover-lift animate-fade-up stagger-${(i % 5) + 1}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-display text-lg font-semibold">{project.title}</h3>
                          {project.category && (
                            <Badge variant="secondary">{project.category}</Badge>
                          )}
                          <Badge variant={project.status === 'published' ? 'default' : 'outline'}>
                            {project.status}
                          </Badge>
                        </div>
                        {project.tagline && (
                          <p className="text-muted-foreground mb-3">{project.tagline}</p>
                        )}
                        {project.tech_stack && project.tech_stack.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.tech_stack.map((tech) => (
                              <Badge key={tech} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {project.demo_url && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {project.github_url && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                              <Github className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleEditProject(project)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inquiries" className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Investor Inquiries</h2>
            
            {contactRequests.length === 0 ? (
              <Card className="glass-card p-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">No inquiries yet</h3>
                <p className="text-muted-foreground">When investors reach out, their messages will appear here</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {contactRequests.map((request, i) => (
                  <Card key={request.id} className={`glass-card p-6 animate-fade-up stagger-${(i % 5) + 1}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-investor-gradient flex items-center justify-center text-warning-foreground font-semibold">
                            {request.profiles?.full_name?.[0] || 'I'}
                          </div>
                          <div>
                            <p className="font-semibold">{request.profiles?.full_name || 'Investor'}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={request.status === 'pending' ? 'default' : request.status === 'accepted' ? 'secondary' : 'outline'}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{request.message}</p>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-success text-success-foreground hover:bg-success/90"
                            onClick={() => handleRespondToRequest(request.id, 'accepted')}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRespondToRequest(request.id, 'rejected')}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Team Members</h2>
              <Button variant="outline" disabled>
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </div>
            
            <Card className="glass-card p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">Team collaboration coming soon</h3>
              <p className="text-muted-foreground">Invite team members to collaborate on your projects</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;