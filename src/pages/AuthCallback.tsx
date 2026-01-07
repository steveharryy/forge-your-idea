import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isSignedIn, userRole, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!isSignedIn) {
      navigate("/auth", { replace: true });
      return;
    }

    // Route to correct dashboard based on role
    if (userRole === "investor") {
      navigate("/investor-dashboard", { replace: true });
    } else {
      navigate("/student-dashboard", { replace: true });
    }
  }, [isSignedIn, userRole, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
