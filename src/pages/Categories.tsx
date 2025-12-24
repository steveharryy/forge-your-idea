import { Link, useParams } from "react-router-dom";
import {
  Brain,
  Cloud,
  Code,
  Wallet,
  Heart,
  ShoppingBag,
  Zap,
  GraduationCap,
  ArrowLeft,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import StartupCard from "@/components/startup/StartupCard";
import { categories, startups, getStartupsByCategory } from "@/data/mockData";
import { LucideIcon } from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
  "ai-ml": Brain,
  saas: Cloud,
  "developer-tools": Code,
  fintech: Wallet,
  "health-wellness": Heart,
  ecommerce: ShoppingBag,
  productivity: Zap,
  education: GraduationCap,
};

const Categories = () => {
  const { slug } = useParams<{ slug?: string }>();

  if (slug) {
    const category = categories.find((c) => c.slug === slug);
    const categoryStartups = getStartupsByCategory(slug);
    const Icon = categoryIcons[slug] || Zap;

    if (!category) {
      return (
        <Layout>
          <div className="container py-20 text-center">
            <h1 className="font-display text-3xl font-bold mb-4">
              Category Not Found
            </h1>
            <p className="text-muted-foreground mb-8">
              The category you're looking for doesn't exist.
            </p>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Browse All Categories
            </Link>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        {/* Category Header */}
        <section className="border-b border-border/50 bg-card/30">
          <div className="container py-8">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              All Categories
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">
                  {category.name}
                </h1>
                <p className="text-muted-foreground">
                  {categoryStartups.length} startups in this category
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Startups List */}
        <section className="container py-12">
          {categoryStartups.length > 0 ? (
            <div className="space-y-4">
              {categoryStartups.map((startup, index) => (
                <div
                  key={startup.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
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
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                <Icon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                No startups yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Be the first to submit a startup in {category.name}!
              </p>
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Submit Startup
              </Link>
            </div>
          )}
        </section>
      </Layout>
    );
  }

  // All Categories View
  return (
    <Layout>
      <section className="border-b border-border/50 bg-card/30">
        <div className="container py-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Categories
          </h1>
          <p className="text-muted-foreground">
            Browse startups by domain and industry
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => {
            const Icon = categoryIcons[category.slug] || Zap;
            const categoryCount = startups.filter(
              (s) =>
                s.category.toLowerCase().replace(/\s+/g, "-") === category.slug
            ).length;

            return (
              <Link
                key={category.id}
                to={`/categories/${category.slug}`}
                className="group glass-card rounded-2xl p-6 hover-lift animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {categoryCount} startups
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </Layout>
  );
};

export default Categories;
