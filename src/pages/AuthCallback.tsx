import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isSignedIn, userRole, loading, user } = useAuth();

  useEffect(() => {
    // Wait for auth to load
    if (loading) return;

    // Not signed in - redirect to auth
    if (!isSignedIn || !user) {
      navigate("/auth", { replace: true });
      return;
    }

    // Check for role in Clerk metadata directly
    const clerkRole = (user.unsafeMetadata?.role as "student" | "investor") || 
                      (user.publicMetadata?.role as "student" | "investor") ||
                      userRole;

    // Route to correct dashboard based on role
    if (clerkRole === "investor") {
      navigate("/investor-dashboard", { replace: true });
    } else if (clerkRole === "student") {
      navigate("/student-dashboard", { replace: true });
    } else {
      // No role found - redirect to auth to select one
      navigate("/auth", { replace: true });
    }
  }, [isSignedIn, userRole, loading, navigate, user]);

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
