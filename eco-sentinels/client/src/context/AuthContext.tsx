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
  const activeUserId = useRef<string | null>(null);

  const resolveRole = async (sess: any) => {
    try {
      if (!sess || !sess?.user) {
        activeUserId.current = null;
        setRole(null);
        return;
      }

      const { user } = sess;
      if (activeUserId.current === user?.id && role !== null) return;
      activeUserId.current = user?.id || null;

      if (!user?.id) return;

      // 1. Fetch or create profile as 'citizen' by default
      const { data: profile, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          role: 'citizen' // ALWAYS citizen by default — MCD is granted manually in DB
        }, { onConflict: 'id', ignoreDuplicates: true })
        .select('role')
        .single();

      if (error) throw error;
      setRole((profile?.role as UserRole) ?? 'citizen');
    } catch (err) {
      activeUserId.current = null;
      console.error('Auth resolution error:', err);
      setRole(null);
    }
    // We defer setLoading to the effects calling this function.
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;
        
        if (error) {
          console.error('Session error:', error);
          setSession(null);
          setRole(null);
          setLoading(false);
          return;
        }

        setSession(session);
        await resolveRole(session);
      } catch (error) {
        if (!mounted) return;
        console.error('AuthContext initialization failed:', error);
        // Set safe defaults instead of crashing:
        setSession(null);
        setRole(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      try {
        setSession(session);
        await resolveRole(session);
      } catch (err) {
        console.error('Auth state change error:', err);
        setSession(null);
        setRole(null);
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
      isReady: !loading,
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
