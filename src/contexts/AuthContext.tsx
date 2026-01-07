import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { createOrUpdateUser, getUserRole } from "@/lib/database";

type UserRole = "student" | "investor" | null;

interface AuthContextType {
  user: ReturnType<typeof useUser>["user"];
  isSignedIn: boolean;
  userRole: UserRole;
  loading: boolean;
  signOut: () => Promise<void>;
  syncUser: (role?: UserRole) => Promise<void>;
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

  // Sync user to PostgreSQL database
  const syncUser = useCallback(async (role?: UserRole) => {
    if (!user) return;

    try {
      // Get role from Clerk metadata or passed parameter
      const roleToUse = role || (user.unsafeMetadata?.role as UserRole) || (user.publicMetadata?.role as UserRole);

      if (roleToUse) {
        await createOrUpdateUser({
          clerk_id: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          full_name: user.fullName || user.firstName || "",
          role: roleToUse,
          avatar_url: user.imageUrl,
        });
        setUserRole(roleToUse);
      }
    } catch (error) {
      console.error("Error syncing user:", error);
    }
  }, [user]);

  // Fetch user role from database on mount
  useEffect(() => {
    const fetchRole = async () => {
      if (!isLoaded || !isSignedIn || !user) {
        setRoleLoading(false);
        return;
      }

      try {
        // First check Clerk metadata
        const clerkRole = (user.unsafeMetadata?.role as UserRole) || (user.publicMetadata?.role as UserRole);
        
        if (clerkRole) {
          // Sync to database and set role
          await syncUser(clerkRole);
        } else {
          // Try to get from database
          const dbRole = await getUserRole(user.id);
          if (dbRole) {
            setUserRole(dbRole);
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setRoleLoading(false);
      }
    };

    fetchRole();
  }, [isLoaded, isSignedIn, user, syncUser]);

  const signOut = async () => {
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
