import { useState } from 'react';
import CitizenLayout from '../../components/CitizenLayout';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../context/AuthContext';
import { Camera, RefreshCw, Check, AlertCircle, Sparkles } from 'lucide-react';

export default function Waste() {
  const { session } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [showPoints, setShowPoints] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setResult(null); // Clear previous result
    };
    reader.readAsDataURL(file);
  };

  const classifyWaste = async () => {
    if (!image && !itemName) return;
    
    setLoading(true);
    setError('');
    setShowPoints(false);

    try {
      // Fetch user's ward_id from a scoring or profile table setup 
      const { data: scoreData } = await supabase.from('citizen_scores').select('ward_id').eq('user_id', session?.user?.id).maybeSingle();
      const ward_id = scoreData?.ward_id || "662ae969-067a-4b6b-a0b3-ac28cc665fe9"; // Fallback static ID if profile missing

      const { data, error: invokeError } = await supabase.functions.invoke('classify-waste', {
        body: {
          image_base64: image ? image.split(',')[1] : null,
          item_name: itemName || null,
          user_id: session?.user?.id,
          ward_id
        }
      });

      if (invokeError) throw invokeError;
      if (data?.error) throw new Error(data.error);

      setResult(data);
      if (data && !data.error) {
        setTimeout(() => setShowPoints(true), 300);
      }
    } catch (err: any) {
      setError(err.message || 'Classification failed.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setItemName('');
    setResult(null);
    setError('');
    setShowPoints(false);
  };

  const getCategoryTheme = (cat: string) => {
    const lower = (cat || '').toLowerCase();
    if (lower.includes('biodegradable')) return { bg: 'bg-green-500/10 border-green-500/20', text: 'text-green-500', emoji: '🌱', label: 'Biodegradable' };
    if (lower.includes('recyclable')) return { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-500', emoji: '♻️', label: 'Recyclable' };
    return { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-500', emoji: '☣️', label: 'Hazardous' };
  };

  const theme = result ? getCategoryTheme(result.category) : null;

  return (
    <CitizenLayout>
      <div className="p-4 bg-[var(--bg-primary)] min-h-full text-[var(--text-primary)] flex flex-col gap-4 max-w-md mx-auto relative transition-colors duration-300">
        
        <div>
          <h1 className="text-xl font-bold font-manrope">Waste Classifier</h1>
          <p className="text-xs text-[var(--citizen-primary)] opacity-80">Snapshot the item or type its name for points</p>
        </div>

        {!result && !loading && (
          <div className="flex flex-col gap-3">
            <label className="border-2 border-dashed border-[var(--border)] rounded-2xl h-52 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[var(--bg-secondary)]/20 hover:border-[var(--citizen-primary)]/40 transition-colors relative overflow-hidden group">
              <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
              {image ? (
                <img src={image} className="absolute inset-0 w-full h-full object-cover rounded-xl" alt="Preview" />
              ) : (
                <>
                  <div className="p-3 bg-[var(--citizen-primary)]/10 rounded-full text-[var(--citizen-primary)]">
                    <Camera size={24} />
                  </div>
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Tap to Scan Item</span>
                </>
              )}
            </label>

            <div className="flex items-center gap-2 text-[var(--text-muted)] opacity-30 text-[10px] uppercase font-bold">
              <hr className="flex-1 border-[var(--border)]" />
              <span>OR</span>
              <hr className="flex-1 border-[var(--border)]" />
            </div>

            <input 
              type="text" 
              placeholder="Type item name (e.g. Banana Peel)" 
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="bg-[var(--bg-secondary)]/80 border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--citizen-primary)]/50 text-[var(--text-primary)] placeholder-[var(--text-muted)]/50"
            />

            <button 
              onClick={classifyWaste}
              disabled={!image && !itemName}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${
                (!image && !itemName) 
                  ? 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10'
              }`}
            >
              Classify Waste
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <RefreshCw size={32} className="animate-spin text-[var(--citizen-primary)]" />
            <p className="text-sm font-bold text-[var(--text-secondary)] animate-pulse">Asking AI Classification...</p>
          </div>
        )}

        {/* Result Card */}
        {result && theme && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className={`border rounded-2xl p-5 flex flex-col items-center text-center gap-3 bg-[var(--bg-secondary)]/30 ${theme.bg}`}>
              <span className="text-5xl">{theme.emoji}</span>
              <div>
                <h3 className="font-black text-[var(--text-primary)] text-lg capitalize">{result.item_name || itemName}</h3>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-md uppercase border inline-block mt-1 ${theme.text} border-current/20`}>
                  {theme.label}
                </span>
              </div>
              
              <div className="w-full h-[1px] bg-[var(--border)]" />

              <div className="text-left w-full">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Disposal Tip</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{result.disposal_tip}</p>
              </div>

              {showPoints && (
                <div className="mt-2 flex items-center gap-1 bg-amber-500/20 px-3 py-1.5 rounded-full border border-amber-500/20 animate-bounce">
                  <Sparkles size={14} className="text-amber-400" />
                  <span className="text-xs font-black text-amber-400">+10 Credits Earned!</span>
                </div>
              )}
            </div>

            <button 
              onClick={reset}
              className="w-full py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] rounded-xl text-sm font-semibold hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              Scan Another Item
            </button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="border border-red-900/50 bg-red-950/20 p-4 rounded-xl flex items-start gap-2">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-xs font-bold text-red-500">Classification Error</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{error}</p>
            </div>
          </div>
        )}

      </div>
    </CitizenLayout>
  );
}
