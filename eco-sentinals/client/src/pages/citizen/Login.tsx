import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { Loader2, Phone, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Logo from '../../components/Logo';

export default function CitizenLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Phone Auth State
  const [step, setStep] = useState<'number' | 'otp'>('number');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    const rawNumber = phoneNumber.replace(/\s/g, '');
    if (rawNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: '+91' + rawNumber,
      });

      if (otpError) throw otpError;
      
      setStep('otp');
      setResendDisabled(true);
      setTimer(30);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otpCode.length !== 6) return;

    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: '+91' + phoneNumber.replace(/\s/g, ''),
        token: otpCode,
        type: 'sms'
      });

      if (verifyError) throw verifyError;
      
      // Success will trigger AuthContext change or navigate manually
      navigate('/auth/callback');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center p-6 text-[var(--text-primary)] transition-colors duration-500 overflow-hidden relative">
      
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl relative z-10 transition-all duration-300">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Logo className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-black font-fraunces text-[var(--primary)] mb-2">Join Econode</h1>
          <p className="text-[var(--text-secondary)] text-sm font-medium">Synchronize with your urban metabolism.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-500 text-xs animate-shake">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {step === 'number' ? (
          <div className="space-y-8">
            {/* Google Option */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-14 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-2xl flex items-center justify-center gap-3 border-2 border-gray-100 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-[var(--border)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">or</span>
              <div className="h-[1px] flex-1 bg-[var(--border)]" />
            </div>

            {/* Phone Option */}
            <form onSubmit={handleSendOTP} className="space-y-6 text-left">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Mobile Number</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <span className="text-sm font-bold text-[var(--text-primary)] border-r border-[var(--border)] pr-3 mr-3">+91</span>
                   </div>
                   <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98765 43210"
                    className="w-full bg-[var(--bg-primary)] border-2 border-[var(--border)] rounded-2xl p-4 pl-20 text-sm font-bold tracking-widest text-[var(--text-primary)] placeholder-[var(--text-muted)]/30 focus:outline-none focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phoneNumber.length < 10}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Phone size={18} />}
                Send OTP
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            <button 
              onClick={() => setStep('number')} 
              className="group flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Change Number
            </button>

            <form onSubmit={handleVerifyOTP} className="space-y-6 text-left">
              <div className="space-y-3">
                <div className="flex flex-col gap-1 italic mb-2">
                  <span className="text-xs text-[var(--text-secondary)]">Enter 6-digit code sent to</span>
                  <span className="text-sm font-bold text-[var(--primary)]">+91 {phoneNumber.replace(/(\d{5})(\d{5})/, '$1 $2')}</span>
                </div>
                
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full bg-[var(--bg-primary)] border-2 border-[var(--border)] rounded-2xl p-5 text-center text-3xl font-black tracking-[0.5em] text-[var(--text-primary)] placeholder-[var(--text-muted)]/20 focus:outline-none focus:border-emerald-500 transition-all"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={18} />}
                Verify & Continue
              </button>

              <div className="text-center">
                <button
                  type="button"
                  disabled={resendDisabled || loading}
                  onClick={handleSendOTP}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 disabled:text-[var(--text-muted)] transition-colors"
                >
                  {resendDisabled ? `Resend code in ${timer}s` : 'Resend code'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-[var(--text-muted)] font-medium leading-relaxed">
            By continuing, you agree to our <span className="underline cursor-pointer">Civic Terms</span> and <span className="underline cursor-pointer">Environmental Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
