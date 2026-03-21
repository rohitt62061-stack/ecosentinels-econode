import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthGuard({ requiredRole }: { requiredRole: 'mcd' | 'citizen' }) {
  const { session, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f0c] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'mcd' ? "/mcd/dashboard" : "/citizen/home"} replace />;
  }

  return <Outlet />;
}
