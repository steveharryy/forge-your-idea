import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";

type UserRole = "student" | "investor" | null;

interface AuthContextType {
  user: ReturnType<typeof useUser>["user"];
  isSignedIn: boolean;
  userRole: UserRole;
  loading: boolean;
  signOut: () => Promise<void>;
  syncUser: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerkAuth();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  // Sync user role - sets local state and optionally syncs to database
  const syncUser = useCallback(async (role: UserRole) => {
    if (!user || !role) return;

    console.log("AuthContext.syncUser called with role:", role);
    
    // Set role in state immediately
    setUserRole(role);
    setRoleLoading(false);

    // Try to sync to database if API is configured
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
      try {
        const { createOrUpdateUser } = await import("@/lib/database");
        await createOrUpdateUser({
          clerk_id: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          full_name: user.fullName || user.firstName || "",
          role: role,
          avatar_url: user.imageUrl,
        });
        console.log("AuthContext: Synced user to database");
      } catch (dbError) {
        console.error("AuthContext: Error syncing to database:", dbError);
        // Don't fail - role is already set locally
      }
    }
  }, [user]);

  // On mount/user change: role comes ONLY from Clerk publicMetadata.role
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      setUserRole(null);
      setRoleLoading(false);
      return;
    }

    setRoleLoading(true);

    const role = user.publicMetadata?.role as UserRole;
    console.log("AuthContext: publicMetadata role:", role);

    setUserRole(role ?? null);
    setRoleLoading(false);
  }, [isLoaded, isSignedIn, user]);

  const signOut = async () => {
    console.log("AuthContext: Signing out");
    setUserRole(null);
    await clerkSignOut();
  };

  const loading = !isLoaded || roleLoading;

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isSignedIn: isSignedIn ?? false,
        userRole,
        loading,
        signOut,
        syncUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
