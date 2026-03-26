import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useEffect } from 'react';

export default function AuthGuard({ requiredRole }: { requiredRole: 'mcd' | 'citizen' }) {
  const { session, role, isReady } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (isReady && session && requiredRole && role !== requiredRole) {
      const message = requiredRole === 'mcd' 
        ? "Access denied — MCD accounts only" 
        : "Access denied — Citizen accounts only";
      showToast(message, 'error');
      console.warn(`Unauthorized access attempt to ${requiredRole} route by ${role}`);
    }
  }, [isReady, session, role, requiredRole, showToast]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium animate-pulse text-sm">Validating clearance...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'mcd' ? '/mcd/dashboard' : '/citizen/home'} replace />;
  }

  return <Outlet />;
}

