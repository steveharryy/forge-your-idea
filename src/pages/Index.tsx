import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, Sparkles, Zap, Users, Trophy } from "lucide-react";
import Layout from "@/components/layout/Layout";
import StartupCard from "@/components/startup/StartupCard";
import CategoryBadge from "@/components/startup/CategoryBadge";
import { startups, categories, getFeaturedStartups } from "@/data/mockData";

const Index = () => {
  const featuredStartups = getFeaturedStartups();
  const trendingStartups = [...startups].sort((a, b) => b.upvotes - a.upvotes).slice(0, 5);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container relative py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 backdrop-blur-sm border border-border/50 mb-6 animate-fade-up">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Where founders launch the future
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-up stagger-1">
              Discover & Launch{" "}
              <span className="gradient-text">Groundbreaking</span>{" "}
              Startups
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up stagger-2">
              Join the community of builders, founders, and early adopters. 
              Pitch your ideas, discover innovative products, and support the next unicorns.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up stagger-3">
              <Button variant="hero" size="xl" asChild>
                <Link to="/explore" className="gap-2">
                  Explore Startups
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/submit">Submit Your Idea</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-border/50 animate-fade-up stagger-4">
              <div>
                <div className="font-display text-3xl md:text-4xl font-bold text-foreground">1,200+</div>
                <div className="text-sm text-muted-foreground mt-1">Startups Launched</div>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl font-bold text-foreground">50K+</div>
                <div className="text-sm text-muted-foreground mt-1">Community Members</div>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl font-bold text-foreground">$2M+</div>
                <div className="text-sm text-muted-foreground mt-1">Funding Raised</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-20 bg-card/30">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">Editor's Picks</h2>
                <p className="text-sm text-muted-foreground">Hand-picked by our team</p>
              </div>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link to="/featured" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredStartups.map((startup, index) => (
              <div
                key={startup.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <StartupCard
                  id={startup.id}
                  name={startup.name}
                  tagline={startup.tagline}
                  logo={startup.logo}
                  category={startup.category}
                  upvotes={startup.upvotes}
                  isFeatured={startup.isFeatured}
                  founder={{
                    name: startup.founder.name,
                    avatar: startup.founder.avatar,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">Trending Now</h2>
                <p className="text-sm text-muted-foreground">Most upvoted this week</p>
              </div>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link to="/explore" className="gap-2">
                See More
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {trendingStartups.map((startup, index) => (
              <div
                key={startup.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <StartupCard
                  id={startup.id}
                  name={startup.name}
                  tagline={startup.tagline}
                  logo={startup.logo}
                  category={startup.category}
                  upvotes={startup.upvotes}
                  isFeatured={startup.isFeatured}
                  founder={{
                    name: startup.founder.name,
                    avatar: startup.founder.avatar,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-card/30">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
              Explore by Category
            </h2>
            <p className="text-muted-foreground">
              Find startups in your favorite domains
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Link key={category.id} to={`/categories/${category.slug}`}>
                <CategoryBadge
                  name={category.name}
                  count={category.count}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl bg-primary-gradient p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYtMmg0djJoMnY0aC0ydjJoLTR2LTJ6bTAtOGgtMnYtNGgydjR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
            
            <div className="relative">
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm">
                  <Flame className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Launch Your Idea?
              </h2>
              <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto mb-8">
                Join thousands of founders who've launched their startups on IdeaForge. 
                Get feedback, find early adopters, and make your vision a reality.
              </p>
              
              <Button
                variant="glass"
                size="xl"
                asChild
                className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-primary-foreground/30"
              >
                <Link to="/submit" className="gap-2">
                  Submit Your Startup
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
