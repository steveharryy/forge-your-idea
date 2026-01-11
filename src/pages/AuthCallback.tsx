import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

type Role = "student" | "investor";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { syncUser } = useAuth();
  const { user, isLoaded } = useUser();
  const { getToken } = useClerkAuth();

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

      // Prevent duplicate attempts (Clerk can re-render callback)
      if (syncAttempted.current) return;
      syncAttempted.current = true;

      const publicRole = user.publicMetadata?.role as Role | undefined;
      const unsafeRole = user.unsafeMetadata?.role as Role | undefined;

      console.log("AuthCallback: Roles detected", { publicRole, unsafeRole });

      // During sign-up, the chosen role lives in unsafeMetadata initially.
      // We MUST persist it to publicMetadata via backend (always overwrite).
      if (unsafeRole) {
        setStatus("Finalizing your account...");

        const synced = await persistRoleToClerkPublicMetadata(getToken, unsafeRole);
        if (synced) {
          try {
            await user.reload();
          } catch (e) {
            console.warn("AuthCallback: user.reload failed", e);
          }
        }
      }

      const role = (user.publicMetadata?.role as Role | undefined) ?? unsafeRole;

      if (!role) {
        console.log("AuthCallback: No role found, redirecting to sign-up");
        navigate("/auth?mode=sign-up", { replace: true });
        return;
      }

      await syncUser(role);

      console.log("AuthCallback: Redirecting to dashboard for role:", role);
      navigate(role === "investor" ? "/investor-dashboard" : "/student-dashboard", {
        replace: true,
      });
    };

    handleCallback();
  }, [getToken, isLoaded, navigate, syncUser, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
};

async function persistRoleToClerkPublicMetadata(
  getToken: () => Promise<string | null>,
  role: Role
): Promise<boolean> {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;

  if (!apiUrl) {
    console.warn("AuthCallback: VITE_API_URL missing, cannot persist role");
    return false;
  }

  const token = await getToken();
  if (!token) {
    console.warn("AuthCallback: Missing Clerk token, cannot persist role");
    return false;
  }

  try {
    const res = await fetch(`${apiUrl}/api/sync-role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      console.error("AuthCallback: /api/sync-role failed", json);
      return false;
    }

    return true;
  } catch (err) {
    console.error("AuthCallback: Exception calling /api/sync-role:", err);
    return false;
  }
}

export default AuthCallback;
