import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function McdLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const allowedDomains = ['@mcdindia.gov.in', '@delhi.gov.in', '@ndmc.gov.in'];
    return allowedDomains.some(domain => email.endsWith(domain));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Only official MCD email addresses are accepted');
      return;
    }

    // TODO: Supabase signInWithPassword()
    console.log('Logging in with', email);
    // For now, bypass and redirect to dashboard
    navigate('/mcd/dashboard');
  };

  return (
    <div className="min-h-screen flex text-white font-sans bg-[#0a0f0c]">
      {/* Left Panel: Branding */}
      <div className="hidden md:flex md:w-1/2 bg-[#1a3560] items-center justify-center p-12 relative overflow-hidden">
        <div className="max-w-md relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500"></div>
            <span className="text-2xl font-headline font-bold text-[#3ecf8e]">Econode</span>
          </div>
          <h1 className="text-4xl font-headline font-bold mb-4">MCD Officer Governance Portal</h1>
          <p className="text-slate-300">
            Access secure, hyper-local intelligence maps, route optimizations, and analytical circular updates.
          </p>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-headline font-bold mb-2">Welcome Back</h2>
          <p className="text-slate-400 mb-8">Please sign in to your official account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@mcdindia.gov.in"
                className="w-full bg-[#111814] border border-[#1e2922] rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#111814] border border-[#1e2922] rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-[#00210c] font-bold rounded-xl transition-colors mt-6"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
