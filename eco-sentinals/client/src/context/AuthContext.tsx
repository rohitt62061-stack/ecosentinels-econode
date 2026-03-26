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

async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, ward_id')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

async function createProfile(userId: string, fullName: string, role: UserRole = 'citizen') {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, full_name: fullName, role })
    .select()
    .single();

  if (error) {
    if (error.code !== '23505') {
      console.error('Error creating profile:', error);
    }
    return null;
  }
  return data;
}

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
      let profile = await fetchProfile(user.id);
      
      if (!profile) {
        profile = await createProfile(
          user.id, 
          user.user_metadata?.full_name || user.email?.split('@')[0] || 'New User',
          'citizen'
        );

        if (!profile) {
          profile = await fetchProfile(user.id);
        }
      }

      if (profile) {
        setRole(profile.role as UserRole);

        const selectedRole = sessionStorage.getItem('selected_role');
        if (selectedRole === 'mcd' && profile.role !== 'mcd') {
          window.location.href = '/mcd/login?error=unauthorized';
          return;
        }
      } else {
        activeUserId.current = null;
      }
    } catch (err) {
      activeUserId.current = null;
      console.error('Resolution error:', err);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      await resolveRole(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      await resolveRole(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    activeUserId.current = null;
    setIsReady(false);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user: session?.user ?? null, 
      role, 
      loading, 
      isReady: isReady && !loading, // isReady true only when loading finished
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
