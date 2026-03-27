import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '../utils/supabase';

type UserRole = 'mcd' | 'citizen' | null;

interface AuthContextType {
  session: any;
  user: any;
  role: UserRole;
  isNewUser: boolean;
  loading: boolean;
  isReady: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<UserRole>(() => {
    // Initial role state from localStorage for zero-flash feel
    return (localStorage.getItem('userRole') as UserRole) || null;
  });
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const activeUserId = useRef<string | null>(null);

  const resolveRole = async (sess: any) => {
    console.log('[AuthContext] resolveRole started', { hasSess: !!sess });
    try {
      if (!sess || !sess?.user) {
        activeUserId.current = null;
        setRole(null);
        return;
      }

      const { user } = sess;
      if (activeUserId.current === user?.id && role !== null) {
        console.log('[AuthContext] resolveRole: role already resolved for', user.id);
        return;
      }
      activeUserId.current = user?.id || null;

      if (!user?.id) return;

      console.log('[AuthContext] checking existing profile for', user.id);
      // 1. Check if profile exists BEFORE upserting to detect new users
      const { data: existingProfile, error: fetchErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      console.log('[AuthContext] existing profile check result:', { hasProfile: !!existingProfile, fetchErr });
      if (!existingProfile) {
        setIsNewUser(true);
      }

      console.log('[AuthContext] upserting profile for', user.id);
      // 2. Fetch or create profile as 'citizen' by default
      const { data: profile, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          role: 'citizen'
        }, { onConflict: 'id', ignoreDuplicates: true })
        .select('role')
        .single();

      if (error) {
        console.error('[AuthContext] upsert/fetch error:', error);
        throw error;
      }
      
      const resolvedRole = (profile?.role as UserRole) ?? 'citizen';
      console.log('[AuthContext] role resolved successfully:', resolvedRole);
      setRole(resolvedRole);
      localStorage.setItem('userRole', resolvedRole || 'citizen');
    } catch (err) {
      activeUserId.current = null;
      console.error('[AuthContext] Auth resolution error:', err);
      setRole(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      console.log('[AuthContext] initAuth started');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('[AuthContext] getSession result:', { hasSession: !!session, error });
        if (!mounted) return;
        
        if (error) {
          console.error('[AuthContext] Session error:', error);
          setSession(null);
          setRole(null);
          setLoading(false);
          return;
        }

        setSession(session);
        await resolveRole(session);
      } catch (error) {
        if (!mounted) return;
        console.error('[AuthContext] AuthContext initialization failed:', error);
        // Set safe defaults instead of crashing:
        setSession(null);
        setRole(null);
      } finally {
        if (mounted) {
          console.log('[AuthContext] initAuth finally: setting loading to false');
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
      isNewUser,
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
