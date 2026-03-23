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
      <div className="p-4 bg-[#0a0f0c] min-h-full text-slate-100 flex flex-col gap-4 max-w-md mx-auto relative">
        
        <div>
          <h1 className="text-xl font-bold font-manrope">Waste Classifier</h1>
          <p className="text-xs text-emerald-400/80">Snapshot the item or type its name for points</p>
        </div>

        {/* Camera Area */}
        {!result && !loading && (
          <div className="flex flex-col gap-3">
            <label className="border-2 border-dashed border-emerald-900/40 rounded-2xl h-52 flex flex-col items-center justify-center gap-2 cursor-pointer bg-emerald-950/20 hover:border-emerald-500/40 transition-colors relative overflow-hiddenGroup">
              <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
              {image ? (
                <img src={image} className="absolute inset-0 w-full h-full object-cover rounded-xl" alt="Preview" />
              ) : (
                <>
                  <div className="p-3 bg-emerald-800/20 rounded-full text-emerald-400">
                    <Camera size={24} />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">Tap to Scan Item</span>
                </>
              )}
            </label>

            <div className="flex items-center gap-2 text-slate-600 text-[10px] uppercase font-bold">
              <hr className="flex-1 border-slate-900" />
              <span>OR</span>
              <hr className="flex-1 border-slate-900" />
            </div>

            <input 
              type="text" 
              placeholder="Type item name (e.g. Banana Peel)" 
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="bg-slate-900/80 border border-slate-900 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500/50 text-slate-100"
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
            <RefreshCw size={32} className="animate-spin text-emerald-400" />
            <p className="text-sm font-bold text-slate-300 animate-pulse">Asking AI Classification...</p>
          </div>
        )}

        {/* Result Card */}
        {result && theme && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className={`border rounded-2xl p-5 flex flex-col items-center text-center gap-3 bg-slate-900/30 ${theme.bg}`}>
              <span className="text-5xl">{theme.emoji}</span>
              <div>
                <h3 className="font-black text-white text-lg capitalize">{result.item_name || itemName}</h3>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-md uppercase border inline-block mt-1 ${theme.text} border-current/20`}>
                  {theme.label}
                </span>
              </div>
              
              <div className="w-full h-[1px] bg-slate-800/50" />

              <div className="text-left w-full">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Disposal Tip</p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{result.disposal_tip}</p>
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
              className="w-full py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
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
              <p className="text-xs text-slate-400 mt-0.5">{error}</p>
            </div>
          </div>
        )}

      </div>
    </CitizenLayout>
  );
}
