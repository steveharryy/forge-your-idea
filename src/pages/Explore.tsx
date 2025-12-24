import { useState } from "react";
import { Search, SlidersHorizontal, Grid, List } from "lucide-react";
import Layout from "@/components/layout/Layout";
import StartupCard from "@/components/startup/StartupCard";
import StartupCardSkeleton from "@/components/startup/StartupCardSkeleton";
import CategoryBadge from "@/components/startup/CategoryBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startups, categories } from "@/data/mockData";
import { cn } from "@/lib/utils";

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "popular">("popular");
  const [isLoading, setIsLoading] = useState(false);

  const filteredStartups = startups
    .filter((startup) => {
      const matchesSearch =
        startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        startup.tagline.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory ||
        startup.category.toLowerCase().replace(/\s+/g, "-") === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "popular") return b.upvotes - a.upvotes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <section className="border-b border-border/50 bg-card/30">
          <div className="container py-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Explore Startups
            </h1>
            <p className="text-muted-foreground">
              Discover {startups.length}+ innovative startups building the future
            </p>
          </div>
        </section>

        <div className="container py-8">
          {/* Search & Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search startups, categories, tech stacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base bg-card border-border/50"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === "popular" ? "secondary" : "ghost"}
                onClick={() => setSortBy("popular")}
                className="gap-2"
              >
                Popular
              </Button>
              <Button
                variant={sortBy === "newest" ? "secondary" : "ghost"}
                onClick={() => setSortBy("newest")}
                className="gap-2"
              >
                Newest
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8">
            <CategoryBadge
              name="All"
              isActive={selectedCategory === null}
              onClick={() => setSelectedCategory(null)}
            />
            {categories.map((category) => (
              <CategoryBadge
                key={category.id}
                name={category.name}
                count={category.count}
                isActive={selectedCategory === category.slug}
                onClick={() => setSelectedCategory(category.slug)}
              />
            ))}
          </div>

          {/* Results */}
          <div className="space-y-4">
            {isLoading ? (
              <>
                <StartupCardSkeleton />
                <StartupCardSkeleton />
                <StartupCardSkeleton />
              </>
            ) : filteredStartups.length > 0 ? (
              filteredStartups.map((startup, index) => (
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
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  No startups found
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Explore;
