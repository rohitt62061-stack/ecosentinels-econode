import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './components/AuthGuard';
import Splash from './pages/Splash';
import SelectRole from './pages/SelectRole';
import McdLogin from './pages/mcd/Login';
import CitizenLogin from './pages/citizen/Login';
import Dashboard from './pages/mcd/Dashboard';
import Wards from './pages/mcd/Wards';
import Fleet from './pages/mcd/Fleet';
import Policy from './pages/mcd/Policy';
import Reports from './pages/mcd/Reports';
import CitizenPreview from './pages/mcd/CitizenPreview';
import UserManagement from './pages/mcd/UserManagement';
import Home from './pages/citizen/Home';
import Waste from './pages/citizen/Waste';
import Score from './pages/citizen/Score';
import { AuthCallback } from './pages/auth/AuthCallback';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<ErrorBoundary><Splash /></ErrorBoundary>} />
          <Route path="/select" element={<ErrorBoundary><SelectRole /></ErrorBoundary>} />

          {/* Auth Routes */}
          <Route path="/mcd/login" element={<ErrorBoundary><McdLogin /></ErrorBoundary>} />
          <Route path="/citizen/login" element={<ErrorBoundary><CitizenLogin /></ErrorBoundary>} />
          <Route path="/auth/callback" element={<ErrorBoundary><AuthCallback /></ErrorBoundary>} />

          {/* Protected MCD Routes */}
          <Route element={<AuthGuard requiredRole="mcd" />}>
            <Route path="/mcd/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
            <Route path="/mcd/wards" element={<ErrorBoundary><Wards /></ErrorBoundary>} />
            <Route path="/mcd/fleet" element={<ErrorBoundary><Fleet /></ErrorBoundary>} />
            <Route path="/mcd/policy" element={<ErrorBoundary><Policy /></ErrorBoundary>} />
            <Route path="/mcd/reports" element={<ErrorBoundary><Reports /></ErrorBoundary>} />
            <Route path="/mcd/citizen-preview" element={<ErrorBoundary><CitizenPreview /></ErrorBoundary>} />
            <Route path="/mcd/settings/users" element={<ErrorBoundary><UserManagement /></ErrorBoundary>} />
          </Route>

          {/* Protected Citizen Routes */}
          <Route element={<AuthGuard requiredRole="citizen" />}>
            <Route path="/citizen/home" element={<ErrorBoundary><Home /></ErrorBoundary>} />
            <Route path="/citizen/waste" element={<ErrorBoundary><Waste /></ErrorBoundary>} />
            <Route path="/citizen/score" element={<ErrorBoundary><Score /></ErrorBoundary>} />
          </Route>

          {/* 404 Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
