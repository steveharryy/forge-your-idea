import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "How to Pitch Your Startup Idea to Investors",
    excerpt: "Learn the essential elements of a compelling pitch that captures investor attention and communicates your vision effectively.",
    author: "Vichaar Setu Team",
    date: "Dec 28, 2025",
    readTime: "5 min read",
    category: "Tips & Guides",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Student Entrepreneurs Who Changed the World",
    excerpt: "Inspiring stories of student founders who started their journey in college and built billion-dollar companies.",
    author: "Vichaar Setu Team",
    date: "Dec 25, 2025",
    readTime: "8 min read",
    category: "Inspiration",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Building Your First MVP: A Complete Guide",
    excerpt: "A step-by-step guide to building your minimum viable product without breaking the bank or burning out.",
    author: "Vichaar Setu Team",
    date: "Dec 22, 2025",
    readTime: "10 min read",
    category: "Development",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "The Art of Networking for Student Founders",
    excerpt: "Discover how to build meaningful connections that can accelerate your startup journey and open doors to opportunities.",
    author: "Vichaar Setu Team",
    date: "Dec 18, 2025",
    readTime: "6 min read",
    category: "Networking",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "Funding Options for Student Startups",
    excerpt: "Explore various funding avenues available to student entrepreneurs, from grants to angel investors.",
    author: "Vichaar Setu Team",
    date: "Dec 15, 2025",
    readTime: "7 min read",
    category: "Funding",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop"
  },
  {
    id: 6,
    title: "Balancing Studies and Startup Life",
    excerpt: "Practical tips for managing your academic responsibilities while building your dream startup.",
    author: "Vichaar Setu Team",
    date: "Dec 10, 2025",
    readTime: "5 min read",
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop"
  }
];

const Blog = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4">Blog</Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                Insights & <span className="text-gradient">Stories</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Learn from successful founders, get tips for your startup journey, 
                and stay updated with the latest in student entrepreneurship.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-8">
          <div className="container">
            <div className="relative rounded-3xl overflow-hidden bg-card border border-border/50">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="aspect-video md:aspect-auto">
                  <img 
                    src={blogPosts[0].image} 
                    alt={blogPosts[0].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <Badge className="w-fit mb-4">{blogPosts[0].category}</Badge>
                  <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                    {blogPosts[0].title}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {blogPosts[0].excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {blogPosts[0].author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {blogPosts[0].date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {blogPosts[0].readTime}
                    </span>
                  </div>
                  <Button className="w-fit gap-2">
                    Read Article <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-16">
          <div className="container">
            <h2 className="font-display text-2xl font-bold mb-8">Latest Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.slice(1).map((post) => (
                <article 
                  key={post.id}
                  className="group rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <Badge variant="secondary" className="mb-3">{post.category}</Badge>
                    <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-card/30">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-display text-3xl font-bold mb-4">
                Stay Updated
              </h2>
              <p className="text-muted-foreground mb-8">
                Get the latest articles, tips, and startup news delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none transition-colors"
                />
                <Button>Subscribe</Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Blog;
