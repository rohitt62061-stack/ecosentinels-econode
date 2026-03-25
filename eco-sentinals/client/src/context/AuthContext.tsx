import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '../utils/supabase';

type UserRole = 'mcd' | 'citizen' | null;

interface AuthContextType {
  session: any;
  role: UserRole;
  loading: boolean;
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
    // Only log if it's not a duplicate key error (which can happen during race conditions)
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
  const activeUserId = useRef<string | null>(null);

  const resolveRole = async (sess: any) => {
    if (!sess) {
      activeUserId.current = null;
      setRole(null);
      return;
    }

    const { user } = sess;
    // Prevent concurrent resolutions for the same user
    if (activeUserId.current === user.id) return;
    activeUserId.current = user.id;

    try {
      // 1. Try to fetch existing profile
      let profile = await fetchProfile(user.id);
      
      if (!profile) {
        // 2. If NO profile exists (New User)
        // Always default to 'citizen' for new users for security
        profile = await createProfile(
          user.id, 
          user.user_metadata?.full_name || user.email?.split('@')[0] || 'New User',
          'citizen'
        );

        // If createProfile failed but it was a race (another request created it), try fetching again
        if (!profile) {
          profile = await fetchProfile(user.id);
        }
      }

      if (profile) {
        setRole(profile.role as UserRole);

        // 3. Handle unauthorized MCD registration attempts
        const selectedRole = sessionStorage.getItem('selected_role');
        if (selectedRole === 'mcd' && profile.role !== 'mcd') {
          // Redirect back to login with error - they are now registered as citizen but don't have MCD access
          window.location.href = '/mcd/login?error=unauthorized';
          return;
        }
      } else {
        // Reset lock on failure so it can be re-attempted
        activeUserId.current = null;
      }
    } catch (err) {
      activeUserId.current = null;
      console.error('Resolution error:', err);
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
