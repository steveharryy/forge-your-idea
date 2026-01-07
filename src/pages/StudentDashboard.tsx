import { useState } from 'react';
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(false);
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

  // Redirect if not authenticated or not a student
  if (!authLoading && (!user || userRole !== 'student')) {
    navigate('/auth');
    return null;
  }

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject: Project = {
      id: Date.now().toString(),
      title: formData.title,
      tagline: formData.tagline,
      description: formData.description,
      problem: formData.problem,
      solution: formData.solution,
      tech_stack: formData.tech_stack.split(',').map(t => t.trim()).filter(Boolean),
      category: formData.category,
      logo_url: '',
      demo_url: formData.demo_url,
      github_url: formData.github_url,
      funding_goal: formData.funding_goal ? parseFloat(formData.funding_goal) : 0,
      status: 'published',
      created_at: new Date().toISOString(),
    };

    if (editingProject) {
      setProjects(projects.map(p => p.id === editingProject.id ? { ...newProject, id: editingProject.id } : p));
      toast.success('Project updated!');
    } else {
      setProjects([newProject, ...projects]);
      toast.success('Project created!');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    toast.success('Project deleted');
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

  const handleRespondToRequest = (requestId: string, status: 'accepted' | 'rejected') => {
    setContactRequests(contactRequests.map(r => 
      r.id === requestId ? { ...r, status } : r
    ));
    toast.success(`Request ${status}`);
  };

  if (authLoading) {
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
                        <Label htmlFor="title">Project Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="My Awesome Startup"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AI & ML">AI & ML</SelectItem>
                            <SelectItem value="SaaS">SaaS</SelectItem>
                            <SelectItem value="Developer Tools">Developer Tools</SelectItem>
                            <SelectItem value="Fintech">Fintech</SelectItem>
                            <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                            <SelectItem value="E-commerce">E-commerce</SelectItem>
                            <SelectItem value="Productivity">Productivity</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input
                        id="tagline"
                        value={formData.tagline}
                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                        placeholder="A short catchy tagline"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your project..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="problem">Problem</Label>
                        <Textarea
                          id="problem"
                          value={formData.problem}
                          onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                          placeholder="What problem does it solve?"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="solution">Solution</Label>
                        <Textarea
                          id="solution"
                          value={formData.solution}
                          onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                          placeholder="How does it solve the problem?"
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tech_stack">Tech Stack (comma separated)</Label>
                      <Input
                        id="tech_stack"
                        value={formData.tech_stack}
                        onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                        placeholder="React, Node.js, PostgreSQL"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="demo_url">Demo URL</Label>
                        <Input
                          id="demo_url"
                          value={formData.demo_url}
                          onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                          placeholder="https://demo.example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="github_url">GitHub URL</Label>
                        <Input
                          id="github_url"
                          value={formData.github_url}
                          onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                          placeholder="https://github.com/..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="funding_goal">Funding Goal (₹)</Label>
                      <Input
                        id="funding_goal"
                        type="number"
                        value={formData.funding_goal}
                        onChange={(e) => setFormData({ ...formData, funding_goal: e.target.value })}
                        placeholder="100000"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1 bg-primary-gradient">
                        {editingProject ? 'Update Project' : 'Create Project'}
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
                <p className="text-muted-foreground mb-4">Create your first project to get started</p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-primary-gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="glass-card p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-display text-lg font-semibold">{project.title}</h3>
                          <Badge variant="secondary">{project.category}</Badge>
                          <Badge variant={project.status === 'published' ? 'default' : 'outline'}>
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{project.tagline}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.tech_stack?.map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
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
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteProject(project.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
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
                <p className="text-muted-foreground">Investors will appear here when they contact you</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {contactRequests.map((request) => (
                  <Card key={request.id} className="glass-card p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={request.profiles?.avatar_url || '/placeholder.svg'}
                        alt={request.profiles?.full_name || 'Investor'}
                        className="h-12 w-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{request.profiles?.full_name || 'Investor'}</h4>
                          <Badge variant={request.status === 'pending' ? 'default' : request.status === 'accepted' ? 'secondary' : 'outline'}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-4">{request.message}</p>
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleRespondToRequest(request.id, 'accepted')}>
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRespondToRequest(request.id, 'rejected')}>
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Team Management</h2>
            <Card className="glass-card p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">Team management features are under development</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;
