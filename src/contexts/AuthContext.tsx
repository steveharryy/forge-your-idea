import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "student" | "investor" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: "student" | "investor"
  ) => Promise<{ error: any }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: any }>;
  signInWithGoogle: (
    role?: "student" | "investor"
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Read role from OAuth state (Google redirect)
  const getRoleFromOAuthState = (): UserRole => {
    const hash = window.location.hash;
    if (!hash) return null;

    const params = new URLSearchParams(hash.replace("#", ""));
    const state = params.get("state");
    if (!state) return null;

    try {
      const decoded = JSON.parse(atob(state));
      return decoded.role ?? null;
    } catch {
      return null;
    }
  };

  // 🔹 Fetch role OR create role for OAuth users
  const fetchOrCreateUserRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    // If role already exists, use it
    if (data?.role) {
      setUserRole(data.role as UserRole);
      return;
    }

    // 👇 Use role from OAuth state if present (for sign-up)
    const oauthRole = getRoleFromOAuthState();
    if (oauthRole) {
      await supabase.from("user_roles").insert({
        user_id: userId,
        role: oauthRole,
      });
      setUserRole(oauthRole);
    } else {
      // For sign-in, role should already exist, but if not, default to student
      setUserRole("student");
    }
  };

  // 🔹 Handle session load + OAuth redirect
  useEffect(() => {
    let active = true;

    const syncRole = (userId: string) => {
      // Never call Supabase inside onAuthStateChange callback; defer it.
      setTimeout(() => {
        if (!active) return;
        fetchOrCreateUserRole(userId);
      }, 0);
    };

    // Listener FIRST (prevents missing events)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        syncRole(nextSession.user.id);
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    // THEN check existing session
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;

      setSession(data.session);
      setUser(data.session?.user ?? null);

      if (data.session?.user) {
        syncRole(data.session.user.id);
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // 🔹 Email/password signup
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: "student" | "investor"
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (!error && data.user) {
      await supabase.from("user_roles").insert({
        user_id: data.user.id,
        role,
      });

      setUserRole(role);
    }

    return { error };
  };

  // 🔹 Email/password login
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };



const signInWithGoogle = async (role?: "student" | "investor") => {
  const redirectUrl = `${window.location.origin}/auth/callback`;
  const state = role ? btoa(JSON.stringify({ role })) : undefined;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
      ...(state && {
        queryParams: {
          state,
        },
      }),
    },
  });

  return { error };
};


  // 🔹 Logout
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRole,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
