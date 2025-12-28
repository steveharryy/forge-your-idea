import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  TrendingUp, Flame, LogOut, Search, Rocket, Eye, MessageSquare,
  ExternalLink, Github, Loader2, Filter, Star, Send, ChevronRight,
  Users, Briefcase, Globe, Sparkles, ArrowUpRight
} from 'lucide-react';

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
  owner_id: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
    university: string;
  } | null;
}

interface SentRequest {
  id: string;
  project_id: string;
  status: string;
}

const InvestorDashboard = () => {
  const navigate = useNavigate();
  const { user, userRole, signOut, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || userRole !== 'investor')) {
      navigate('/auth');
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchSentRequests();
    }
  }, [user]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Fetch profiles for each project
      const projectsWithProfiles = await Promise.all(
        data.map(async (project) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, university')
            .eq('user_id', project.owner_id)
            .maybeSingle();
          return { ...project, profiles: profile };
        })
      );
      setProjects(projectsWithProfiles as Project[]);
    }
    setLoading(false);
  };

  const fetchSentRequests = async () => {
    const { data, error } = await supabase
      .from('contact_requests')
      .select('id, project_id, status')
      .eq('from_user_id', user?.id);

    if (!error && data) {
      setSentRequests(data);
    }
  };

  const handleContactStudent = async () => {
    if (!selectedProject || !contactMessage.trim()) return;
    
    setSendingMessage(true);
    
    const { error } = await supabase
      .from('contact_requests')
      .insert({
        from_user_id: user?.id,
        to_user_id: selectedProject.owner_id,
        project_id: selectedProject.id,
        message: contactMessage,
      });

    if (error) {
      toast.error('Failed to send message');
    } else {
      toast.success('Message sent to the student!');
      fetchSentRequests();
      setContactDialogOpen(false);
      setContactMessage('');
      setSelectedProject(null);
    }
    
    setSendingMessage(false);
  };

  const getRequestStatus = (projectId: string) => {
    const request = sentRequests.find(r => r.project_id === projectId);
    return request?.status || null;
  };

  const categories = ['all', ...new Set(projects.map(p => p.category).filter(Boolean))];

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tech_stack?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'funding') {
        return (b.funding_goal || 0) - (a.funding_goal || 0);
      }
      return 0;
    });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-warning" />
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
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-investor-gradient">
                <Flame className="h-4 w-4 text-warning-foreground" />
              </div>
              <span className="font-display text-xl font-bold hidden sm:block">IdeaForge</span>
            </Link>
            <Badge className="badge-investor">
              <TrendingUp className="h-3 w-3" />
              Investor
            </Badge>
          </div>

          <div className="flex items-center gap-3">
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
            Discover <span className="gradient-text-accent">Promising Startups</span>
          </h1>
          <p className="text-muted-foreground">
            Find innovative projects from talented students and connect with founders
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Projects', value: projects.length, icon: Rocket, color: 'bg-primary' },
            { label: 'Contacted', value: sentRequests.length, icon: MessageSquare, color: 'bg-accent' },
            { label: 'Accepted', value: sentRequests.filter(r => r.status === 'accepted').length, icon: Star, color: 'bg-success' },
            { label: 'Pending', value: sentRequests.filter(r => r.status === 'pending').length, icon: Send, color: 'bg-warning' },
          ].map((stat, i) => (
            <Card key={stat.label} className={`glass-card p-5 animate-fade-up stagger-${i + 1}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}/10`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color.replace('bg-', '')}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Search & Filters */}
        <Card className="glass-card p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, tech stack, categories..."
                className="pl-10 bg-secondary/50"
              />
            </div>
            <div className="flex gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 bg-secondary/50">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 bg-secondary/50">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="funding">Funding Goal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card className="glass-card p-12 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, i) => {
              const requestStatus = getRequestStatus(project.id);
              
              return (
                <Card
                  key={project.id}
                  className={`glass-card overflow-hidden hover-lift animate-fade-up stagger-${(i % 5) + 1} group`}
                >
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-14 w-14 rounded-2xl bg-primary-gradient flex items-center justify-center text-primary-foreground font-display font-bold text-xl">
                        {project.title[0]}
                      </div>
                      {project.category && (
                        <Badge variant="secondary">{project.category}</Badge>
                      )}
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    {project.tagline && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                        {project.tagline}
                      </p>
                    )}

                    {/* Founder */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold">
                        {project.profiles?.full_name?.[0] || 'S'}
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">{project.profiles?.full_name || 'Student'}</p>
                        {project.profiles?.university && (
                          <p className="text-xs text-muted-foreground">{project.profiles.university}</p>
                        )}
                      </div>
                    </div>

                    {/* Tech Stack */}
                    {project.tech_stack && project.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tech_stack.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.tech_stack.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.tech_stack.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Funding Goal */}
                    {project.funding_goal && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Briefcase className="h-4 w-4" />
                        <span>Seeking ${project.funding_goal.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 pb-6 pt-2 border-t border-border/50 flex items-center justify-between">
                    <div className="flex gap-2">
                      {project.demo_url && (
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                          <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {project.github_url && (
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>

                    {requestStatus ? (
                      <Badge variant={requestStatus === 'accepted' ? 'default' : requestStatus === 'rejected' ? 'destructive' : 'secondary'}>
                        {requestStatus === 'accepted' && '✓ Connected'}
                        {requestStatus === 'rejected' && 'Declined'}
                        {requestStatus === 'pending' && 'Pending'}
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-accent-gradient text-accent-foreground hover:opacity-90"
                        onClick={() => {
                          setSelectedProject(project);
                          setContactDialogOpen(true);
                        }}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="glass-card-strong">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Contact {selectedProject?.profiles?.full_name || 'Student'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 rounded-xl bg-secondary/50">
              <p className="font-semibold">{selectedProject?.title}</p>
              <p className="text-sm text-muted-foreground">{selectedProject?.tagline}</p>
            </div>
            <Textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Introduce yourself and explain your interest in this project..."
              rows={5}
              className="bg-secondary/50"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleContactStudent}
                disabled={!contactMessage.trim() || sendingMessage}
                className="bg-accent-gradient text-accent-foreground"
              >
                {sendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvestorDashboard;