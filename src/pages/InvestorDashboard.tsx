import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  TrendingUp, LogOut, Search, Rocket, MessageSquare,
  Github, Loader2, Filter, Star, Send,
  Briefcase, Globe, Sparkles, Settings, User, BellRing, Lock, Palette, Edit, Sun, Moon, ExternalLink
} from 'lucide-react';
import logo from '@/assets/logo.png';
import { startups } from '@/data/mockData';

interface SentRequest {
  id: string;
  project_id: string;
  status: string;
}

const InvestorDashboard = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, userRole, signOut, loading: authLoading } = useAuth();
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<typeof startups[0] | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Redirect if not authenticated or not an investor
  if (!authLoading && (!user || userRole !== 'investor')) {
    navigate('/auth');
    return null;
  }

  const handleContactStudent = async () => {
    if (!selectedProject || !contactMessage.trim()) return;
    
    setSendingMessage(true);
    
    // Simulate sending message
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newRequest: SentRequest = {
      id: Date.now().toString(),
      project_id: selectedProject.id,
      status: 'pending',
    };
    
    setSentRequests([...sentRequests, newRequest]);
    toast.success('Message sent to the student!');
    setContactDialogOpen(false);
    setContactMessage('');
    setSelectedProject(null);
    setSendingMessage(false);
  };

  const getRequestStatus = (projectId: string) => {
    const request = sentRequests.find(r => r.project_id === projectId);
    return request?.status || null;
  };

  const categories = ['all', ...new Set(startups.map(p => p.category).filter(Boolean))];

  const filteredProjects = startups
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.techStack?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'popular') {
        return b.upvotes - a.upvotes;
      }
      return 0;
    });

  if (authLoading) {
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
              <img 
                src={logo} 
                alt="Vichaar Setu" 
                className="h-9 w-9 object-contain rounded-lg"
              />
              <span className="font-display text-xl font-bold hidden sm:block">Vichaar Setu</span>
            </Link>
            <Badge className="badge-investor">
              <TrendingUp className="h-3 w-3" />
              Investor
            </Badge>
          </div>

          <div className="flex items-center gap-3">
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
                          <span className="text-sm">New project alerts</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Response updates</span>
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
                          <span className="text-sm">Show investment history</span>
                          <Switch />
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
            Discover <span className="gradient-text-accent">Promising Startups</span>
          </h1>
          <p className="text-muted-foreground">
            Find innovative projects from talented students and connect with founders
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Projects', value: startups.length, icon: Rocket, color: 'bg-primary' },
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
                  <SelectItem value="popular">Popular</SelectItem>
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
                        {project.name[0]}
                      </div>
                      {project.category && (
                        <Badge variant="secondary">{project.category}</Badge>
                      )}
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    {project.tagline && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                        {project.tagline}
                      </p>
                    )}

                    {/* Founder */}
                    <div className="flex items-center gap-2 mb-4">
                      <img 
                        src={project.founder.avatar} 
                        alt={project.founder.name} 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{project.founder.name}</p>
                      </div>
                    </div>

                    {/* Tech Stack */}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.techStack.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.techStack.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.techStack.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-0 flex gap-2">
                    {project.website && (
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={project.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                          Demo
                        </a>
                      </Button>
                    )}
                    {project.github && (
                      <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                        <a href={project.github} target="_blank" rel="noopener noreferrer">
                          <Github className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                    {requestStatus ? (
                      <Badge variant={requestStatus === 'pending' ? 'secondary' : requestStatus === 'accepted' ? 'default' : 'outline'} className="ml-auto">
                        {requestStatus}
                      </Badge>
                    ) : (
                      <Dialog open={contactDialogOpen && selectedProject?.id === project.id} onOpenChange={(open) => {
                        setContactDialogOpen(open);
                        if (!open) {
                          setSelectedProject(null);
                          setContactMessage('');
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="ml-auto bg-primary-gradient"
                            onClick={() => setSelectedProject(project)}
                          >
                            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                            Contact
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card-strong">
                          <DialogHeader>
                            <DialogTitle className="font-display">Contact {project.founder.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold">
                                {project.name[0]}
                              </div>
                              <div>
                                <p className="font-medium">{project.name}</p>
                                <p className="text-sm text-muted-foreground">{project.tagline}</p>
                              </div>
                            </div>
                            <Textarea
                              value={contactMessage}
                              onChange={(e) => setContactMessage(e.target.value)}
                              placeholder="Introduce yourself and explain why you're interested in this project..."
                              rows={4}
                            />
                            <div className="flex gap-3">
                              <Button variant="outline" className="flex-1" onClick={() => setContactDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button 
                                className="flex-1 bg-primary-gradient" 
                                onClick={handleContactStudent}
                                disabled={sendingMessage || !contactMessage.trim()}
                              >
                                {sendingMessage ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Send className="h-4 w-4 mr-2" />
                                )}
                                Send Message
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default InvestorDashboard;
