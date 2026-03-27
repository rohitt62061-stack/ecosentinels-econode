import { useState, useEffect, useRef } from 'react';
import CitizenLayout from '../../components/CitizenLayout';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../context/AuthContext';
import { Camera, Sparkles, X, Search, Zap } from 'lucide-react';
import { algoliasearch } from 'algoliasearch';
import { ErrorBoundary } from '../../components/ErrorBoundary';

const algoliaClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY
);

interface Classification {
  category: string;
  item_name: string;
  disposal_tip: string;
  points?: number;
}

interface AlgoliaHit {
  objectID: string;
  name: string;
  category: string;
  tip: string;
}

export default function Waste() {
  const { session } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Classification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPoints, setShowPoints] = useState(false);
  
  // Algolia State
  const [suggestions, setSuggestions] = useState<AlgoliaHit[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Debounced Algolia Search
  useEffect(() => {
    if (itemName.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      try {
        const { results } = await algoliaClient.search({
          requests: [{
            indexName: 'waste-items',
            query: itemName,
            hitsPerPage: 5
          }]
        });
        
        const hits = (results[0] as any).hits as AlgoliaHit[];
        setSuggestions(hits);
        setShowDropdown(hits.length > 0);
      } catch (err) {
        console.error('Algolia search error:', err);
      }
    }, 150);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [itemName]);

  const selectSuggestion = (hit: AlgoliaHit) => {
    setItemName(hit.name);
    setResult({
      category: hit.category,
      item_name: hit.name,
      disposal_tip: hit.tip
    });
    setSuggestions([]);
    setShowDropdown(false);
    setTimeout(() => setShowPoints(true), 300);
  };

  const classifyWaste = async () => {
    if (!image && !itemName) return;
    setLoading(true);
    setError(null);
    setShowPoints(false);

    try {
      // 1. Check Algolia first if we have a name but no result yet
      if (itemName && !result) {
        const { results } = await algoliaClient.search({
          requests: [{
            indexName: 'waste-items',
            query: itemName,
            hitsPerPage: 1
          }]
        });
        const hit = (results[0] as any).hits[0] as AlgoliaHit;
        
        // Exact or very close match
        if (hit && hit.name.toLowerCase() === itemName.toLowerCase()) {
          setResult({
            category: hit.category,
            item_name: hit.name,
            disposal_tip: hit.tip
          });
          setTimeout(() => setShowPoints(true), 300);
          setLoading(false);
          return;
        }
      }

      // 2. Fall back to Claude API (Supabase Function)
      const { data: scoreData } = await supabase.from('citizen_scores').select('ward_id').eq('user_id', session?.user?.id).maybeSingle();
      const ward_id = scoreData?.ward_id || "662ae969-067a-4b6b-a0b3-ac28cc665fe9";

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
    setError(null);
    setShowPoints(false);
  };

  const getCategoryTheme = (cat: string) => {
    const lower = (cat || '').toLowerCase();
    if (lower.includes('biodegradable')) return { color: '#059669', emoji: '🌱', label: 'Biodegradable' };
    if (lower.includes('recyclable')) return { color: '#2563eb', emoji: '♻️', label: 'Recyclable' };
    return { color: '#dc2626', emoji: '☣️', label: 'Hazardous' };
  };

  const category = result ? getCategoryTheme(result.category) : null;

  return (
    <CitizenLayout>
      <div className="flex flex-col h-full bg-[var(--surface)] text-[var(--text-primary)] transition-colors duration-500 relative">
        
        {/* Editorial Header Overlaid */}
        <div className="absolute top-0 inset-x-0 z-20 p-8 flex justify-between items-start pointer-events-none">
          <div className="pointer-events-auto">
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Waste Metabolism
            </h1>
            <p className="text-[10px] uppercase font-mono tracking-[0.2em] text-[var(--text-muted)] mt-1">
              Screen 07: Intelligence Scan
            </p>
          </div>
          <button onClick={reset} className={`pointer-events-auto p-2 rounded-full bg-[var(--surface-container-highest)]/80 backdrop-blur-md transition-opacity duration-300 ${image || result ? 'opacity-100' : 'opacity-0'}`}>
            <X size={20} />
          </button>
        </div>

        {/* Scan Area / Viewport */}
        <ErrorBoundary fallback={<div className="flex-1 m-4 bg-neutral-900 border border-white/10 rounded-[var(--radius-lg)] flex items-center justify-center text-white/40 text-xs font-mono uppercase tracking-widest italic">Intelligence Scan Offline</div>}>
          <div className="flex-1 relative bg-black overflow-hidden m-4 rounded-[var(--radius-lg)] shadow-2xl">
            {image ? (
              <img src={image} className="w-full h-full object-cover" alt="Scan preview" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-neutral-900 border border-white/10">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-white/40">
                  <Camera size={32} />
                </div>
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/40">Lens Initializing...</p>
              </div>
            )}

            {/* Scanning Animation */}
            {loading && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="w-full h-[2px] bg-[var(--primary)] absolute top-0 animate-[scan_2s_infinite_linear] opacity-60 blur-sm shadow-[0_0_15px_var(--primary)]"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--primary-container)]/5 to-transparent animate-pulse"></div>
              </div>
            )}
            
            <style>{`
              @keyframes scan {
                0% { top: 0%; }
                50% { top: 100%; }
                100% { top: 0%; }
              }
            `}</style>
          </div>
        </ErrorBoundary>

        {/* Controls Panel - Glassmorphism */}
        <div className="p-8 pb-32 flex flex-col gap-6 relative z-10">
          {!result && !loading && (
            <div className="flex flex-col gap-4 animate-editorial-fade relative">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Declare item manually..." 
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  onFocus={() => itemName.length >= 2 && setSuggestions.length > 0 && setShowDropdown(true)}
                  className="w-full bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-[var(--radius-md)] px-6 py-4 text-sm font-medium outline-none focus:border-[var(--primary)]/50 text-[var(--text-primary)] transition-all"
                />
                
                {/* Algolia Dropdown */}
                {showDropdown && suggestions.length > 0 && (
                  <div className="absolute bottom-full mb-2 left-0 right-0 bg-[var(--surface-container-high)]/90 backdrop-blur-xl border border-[var(--outline-variant)] rounded-[var(--radius-md)] shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-3 border-b border-[var(--outline-variant)] flex items-center gap-2">
                      <Zap size={12} className="text-amber-500 fill-amber-500" />
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">Instant Matches</span>
                    </div>
                    {suggestions.map((hit) => (
                      <button
                        key={hit.objectID}
                        onClick={() => selectSuggestion(hit)}
                        className="w-full px-6 py-4 text-left hover:bg-[var(--primary)]/10 flex items-center justify-between group transition-colors border-b border-[var(--outline-variant)] last:border-0"
                      >
                        <span className="text-sm font-semibold">{hit.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[var(--surface-container-highest)] group-hover:bg-[var(--primary)]/20 text-[var(--text-secondary)]">
                            {hit.category}
                          </span>
                          <Search size={14} className="text-[var(--text-muted)]" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                <label className="flex-1 flex items-center justify-center gap-3 py-4 bg-[var(--surface-container-highest)] text-[var(--primary)] rounded-[var(--radius-md)] text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-[var(--primary)] hover:text-white transition-all duration-300">
                  <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                  <Camera size={16} />
                  Capture
                </label>
                
                <button 
                  onClick={classifyWaste}
                  disabled={!image && !itemName}
                  className="flex-[2] py-4 text-xs font-bold uppercase tracking-widest text-white rounded-[var(--radius-md)] transition-all duration-500 disabled:opacity-20 flex items-center justify-center gap-2 group"
                  style={{ background: 'linear-gradient(145deg, var(--primary-container), var(--primary))' }}
                >
                  <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                  Metabolize Data
                </button>
              </div>
            </div>
          )}

          {/* AI Result Card - Editorial Style */}
          {result && category && (
            <div className="animate-editorial-fade flex flex-col gap-6">
              <div className="bg-[var(--surface-container-lowest)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-ambient)] relative overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl">{category.emoji}</div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight capitalize" style={{ fontFamily: 'var(--font-display)' }}>
                      {result.item_name}
                    </h3>
                    <span 
                      className="text-[10px] font-mono font-bold uppercase tracking-widest"
                      style={{ color: category.color }}
                    >
                      Class: {category.label}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-container-low)]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] block mb-1">
                    Disposal Protocol
                  </span>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {result.disposal_tip}
                  </p>
                </div>

                {showPoints && (
                  <div className="mt-4 flex items-center gap-2 text-amber-600 font-bold text-xs animate-bounce">
                    <Sparkles size={14} /> +10 Credits toward EcoScore
                  </div>
                )}
              </div>
              
              <button onClick={reset} className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors self-center">
                Initialize New Scan
              </button>
            </div>
          )}
          {error && <div className="text-rose-600 text-xs font-mono text-center">{error}</div>}
        </div>
      </div>
    </CitizenLayout>
  );
}
