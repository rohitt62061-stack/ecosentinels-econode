import { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Loader2 } from 'lucide-react';

export default function CitizenLogin() {
  const [loading, setLoading] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/citizen/home' },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // On success, Supabase redirects to /citizen/home automatically
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
      }
      // AuthContext onAuthStateChange handles navigation
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6 text-[var(--text-primary)] transition-colors duration-300">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-8 max-w-sm w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--citizen-primary)] flex items-center justify-center text-[var(--accent-fg)] text-xl font-bold">
            🌱
          </div>
        </div>
        <h1 className="text-xl font-bold mb-2 text-[var(--citizen-primary)]">Citizen Node</h1>
        <p className="text-[var(--text-muted)] text-sm mb-6">
          Access local AQI updates and waste management metrics.
        </p>

        {error && (
          <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">{error}</p>
        )}

        {!showEmail ? (
          <>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 bg-[var(--bg-secondary)] hover:opacity-90 disabled:opacity-50 text-[var(--text-primary)] font-semibold rounded-xl flex items-center justify-center space-x-2 border border-[var(--border)] transition-all mb-3"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <span>G</span>}
              <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>
            <button
              onClick={() => setShowEmail(true)}
              className="w-full py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Or sign in with email
            </button>
          </>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-3 text-left">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="citizen@gmail.com"
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent)]"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent)]"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--accent)] hover:opacity-90 disabled:opacity-50 text-[var(--accent-fg)] font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <button type="button" onClick={() => setShowEmail(false)} className="w-full text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
              Back to Google login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
