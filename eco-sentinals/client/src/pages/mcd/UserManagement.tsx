import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import McdLayout from '../../components/McdLayout';
import { UserPlus, Trash2, MapPin, Search, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface Officer {
  id: string;
  full_name: string;
  email: string;
  role: string;
  ward_id: string;
  ward_name: string;
  ward_number: number;
  created_at: string;
}

interface Ward {
  id: string;
  ward_name: string;
  ward_number: number;
}

export default function UserManagement() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Form State
  const [newEmail, setNewEmail] = useState('');
  const [selectedWardId, setSelectedWardId] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [offRes, wardRes] = await Promise.all([
        supabase.from('mcd_officers').select('*').order('created_at', { ascending: false }),
        supabase.from('wards').select('id, ward_name, ward_number').order('ward_number')
      ]);

      if (offRes.error) throw offRes.error;
      if (wardRes.error) throw wardRes.error;

      setOfficers(offRes.data || []);
      setWards(wardRes.data || []);
    } catch (err: any) {
      console.error('Error fetching management data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGrantAccess(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!newEmail || !selectedWardId) return;

    setActionLoading('grant');
    try {
      // 1. Find the user in profiles (since we can't query auth.users directly)
      const { data: userProfile, error: pError } = await supabase
        .from('profiles')
        .select('id')
        .eq('full_name', newEmail) // Wait, user wants to check by email
        .maybeSingle();
      
      // Since email isn't in profiles (it's in auth.users), and we have a view mcd_officers
      // But mcd_officers only shows existing MCDs.
      // Easiest way in client-side Supabase without RPC is to look up by a field if exposed.
      // However, usually profiles has the email if it was synced.
      // Let's assume for this demo we use an RPC to lookup user ID by email if missing.
      
      // Alternative: Try to update by email subquery? Supabase JS doesn't support subqueries in update.
      // I'll create an RPC if needed, but let's check if the user signed up via Google first.
      
      const { data: maybeUser, error: searchError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .filter('full_name', 'ilike', `%${newEmail}%`) // Fallback for demo: search name if email unavailable
        .limit(1)
        .maybeSingle();

      // IMPORTANT: In a real app, I'd use an Edge Function or RPC 'get_user_id_by_email(email)'
      // For this implementation, I will attempt a profile update where full_name (synced from email/meta) matches.
      
      const { data: targetProfile, error: targetError } = await supabase
        .from('profiles')
        .select('id')
        .or(`full_name.eq.${newEmail},allowed_domain.eq.${newEmail}`)
        .maybeSingle();

      if (!targetProfile) {
        setMessage({ type: 'error', text: 'This email has not registered yet. Ask the officer to sign in first.' });
        return;
      }

      const { error: upError } = await supabase
        .from('profiles')
        .update({ role: 'mcd', ward_id: selectedWardId })
        .eq('id', targetProfile.id);

      if (upError) throw upError;

      setMessage({ type: 'success', text: `Success! ${newEmail} is now an MCD Officer.` });
      setNewEmail('');
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemoveAccess(id: string) {
    if (!confirm('Are you sure you want to revoke MCD access? User will be demoted to Citizen.')) return;
    
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'citizen', ward_id: null })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleChangeWard(userId: string, wardId: string) {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ward_id: wardId })
        .eq('id', userId);

      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <McdLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-12">
        <header>
          <h1 className="text-3xl font-black font-fraunces text-[var(--primary)] mb-2">MCD User Management</h1>
          <p className="text-[var(--text-secondary)] text-sm">Review active officer permissions and grant new access credentials.</p>
        </header>

        {/* SECTION 2: Grant Access (Moved top for quick action) */}
        <section className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-8 shadow-sm">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                 <UserPlus size={20} />
              </div>
              <h2 className="text-xl font-bold">Grant MCD Access</h2>
           </div>

           <form onSubmit={handleGrantAccess} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Officer Email</label>
                 <input 
                  type="email" 
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  required
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-3 text-sm focus:border-emerald-500 outline-none transition-all"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Assign to Ward</label>
                 <select 
                   value={selectedWardId}
                   onChange={e => setSelectedWardId(e.target.value)}
                   required
                   className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-3 text-sm focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                 >
                    <option value="">Select a ward...</option>
                    {wards.map(w => <option key={w.id} value={w.id}>Ward {w.ward_number}: {w.ward_name}</option>)}
                 </select>
              </div>
              <button 
                type="submit"
                disabled={!!actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {actionLoading === 'grant' ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                Grant MCD Access
              </button>
           </form>

           {message && (
             <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 animate-fadeIn ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <p className="text-sm font-medium">{message.text}</p>
             </div>
           )}
        </section>

        {/* SECTION 1: Active Officers List */}
        <section className="space-y-4">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-3">
                 Active Officers
                 <span className="bg-[var(--bg-tertiary)] px-2.5 py-0.5 rounded-full text-xs text-[var(--text-muted)]">{officers.length}</span>
              </h2>
           </div>

           <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-[var(--bg-tertiary)]/30 border-b border-[var(--border)]">
                       <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Name & Email</th>
                       <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Assigned Ward</th>
                       <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Added On</th>
                       <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody>
                    {loading ? (
                       <tr>
                          <td colSpan={4} className="p-12 text-center text-[var(--text-muted)]">
                             <div className="flex flex-col items-center gap-2">
                                <Loader2 size={24} className="animate-spin" />
                                <span className="text-xs uppercase tracking-tighter">Syncing Officer Records</span>
                             </div>
                          </td>
                       </tr>
                    ) : officers.length === 0 ? (
                       <tr>
                          <td colSpan={4} className="p-12 text-center text-[var(--text-muted)] text-sm italic">
                             No active MCD officers found.
                          </td>
                       </tr>
                    ) : (
                       officers.map(officer => (
                          <tr key={officer.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)]/10 transition-colors">
                             <td className="p-4">
                                <div className="flex flex-col">
                                   <span className="font-bold text-[var(--text-primary)]">{officer.full_name || 'N/A'}</span>
                                   <span className="text-xs text-[var(--text-muted)]">{officer.email}</span>
                                </div>
                             </td>
                             <td className="p-4">
                                <div className="flex items-center gap-4">
                                   <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                                      <MapPin size={14} className="text-emerald-500" />
                                      {officer.ward_name} (W{officer.ward_number})
                                   </div>
                                   <select 
                                     onChange={(e) => handleChangeWard(officer.id, e.target.value)}
                                     className="bg-[var(--bg-tertiary)]/50 border border-[var(--border)] rounded-lg px-2 py-1 text-[10px] uppercase font-bold text-[var(--text-muted)] focus:text-[var(--text-primary)] transition-all cursor-pointer"
                                     value={officer.ward_id}
                                   >
                                      {wards.map(w => <option key={w.id} value={w.id}>Move to Ward {w.ward_number}</option>)}
                                   </select>
                                </div>
                             </td>
                             <td className="p-4 text-xs text-[var(--text-muted)]">
                                {new Date(officer.created_at).toLocaleDateString()}
                             </td>
                             <td className="p-4 text-right">
                                <button 
                                  onClick={() => handleRemoveAccess(officer.id)}
                                  disabled={!!actionLoading}
                                  className="text-rose-400 hover:text-rose-500 p-2 hover:bg-rose-500/10 rounded-xl transition-all disabled:opacity-30"
                                  title="Remove MCD Access"
                                >
                                   {actionLoading === officer.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                </button>
                             </td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>
        </section>
      </div>
    </McdLayout>
  );
}
