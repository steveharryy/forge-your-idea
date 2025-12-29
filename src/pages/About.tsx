import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Target, Lightbulb, Heart, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";

const About = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-8">
                <img 
                  src={logo} 
                  alt="Vichaar Setu" 
                  className="h-24 w-24 object-contain rounded-2xl"
                />
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                About <span className="text-gradient">Vichaar Setu</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Vichaar Setu, meaning "Bridge of Ideas" in Hindi, is a platform designed to connect 
                student innovators with investors who believe in the power of fresh perspectives.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-card/30">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                  Our Mission
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  We believe that the next generation of groundbreaking ideas will come from students 
                  who dare to think differently. Our mission is to provide a platform where these 
                  ideas can flourish and find the support they need to become reality.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  By bridging the gap between student entrepreneurs and investors, we're creating 
                  an ecosystem where innovation thrives and dreams take flight.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20">
                  <Target className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-display font-semibold text-lg mb-2">Vision</h3>
                  <p className="text-sm text-muted-foreground">
                    Empowering student innovators globally
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-secondary/10 border border-secondary/20">
                  <Lightbulb className="h-10 w-10 text-secondary mb-4" />
                  <h3 className="font-display font-semibold text-lg mb-2">Innovation</h3>
                  <p className="text-sm text-muted-foreground">
                    Fostering creative solutions
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-accent/10 border border-accent/20">
                  <Users className="h-10 w-10 text-accent mb-4" />
                  <h3 className="font-display font-semibold text-lg mb-2">Community</h3>
                  <p className="text-sm text-muted-foreground">
                    Building meaningful connections
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20">
                  <Heart className="h-10 w-10 text-destructive mb-4" />
                  <h3 className="font-display font-semibold text-lg mb-2">Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Nurturing ideas to success
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Our Values
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                These core principles guide everything we do at Vichaar Setu
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-2xl border border-border/50 bg-card/50 hover:border-primary/50 transition-colors">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">Transparency</h3>
                <p className="text-muted-foreground">
                  Open and honest communication between students and investors builds trust and lasting partnerships.
                </p>
              </div>
              <div className="text-center p-8 rounded-2xl border border-border/50 bg-card/50 hover:border-primary/50 transition-colors">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">Inclusivity</h3>
                <p className="text-muted-foreground">
                  Every student deserves a chance to showcase their ideas, regardless of their background or resources.
                </p>
              </div>
              <div className="text-center p-8 rounded-2xl border border-border/50 bg-card/50 hover:border-primary/50 transition-colors">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">Excellence</h3>
                <p className="text-muted-foreground">
                  We encourage students to push boundaries and strive for excellence in their entrepreneurial journey.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-card/30">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Ready to Join the Journey?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Whether you're a student with a groundbreaking idea or an investor looking for the next big thing, 
                Vichaar Setu is your bridge to success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/auth">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/explore">Explore Projects</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
