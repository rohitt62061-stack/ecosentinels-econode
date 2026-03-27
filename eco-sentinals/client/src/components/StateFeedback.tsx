import React from 'react';
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';

interface FeedbackProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: FeedbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-red-500/10 bg-red-500/5">
      <AlertTriangle className="text-red-500 mb-4" size={32} />
      <h3 className="text-sm font-bold text-red-700 underline underline-offset-4 decoration-red-500/30 mb-2 uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
        System Interrupt
      </h3>
      <p className="text-xs text-red-600/70 mb-6 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
        >
          <RefreshCw size={12} />
          Protocol Reset
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] opacity-60">
      <Inbox className="text-[var(--text-muted)] mb-4" size={32} />
      <p className="text-[10px] uppercase font-mono tracking-[0.2em] text-[var(--text-muted)]">{message}</p>
    </div>
  );
}
