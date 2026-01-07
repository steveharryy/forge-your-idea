import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isSignedIn, userRole, loading, syncUser, user } = useAuth();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (loading) return;

      if (!isSignedIn || !user) {
        navigate("/auth", { replace: true });
        return;
      }

      // If no role yet, try to sync from Clerk metadata
      if (!userRole && !syncing) {
        setSyncing(true);
        try {
          const role = (user.unsafeMetadata?.role as "student" | "investor") || 
                       (user.publicMetadata?.role as "student" | "investor");
          
          if (role) {
            await syncUser(role);
          }
        } catch (error) {
          console.error("Error syncing user:", error);
        }
        setSyncing(false);
        return;
      }

      // Route to correct dashboard based on role
      if (userRole === "investor") {
        navigate("/investor-dashboard", { replace: true });
      } else if (userRole === "student") {
        navigate("/student-dashboard", { replace: true });
      } else {
        // No role found - redirect to auth to select one
        navigate("/auth", { replace: true });
      }
    };

    handleCallback();
  }, [isSignedIn, userRole, loading, navigate, syncUser, user, syncing]);

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
