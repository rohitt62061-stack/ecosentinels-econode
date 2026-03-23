import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabase';

type UserRole = 'mcd' | 'citizen' | null;

interface AuthContextType {
  session: any;
  role: UserRole;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchRoleFromProfile(userId: string): Promise<UserRole> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data?.role) {
    // Fallback: guess from email domain if profile row doesn't exist yet
    return null;
  }
  return data.role as UserRole;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const resolveRole = async (sess: any) => {
    if (!sess) {
      setRole(null);
      return;
    }
    // Try profiles table first
    const profileRole = await fetchRoleFromProfile(sess.user.id);
    if (profileRole) {
      setRole(profileRole);
      return;
    }
    // Fallback: derive from email domain
    const email: string = sess.user.email || '';
    if (email.endsWith('@mcdindia.gov.in') || email.endsWith('@delhi.gov.in') || email.endsWith('@ndmc.gov.in')) {
      setRole('mcd');
    } else {
      setRole('citizen');
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
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
