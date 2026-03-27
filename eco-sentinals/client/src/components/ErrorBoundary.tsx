import { Component, ReactNode } from 'react';

interface Props { 
  children: ReactNode; 
  fallback?: ReactNode; 
}

interface State { 
  hasError: boolean; 
  error?: Error; 
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('Econode component error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 text-center opacity-60 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
          <div className="text-2xl mb-2">⚠</div>
          <p className="text-sm font-medium">This section failed to load</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 text-xs px-4 py-1.5 bg-transparent border border-[var(--border)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
