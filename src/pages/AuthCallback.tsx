import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isSignedIn, loading, syncUser } = useAuth();
  const { user, isLoaded } = useUser();
  const [status, setStatus] = useState("Loading...");
  const syncAttempted = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Wait for Clerk to fully load
      if (!isLoaded || loading) {
        setStatus("Loading authentication...");
        return;
      }

      // Not signed in - redirect to auth
      if (!isSignedIn || !user) {
        console.log("AuthCallback: Not signed in, redirecting to /auth");
        navigate("/auth", { replace: true });
        return;
      }

      // Prevent duplicate sync attempts
      if (syncAttempted.current) {
        return;
      }
      syncAttempted.current = true;

      console.log("AuthCallback: User loaded", { 
        userId: user.id,
        publicMetadata: user.publicMetadata,
        unsafeMetadata: user.unsafeMetadata 
      });

      // Check publicMetadata first (already synced)
      let role = user.publicMetadata?.role as "student" | "investor" | undefined;

      if (role) {
        console.log("AuthCallback: Role found in publicMetadata:", role);
      } else {
        // Role not in publicMetadata, check unsafeMetadata and sync
        const unsafeRole = user.unsafeMetadata?.role as "student" | "investor" | undefined;
        
        if (unsafeRole) {
          console.log("AuthCallback: Role found in unsafeMetadata, syncing to publicMetadata:", unsafeRole);
          setStatus("Setting up your account...");

          try {
            // IMPORTANT: don't import the backend client at module scope.
            // If Vercel env vars aren't set, it can crash the whole app on load.
            const hasBackendEnv =
              Boolean(import.meta.env.VITE_SUPABASE_URL) &&
              Boolean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

            if (!hasBackendEnv) {
              console.warn(
                "AuthCallback: Backend env missing; cannot sync role to publicMetadata on this deployment.",
              );
              // Still allow the user through based on the selected role.
              role = unsafeRole;
            } else {
              const { supabase } = await import("@/integrations/supabase/client");
              const { data, error } = await supabase.functions.invoke("sync-clerk-role", {
                body: { userId: user.id, role: unsafeRole },
              });

              if (error) {
                console.error("AuthCallback: Error syncing role:", error);
                // Fallback: proceed with role so user isn't bounced back to /auth
                role = unsafeRole;
              } else {
                console.log("AuthCallback: Role synced successfully:", data);
                role = unsafeRole;
              }
            }
          } catch (err) {
            console.error("AuthCallback: Exception syncing role:", err);
            // Fallback: proceed with role so user isn't bounced back to /auth
            role = unsafeRole;
          }
        }
      }

      if (role) {
        // Sync to AuthContext and database
        await syncUser(role);
        
        // Redirect to appropriate dashboard
        console.log("AuthCallback: Redirecting to dashboard for role:", role);
        if (role === "investor") {
          navigate("/investor-dashboard", { replace: true });
        } else {
          navigate("/student-dashboard", { replace: true });
        }
      } else {
        // No role found anywhere - redirect to signup to select role
        console.log("AuthCallback: No role found, redirecting to signup");
        navigate("/auth?mode=sign-up", { replace: true });
      }
    };

    handleCallback();
  }, [isSignedIn, loading, navigate, user, isLoaded, syncUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
