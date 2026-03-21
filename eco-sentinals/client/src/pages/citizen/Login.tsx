import { useNavigate } from 'react-router-dom';

export default function CitizenLogin() {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    // TODO: Supabase signInWithOAuth
    console.log('Google Login');
    navigate('/citizen/home');
  };

  return (
    <div className="min-h-screen bg-[#0a0f0c] flex items-center justify-center p-6 text-white">
      <div className="bg-[#111814] border border-[#1e2922] rounded-2xl p-8 max-w-sm w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#1a5c3a] flex items-center justify-center text-[#3ecf8e] text-xl font-bold">
            🌱
          </div>
        </div>
        <h1 className="text-xl font-headline font-bold mb-2 text-[#3ecf8e]">Citizen Node</h1>
        <p className="text-slate-400 text-sm mb-6">
          Access local AQI updates and waste management metrics securely with Google.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl flex items-center justify-center space-x-2 transition-colors"
        >
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
}
