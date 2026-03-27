import React from 'react';

const EmptyState = ({ 
  icon = "sentiment_dissatisfied", 
  title = "No Data Available", 
  description = "There is nothing here yet.", 
  actionLabel, 
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in w-full h-full max-w-sm mx-auto">
      {/* Icon with Ring */}
      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4 text-secondary">
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>

      {/* Title */}
      <h3 className="font-headline font-bold text-slate-800 text-base mb-1">{title}</h3>

      {/* Description */}
      <p className="font-body text-slate-400 text-xs leading-relaxed mb-6">{description}</p>

      {/* Optional Action Button */}
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold font-headline transition-colors shadow-sm active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
