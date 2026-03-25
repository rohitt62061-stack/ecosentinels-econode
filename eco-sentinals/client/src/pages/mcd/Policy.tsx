import { useEffect, useState } from 'react';
import McdLayout from '../../components/McdLayout';
import { supabase } from '../../utils/supabase';
import { Shield, CheckCircle, XCircle, ArrowRight, RefreshCw, AlertTriangle, User } from 'lucide-react';

interface ActionItem {
  action: string;
  priority: 'high' | 'medium' | 'low';
  target: string;
}

interface PolicyRec {
  id: string;
  ward_id: string;
  detection_id: string;
  actions: ActionItem[];
  status: 'pending' | 'approved' | 'implemented' | 'rejected';
  generated_at: string;
  escalation_target: string;
  wards: { ward_name: string };
  pollution_detections?: { source_type: string; confidence_score: number };
}

interface Ward {
  id: string;
  ward_name: string;
}

export default function Policy() {
  const [recommendations, setRecommendations] = useState<PolicyRec[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWards();
  }, []);

  useEffect(() => {
    fetchPolicies();

    const channel = supabase
      .channel('public:policy_recommendations_view')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'policy_recommendations' }, () => {
         fetchPolicies();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedStatus, selectedWard]);

  const fetchWards = async () => {
    const { data } = await supabase.from('wards').select('id, ward_name').order('ward_name');
    if (data) setWards(data);
  };

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('policy_recommendations')
        .select('*, wards(ward_name), pollution_detections(source_type, confidence_score)')
        .order('generated_at', { ascending: false });

      if (selectedStatus !== 'all') {
         query = query.eq('status', selectedStatus);
      }
      if (selectedWard !== 'all' && selectedWard !== '') {
         query = query.eq('ward_id', selectedWard);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRecommendations((data as unknown as PolicyRec[]) || []);
    } catch (err) {
      console.error("Error fetching policies:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('policy_recommendations')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    if (priority === 'medium') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const getStatusColor = (status: string) => {
    if (status === 'approved') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (status === 'implemented') return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (status === 'rejected') return 'bg-red-500/10 text-red-500 border-red-500/20';
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  };

  return (
    <McdLayout>
      <div className="p-6 bg-[var(--bg-primary)] min-h-full text-[var(--text-primary)] flex flex-col gap-6 overflow-y-auto transition-colors duration-300">
        
        {/* Header and top controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <h1 className="text-2xl font-black font-manrope tracking-tight">Policy Recommendations</h1>
            <p className="text-sm text-[var(--text-secondary)]">Automated AI policy generation for detected pollution sources</p>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={selectedWard} 
              onChange={(e) => setSelectedWard(e.target.value)}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text-primary)]"
            >
              <option value="all">All Wards</option>
              {wards.map(w => <option key={w.id} value={w.id}>{w.ward_name}</option>)}
            </select>
            <button onClick={fetchPolicies} className="p-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex border-b border-[var(--border)]">
          {(['all', 'pending', 'approved', 'implemented', 'rejected'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedStatus(tab)}
              className={`px-4 py-2 text-sm font-semibold capitalize border-b-2 transition-colors -mb-[2px] ${
                selectedStatus === tab 
                  ? 'border-emerald-500 text-emerald-500' 
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Policy Grid */}
        {loading && recommendations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] animate-pulse">
            Loading policies...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-600 italic">
            No policy recommendations found for this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {recommendations.map(policy => (
              <div key={policy.id} className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-secondary)]/0 via-[var(--bg-secondary)]/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)]">{policy.wards?.ward_name}</h3>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {new Date(policy.generated_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-md border font-medium ${getStatusColor(policy.status)}`}>
                    {policy.status}
                  </span>
                </div>

                {/* Source trigger indication */}
                {policy.pollution_detections && (
                  <div className="flex items-center gap-1.5 bg-[var(--bg-primary)]/80 px-2.5 py-1.5 rounded-lg border border-[var(--border)]">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span className="text-xs font-semibold text-[var(--text-secondary)] capitalize">{policy.pollution_detections.source_type.replace('_', ' ')}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      ({Math.round(policy.pollution_detections.confidence_score * 100)}% conf)
                    </span>
                  </div>
                )}

                {/* Escalation Target */}
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                  <User size={12} />
                  <span>Escalation: <span className="text-[var(--text-primary)] font-medium">{policy.escalation_target}</span></span>
                </div>

                <hr className="border-[var(--border)]/50" />

                {/* Action Items */}
                <div className="flex-1 flex flex-col gap-3">
                  <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-wider">Required Action items</p>
                  <div className="flex flex-col gap-2.5">
                    {policy.actions && policy.actions.map((act, i) => (
                      <div key={i} className="bg-[var(--bg-secondary)]/80 border border-[var(--border)]/60 p-2.5 rounded-lg flex flex-col gap-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">{act.action}</p>
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase border ${getPriorityColor(act.priority)}`}>
                            {act.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                          <span className="font-bold text-[var(--text-secondary)]">Target:</span> {act.target}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Controls */}
                {policy.status === 'pending' && (
                  <div className="flex items-center gap-2 mt-2">
                    <button 
                      onClick={() => updateStatus(policy.id, 'approved')}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-emerald-500/10"
                    >
                      <CheckCircle size={14} /> Approve Action
                    </button>
                    <button 
                      onClick={() => updateStatus(policy.id, 'rejected')}
                      className="p-2 bg-[var(--bg-tertiary)] hover:bg-rose-950 text-[var(--text-secondary)] hover:text-rose-500 rounded-lg border border-[var(--border)] hover:border-rose-900 transition-colors"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                )}

                {policy.status === 'approved' && (
                  <button 
                    onClick={() => updateStatus(policy.id, 'implemented')}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 text-[var(--text-primary)] rounded-lg text-xs font-semibold transition-colors mt-2"
                  >
                    <span>Mark Implemented</span> <ArrowRight size={14} />
                  </button>
                )}

                {policy.status !== 'pending' && policy.status !== 'approved' && (
                  <div className="mt-2">
                    <select 
                      value={policy.status}
                      onChange={(e) => updateStatus(policy.id, e.target.value)}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-secondary)]"
                    >
                      <option value="pending">Move to Pending</option>
                      <option value="approved">Move to Approved</option>
                      <option value="implemented">Move to Implemented</option>
                      <option value="rejected">Move to Rejected</option>
                    </select>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </McdLayout>
  );
}
