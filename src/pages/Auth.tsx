import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { GraduationCap, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "investor" | null>(null);
  const { isSignedIn, userRole, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already signed in
  useEffect(() => {
    if (!loading && isSignedIn && userRole) {
      if (userRole === "investor") {
        navigate("/investor-dashboard", { replace: true });
      } else {
        navigate("/student-dashboard", { replace: true });
      }
    }
  }, [isSignedIn, userRole, loading, navigate]);

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <AnimatedBackground />

      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <img
              src={logo}
              alt="Vichaar Setu"
              className="h-10 w-10 object-contain rounded-lg"
            />
            <span className="font-display text-lg font-semibold">Vichaar Setu</span>
          </Link>

          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold mb-2">
              {isSignUp ? "Create account" : "Welcome back"}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp
                ? "Join the community of builders and investors"
                : "Sign in to continue to your dashboard"}
            </p>
          </div>

          {/* Role Selection (Sign Up only) */}
          {isSignUp && (
            <div className="mb-6">
              <span className="label-mono mb-3 block">I am a</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole("student")}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left group ${
                    selectedRole === "student"
                      ? "border-accent bg-accent/5"
                      : "border-border/60 hover:border-border hover:bg-secondary/30"
                  }`}
                >
                  <div
                    className={`inline-flex p-2 rounded-lg mb-2 transition-colors ${
                      selectedRole === "student" ? "bg-accent/20" : "bg-secondary"
                    }`}
                  >
                    <GraduationCap
                      className={`h-4 w-4 ${
                        selectedRole === "student" ? "text-accent" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <p className="font-medium text-sm">Student</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Pitch your ideas</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("investor")}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left group ${
                    selectedRole === "investor"
                      ? "border-primary bg-primary/5"
                      : "border-border/60 hover:border-border hover:bg-secondary/30"
                  }`}
                >
                  <div
                    className={`inline-flex p-2 rounded-lg mb-2 transition-colors ${
                      selectedRole === "investor" ? "bg-primary/20" : "bg-secondary"
                    }`}
                  >
                    <TrendingUp
                      className={`h-4 w-4 ${
                        selectedRole === "investor" ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <p className="font-medium text-sm">Investor</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Discover startups</p>
                </button>
              </div>
              {isSignUp && !selectedRole && (
                <p className="text-xs text-amber-500 mt-2">Please select a role to continue</p>
              )}
            </div>
          )}

          {/* Clerk SignIn/SignUp Component */}
          <div className="clerk-container">
            {isSignUp ? (
              selectedRole ? (
                <SignUp
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "bg-transparent shadow-none p-0",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton:
                        "bg-secondary/30 border-border/60 hover:bg-secondary/50 text-foreground",
                      formFieldInput:
                        "bg-secondary/30 border-border/60 text-foreground placeholder:text-muted-foreground",
                      formButtonPrimary:
                        "bg-primary text-primary-foreground hover:bg-primary/90",
                      footerActionLink: "text-primary hover:text-primary/80",
                      dividerLine: "bg-border",
                      dividerText: "text-muted-foreground",
                    },
                  }}
                  signInUrl="/auth"
                  forceRedirectUrl="/auth/callback"
                  unsafeMetadata={{ role: selectedRole }}
                />
              ) : (
                <div className="glass-card rounded-xl p-6 text-center">
                  <p className="text-muted-foreground">Select your role above to continue</p>
                </div>
              )
            ) : (
              <SignIn
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent shadow-none p-0",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton:
                      "bg-secondary/30 border-border/60 hover:bg-secondary/50 text-foreground",
                    formFieldInput:
                      "bg-secondary/30 border-border/60 text-foreground placeholder:text-muted-foreground",
                    formButtonPrimary:
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                    footerActionLink: "text-primary hover:text-primary/80",
                    dividerLine: "bg-border",
                    dividerText: "text-muted-foreground",
                  },
                }}
                signUpUrl="/auth"
                forceRedirectUrl="/auth/callback"
              />
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setSelectedRole(null);
              }}
              className="text-foreground font-medium hover:text-primary transition-colors"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-secondary/20 border-l border-border/40 p-12">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="text-xs font-medium text-primary">✦ Join 1,200+ founders</span>
            </div>
            <h2 className="font-display text-4xl font-bold mb-4">
              Build the future,
              <br />
              together
            </h2>
            <p className="text-muted-foreground">
              Whether you're launching your first startup or looking to invest in the next
              unicorn.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { number: "89%", label: "Projects funded" },
              { number: "$2.1M", label: "Total raised" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-4">
                <div className="text-2xl font-display font-bold gradient-text">
                  {stat.number}
                </div>
                <div className="label-mono mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
