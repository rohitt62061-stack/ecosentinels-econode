import { useEffect, useState } from 'react';
import { Megaphone, MapPin, Clock, ShieldCheck, Zap } from 'lucide-react';
import { getStreamClient, getStreamToken } from '../../utils/stream';
import { supabase } from '../../utils/supabase';

interface StreamReport {
  id: string;
  actor: string;
  object: string; // issue_type
  description: string;
  ward_id: string;
  ward_name: string;
  timestamp: string;
  [key: string]: any;
}

export default function CitizenReportsPanel() {
  const [reports, setReports] = useState<StreamReport[]>([]);
  const [detectionMatches, setDetectionMatches] = useState<Record<string, boolean>>({});
  const [totalLast24h, setTotalLast24h] = useState(0);

  useEffect(() => {
    let subscription: any;

    const initStream = async () => {
      try {
        const client = getStreamClient();
        // Since we don't have a specific user for MCD here, we'll use a generic mcd_dashboard user
        const userId = 'mcd_dashboard_admin';
        const token = getStreamToken(userId);
        
        // Subscribe to *all* ward feeds? No, we should probably follow feeds.
        // For prototype, we'll just subscribe to a 'global' feed or a specific one.
        // Missionary goal: "Subscribe to Stream Activity Feed for ward-specific reports"
        // Since we are in the MCD dashboard (not filtering by ward yet for the feed), 
        // we might want to listen to a notification feed.
        
        // Actually, I'll just use a 'global' notification feed for this mission's simplicity.
        // OR, I can query the feeds periodically if real-time subscribe doesn't work easily with multiple ward feeds.
        
        // Hack for mission: listen to a 'mcd_reports' notification feed where all ward reports are fanned out.
        const mcdFeed = client.feed('notification', 'mcd_reports_feed', token);
        
        const fetchInitial = async () => {
          const res = await mcdFeed.get({ limit: 10 });
          const streamReports = res.results.map((r: any) => ({
             id: r.id,
             actor: r.actor,
             object: r.object,
             description: r.description,
             ward_id: r.ward_id,
             ward_name: r.ward_name,
             timestamp: r.timestamp || new Date().toISOString()
          }));
          setReports(streamReports);
          checkAILinks(streamReports);
          
          // Count last 24h
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          setTotalLast24h(streamReports.filter(r => new Date(r.timestamp) > oneDayAgo).length);
        };

        await fetchInitial();

        subscription = mcdFeed.subscribe((data) => {
          if (data.new && data.new.length > 0) {
            const newReports = data.new.map((r: any) => ({
                id: r.id,
                actor: r.actor,
                object: r.object,
                description: r.description,
                ward_id: r.ward_id,
                ward_name: r.ward_name,
                timestamp: r.timestamp || new Date().toISOString()
            }));
            setReports(prev => [...newReports, ...prev].slice(0, 20));
            checkAILinks(newReports);
            setTotalLast24h(prev => prev + newReports.length);
          }
        });

      } catch (err) {
        console.error('Stream subscription failed:', err);
      }
    };

    initStream();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const checkAILinks = async (newReports: StreamReport[]) => {
    const matches: Record<string, boolean> = {};
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

    for (const report of newReports) {
      // Map report object to source_type
      let sourceType = '';
      if (report.object === 'burning_smell') sourceType = 'biomass_burning';
      else if (report.object === 'construction_dust') sourceType = 'construction_dust';

      if (sourceType) {
        const { data } = await supabase
          .from('pollution_detections')
          .select('id')
          .eq('ward_id', report.ward_id)
          .eq('source_type', sourceType)
          .gt('detected_at', threeHoursAgo)
          .limit(1);
        
        if (data && data.length > 0) {
          matches[report.id] = true;
        }
      }
    }
    setDetectionMatches(prev => ({ ...prev, ...matches }));
  };

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const getIssueLabel = (type: string) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-2">
          <Megaphone size={16} className="text-[var(--primary)]" />
          <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>Citizen Reports — Live Feed</h3>
        </div>
        <div className="flex items-center gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-[9px] font-mono text-[var(--text-muted)]">{totalLast24h} reports in last 24h</span>
        </div>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
        {reports.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 italic p-8">
            <Zap size={24} className="mb-4" />
            <p className="text-[10px] font-mono uppercase tracking-widest">No Recent Citizen Reports</p>
          </div>
        ) : (
          reports.map((report) => (
            <div 
              key={report.id} 
              className="p-4 bg-[var(--surface)] border border-[var(--surface-container-highest)] border-opacity-5 rounded-[var(--radius-md)] group hover:shadow-[var(--shadow-ambient)] transition-all animate-slideIn"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[var(--text-primary)]">
                    Citizen #{report.actor.slice(-4)}
                  </span>
                  <div className="flex items-center gap-1 text-[8px] text-[var(--text-muted)] font-mono">
                    <MapPin size={8} />
                    {report.ward_name}
                  </div>
                </div>
                <span className="text-[9px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                  <Clock size={8} />
                  {getTimeAgo(report.timestamp)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-[var(--surface-container-high)] text-[var(--text-secondary)] text-[8px] font-bold uppercase tracking-wider rounded">
                  {getIssueLabel(report.object)}
                </span>
                {detectionMatches[report.id] && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] font-bold uppercase tracking-wider rounded border border-amber-500/20">
                    <ShieldCheck size={10} />
                    Confirmed by AI
                  </span>
                )}
              </div>

              {report.description && (
                <p className="text-[10px] text-[var(--text-muted)] italic mb-4 line-clamp-2 leading-relaxed">
                  "{report.description}"
                </p>
              )}

              <button className="w-full py-2 text-[9px] font-mono text-[var(--primary)] border border-[var(--primary)] border-opacity-20 rounded-[var(--radius-sm)] uppercase tracking-widest transition-all hover:bg-[var(--primary)] hover:text-[var(--on-primary)]">
                Investigate Ward →
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
