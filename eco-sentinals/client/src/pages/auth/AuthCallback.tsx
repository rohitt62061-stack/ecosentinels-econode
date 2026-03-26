import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';

export function AuthCallback() {
  const navigate = useNavigate();
  
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate('/');
        return;
      }
      
      const user = session.user;

      // Get the user's role from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile not found - Auto-create if phone login
        if (user.phone) {
          const phoneSuffix = user.phone.slice(-4);
          const { error: createError } = await supabase
            .from('profiles')
            .insert({ 
              id: user.id, 
              full_name: `Citizen #${phoneSuffix}`,
              role: 'citizen'
            });

          if (!createError) {
            navigate('/citizen/home');
            return;
          }
        }
        
        // Final fallback: navigate to selection if profile still missing
        navigate('/select');
        return;
      }

      if (data?.role === 'mcd') {
        navigate('/mcd/dashboard');
      } else {
        navigate('/citizen/home');
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-[var(--text-muted)] font-medium animate-pulse">Signing you in...</p>
      </div>
    </div>
  );
}
