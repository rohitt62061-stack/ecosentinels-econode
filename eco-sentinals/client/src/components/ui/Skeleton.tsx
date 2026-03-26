import React from 'react';

interface SkeletonProps {
  className?: string;
  rows?: number;
}

export const SkeletonCard: React.FC<SkeletonProps> = ({ className = '', rows = 3 }) => {
  return (
    <div className={`skeleton-card-container ${className}`}>
      <div className="skeleton-image shimmer" />
      <div className="skeleton-content">
        <div className="skeleton-title shimmer" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-text shimmer" style={{ width: `${Math.random() * 40 + 60}%` }} />
        ))}
      </div>
    </div>
  );
};

export const SkeletonRow: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`skeleton-row shimmer ${className}`} />
  );
};
