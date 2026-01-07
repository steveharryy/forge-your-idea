import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isSignedIn, userRole, loading, syncUser } = useAuth();
  const { user, isLoaded } = useUser();
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Wait for Clerk to load
    if (!isLoaded || loading) return;

    // Not signed in - redirect to auth
    if (!isSignedIn || !user) {
      navigate("/auth", { replace: true });
      return;
    }

    // Check for role in Clerk metadata directly (freshest source after signup)
    const clerkRole = (user.unsafeMetadata?.role as "student" | "investor") || 
                      (user.publicMetadata?.role as "student" | "investor") ||
                      userRole;

    if (clerkRole) {
      // Sync the role to context and database
      syncUser(clerkRole);
      
      // Route to correct dashboard based on role
      if (clerkRole === "investor") {
        navigate("/investor-dashboard", { replace: true });
      } else {
        navigate("/student-dashboard", { replace: true });
      }
    } else {
      // Role not found yet - might be a timing issue with Clerk metadata
      // Wait a bit and retry (up to 5 attempts)
      if (attempts < 5) {
        const timeout = setTimeout(() => {
          setAttempts(prev => prev + 1);
        }, 500);
        return () => clearTimeout(timeout);
      } else {
        // After 5 attempts, redirect to auth to select role
        navigate("/auth?mode=sign-up", { replace: true });
      }
    }
  }, [isSignedIn, userRole, loading, navigate, user, isLoaded, syncUser, attempts]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Setting up your account...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
