import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function McdLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('error') === 'unauthorized') {
      showToast('MCD access requires manual approval. Your account has been registered as a Citizen.', 'error');
      setError('Unauthorized access. Please contact your administrator.');
    }
  }, [location, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
        return;
      }
      
      if (data.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
        
        const role = profile?.role || 'citizen';
        localStorage.setItem('userRole', role);
        
        // Use requested aliases if possible, or standard routes
        const target = role === 'mcd' ? '/mcd-dashboard' : '/citizen-app';
        navigate(target);
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-[var(--text-primary)] font-sans bg-[var(--bg-primary)] transition-colors duration-300">
      {/* Left Panel: Branding */}
      <div className="hidden md:flex md:w-1/2 bg-[var(--mcd-primary)] items-center justify-center p-12 relative overflow-hidden">
        <div className="max-w-md relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent)]"></div>
            <span className="text-2xl font-bold text-[var(--accent)]">Econode</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">MCD Officer Governance Portal</h1>
          <p className="text-[var(--text-secondary)] opacity-80">
            Access secure, hyper-local intelligence maps, route optimizations, and analytical circular updates.
          </p>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
          <p className="text-[var(--text-muted)] mb-8">Sign in with your Supabase account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@mcdindia.gov.in"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-3 text-[var(--text-primary)] placeholder-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent)]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-3 text-[var(--text-primary)] placeholder-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent)]"
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--accent)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--accent-fg)] font-bold rounded-xl transition-colors mt-6 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-[var(--text-muted)] mt-6">
            Don't have an account? Contact your MCD administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
