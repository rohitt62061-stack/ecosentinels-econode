import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '../utils/supabase';

type UserRole = 'mcd' | 'citizen' | null;

interface AuthContextType {
  session: any;
  user: any;
  role: UserRole;
  loading: boolean;
  isReady: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const activeUserId = useRef<string | null>(null);

  const resolveRole = async (sess: any) => {
    if (!sess) {
      activeUserId.current = null;
      setRole(null);
      setIsReady(true); // Confirmed no session
      return;
    }

    const { user } = sess;
    if (activeUserId.current === user.id) return;
    activeUserId.current = user.id;

    try {
      // 1. Fetch or create profile as 'citizen' by default
      const { data: profile, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          role: 'citizen' // ALWAYS citizen by default — MCD is granted manually in DB
        }, { onConflict: 'id', ignoreDuplicates: true }) // Only insert if not exists
        .select('role')
        .single();

      if (error) throw error;

      if (profile) {
        setRole(profile.role as UserRole);

        // 2. Strict check for MCD session selection
        const selectedRole = sessionStorage.getItem('selected_role');
        if (selectedRole === 'mcd' && profile.role !== 'mcd') {
          // Dangerous fallback to domain-based role is REMOVED.
          // Profiles table is the ONLY source of truth.
          window.location.href = '/mcd/login?error=unauthorized';
          return;
        }
      }
    } catch (err) {
      activeUserId.current = null;
      console.error('Auth resolution error:', err);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        await resolveRole(session);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      await resolveRole(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    activeUserId.current = null;
    setLoading(true);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user: session?.user ?? null, 
      role, 
      loading, 
      isReady: !loading, // isReady is true exactly when loading finishes
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
