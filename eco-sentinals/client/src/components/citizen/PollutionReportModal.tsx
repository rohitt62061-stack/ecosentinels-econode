import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';

interface PollutionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: { type: string; description: string }) => void;
}

const ISSUE_TYPES = [
  { id: 'burning_smell', label: 'Burning smell' },
  { id: 'construction_dust', label: 'Construction dust' },
  { id: 'overflowing_bins', label: 'Overflowing bins' },
  { id: 'other', label: 'Other' }
];

export default function PollutionReportModal({ isOpen, onClose, onSubmit }: PollutionReportModalProps) {
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    setIsSubmitting(true);
    await onSubmit({ type: selectedType, description });
    setIsSubmitting(false);
    onClose();
    // Reset state after close
    setSelectedType('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[3000] flex items-end justify-center sm:items-center p-4">
      <div 
        className="bg-[var(--bg-secondary)] border border-[var(--border)] w-full max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-slideUp sm:animate-fadeIn"
      >
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <AlertCircle size={20} className="text-amber-500" />
            Report an Issue
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-tertiary)] rounded-full transition-colors"
          >
            <X size={20} className="text-[var(--text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[var(--text-secondary)]">
              What are you seeing?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ISSUE_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={`px-3 py-3 rounded-xl border text-xs font-medium text-center transition-all ${
                    selectedType === type.id
                      ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                      : 'bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-secondary)]'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-[var(--text-secondary)]">
              Short Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 140))}
              placeholder="Provide more context (max 140 chars)..."
              className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none h-24"
            />
            <div className="flex justify-end">
              <span className="text-[10px] text-[var(--text-muted)]">
                {description.length}/140
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedType || isSubmitting}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Submit Report
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
