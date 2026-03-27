import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Read the session from URL hash (OAuth sets it here)
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error || !session) {
        console.error('Auth callback error:', error);
        navigate('/?error=auth_failed');
        return;
      }

      // Get user role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      let role = profile?.role;

      if (profileError || !profile) {
        // No profile yet — create one as citizen (safe default)
        await supabase.from('profiles').insert({
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || session.user.email,
          role: 'citizen'
        });
        role = 'citizen';
      }

      // Store role in localStorage
      localStorage.setItem('userRole', role || 'citizen');

      // Route based on role
      const target = role === 'mcd' ? '/mcd-dashboard' : '/citizen-app';
      navigate(target);
    });
  }, [navigate]);

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', minHeight:'100vh', gap:'16px' }}>
      <div style={{ fontSize:'32px' }}>⬡</div>
      <p style={{ fontFamily:'monospace', fontSize:'14px', color:'#666' }}>
        Signing you in to Econode...
      </p>
    </div>
  );
}
