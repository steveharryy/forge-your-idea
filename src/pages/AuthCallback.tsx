import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { syncUser } = useAuth();
  const { user, isLoaded } = useUser();
  const [status, setStatus] = useState("Loading...");
  const syncAttempted = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Wait for Clerk to fully load
      if (!isLoaded) {
        setStatus("Loading authentication...");
        return;
      }

      // Not signed in - redirect to auth
      if (!user) {
        console.log("AuthCallback: No user, redirecting to /auth");
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
        unsafeMetadata: user.unsafeMetadata,
      });

      // Step 1: Check if role already exists in publicMetadata
      let role = user.publicMetadata?.role as "student" | "investor" | undefined;

      if (role) {
        console.log("AuthCallback: Role found in publicMetadata:", role);
      } else {
        // Step 2: Role not in publicMetadata - check unsafeMetadata (set during signup)
        const unsafeRole = user.unsafeMetadata?.role as "student" | "investor" | undefined;

        if (unsafeRole) {
          console.log("AuthCallback: Role found in unsafeMetadata, syncing to publicMetadata:", unsafeRole);
          setStatus("Setting up your account...");

          // Call edge function to sync role to publicMetadata
          const synced = await syncRoleToPublicMetadata(user.id, unsafeRole);
          
          if (synced) {
            // Reload user to get updated publicMetadata
            try {
              await user.reload();
              console.log("AuthCallback: User reloaded, publicMetadata:", user.publicMetadata);
              role = user.publicMetadata?.role as "student" | "investor" | undefined;
              
              if (!role) {
                // Fallback to unsafeRole if reload didn't work
                console.warn("AuthCallback: Role not in publicMetadata after reload, using unsafeRole");
                role = unsafeRole;
              }
            } catch (reloadError) {
              console.error("AuthCallback: Error reloading user:", reloadError);
              role = unsafeRole;
            }
          } else {
            // Edge function failed but we can still proceed with unsafeRole
            console.warn("AuthCallback: Edge function failed, proceeding with unsafeRole");
            role = unsafeRole;
          }
        }
      }

      // Step 3: Redirect based on role
      if (role) {
        // Sync to AuthContext and database
        await syncUser(role);

        console.log("AuthCallback: Redirecting to dashboard for role:", role);
        if (role === "investor") {
          navigate("/investor-dashboard", { replace: true });
        } else {
          navigate("/student-dashboard", { replace: true });
        }
      } else {
        // No role found - new signup needs to select role
        console.log("AuthCallback: No role found, redirecting to signup");
        navigate("/auth?mode=sign-up", { replace: true });
      }
    };

    handleCallback();
  }, [isLoaded, navigate, user, syncUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
};

/**
 * Calls the sync-clerk-role edge function to persist role to Clerk publicMetadata
 */
async function syncRoleToPublicMetadata(
  userId: string,
  role: "student" | "investor"
): Promise<boolean> {
  // Check if Supabase is configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("AuthCallback: Supabase env vars missing, cannot sync role to publicMetadata");
    return false;
  }

  try {
    // Dynamically import supabase client
    const { supabase } = await import("@/integrations/supabase/client");

    const { data, error } = await supabase.functions.invoke("sync-clerk-role", {
      body: { userId, role },
    });

    if (error) {
      console.error("AuthCallback: Edge function error:", error);
      return false;
    }

    console.log("AuthCallback: Role synced to publicMetadata:", data);
    return true;
  } catch (err) {
    console.error("AuthCallback: Exception calling edge function:", err);
    return false;
  }
}

export default AuthCallback;
