import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUp,
  ExternalLink,
  Github,
  Share2,
  Star,
  MessageCircle,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStartupById, startups } from "@/data/mockData";
import StartupCard from "@/components/startup/StartupCard";

const StartupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const startup = getStartupById(id || "");

  if (!startup) {
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

  const relatedStartups = startups
    .filter((s) => s.category === startup.category && s.id !== startup.id)
    .slice(0, 3);

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
                  src={startup.logo}
                  alt={startup.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-display text-3xl lg:text-4xl font-bold">
                  {startup.name}
                </h1>
                {startup.isFeatured && (
                  <span className="badge-featured">
                    <Star className="h-3 w-3" />
                    Featured
                  </span>
                )}
              </div>

              <p className="text-lg text-muted-foreground mb-4">
                {startup.tagline}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="secondary" className="text-sm">
                  {startup.category}
                </Badge>
                <div className="flex items-center gap-2">
                  <img
                    src={startup.founder.avatar}
                    alt={startup.founder.name}
                    className="h-6 w-6 rounded-full ring-1 ring-border"
                  />
                  <span className="text-sm text-muted-foreground">
                    by{" "}
                    <Link
                      to={`/profile/${startup.founder.id}`}
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      {startup.founder.name}
                    </Link>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <Button variant="hero" size="lg" className="gap-2">
                <ArrowUp className="h-5 w-5" />
                Upvote ({startup.upvotes})
              </Button>
              <div className="flex gap-2">
                {startup.website && (
                  <Button variant="outline" size="lg" asChild className="flex-1 lg:flex-none">
                    <a
                      href={startup.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Website
                    </a>
                  </Button>
                )}
                {startup.github && (
                  <Button variant="outline" size="icon" asChild>
                    <a
                      href={startup.github}
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
                {startup.description}
              </p>
            </section>

            {/* Problem */}
            <section className="glass-card rounded-2xl p-6">
              <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  ?
                </span>
                The Problem
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {startup.problem}
              </p>
            </section>

            {/* Solution */}
            <section className="glass-card rounded-2xl p-6">
              <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  ✓
                </span>
                The Solution
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {startup.solution}
              </p>
            </section>

            {/* Tech Stack */}
            <section>
              <h2 className="font-display text-xl font-semibold mb-4">
                Tech Stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {startup.techStack.map((tech) => (
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Founder Card */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-4">About the Founder</h3>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={startup.founder.avatar}
                  alt={startup.founder.name}
                  className="h-12 w-12 rounded-full ring-2 ring-border"
                />
                <div>
                  <p className="font-medium">{startup.founder.name}</p>
                  <a
                    href={`https://github.com/${startup.founder.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <Github className="h-3 w-3" />
                    @{startup.founder.github}
                  </a>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {startup.founder.bio}
              </p>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to={`/profile/${startup.founder.id}`}>View Profile</Link>
              </Button>
            </div>

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
        {relatedStartups.length > 0 && (
          <section className="mt-16 pt-12 border-t border-border/50">
            <h2 className="font-display text-2xl font-bold mb-6">
              More in {startup.category}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedStartups.map((related) => (
                <StartupCard
                  key={related.id}
                  id={related.id}
                  name={related.name}
                  tagline={related.tagline}
                  logo={related.logo}
                  category={related.category}
                  upvotes={related.upvotes}
                  founder={{
                    name: related.founder.name,
                    avatar: related.founder.avatar,
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
