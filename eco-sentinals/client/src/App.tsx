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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Splash />} />
          <Route path="/select" element={<SelectRole />} />

          {/* Auth Routes */}
          <Route path="/mcd/login" element={<McdLogin />} />
          <Route path="/citizen/login" element={<CitizenLogin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected MCD Routes */}
          <Route element={<AuthGuard requiredRole="mcd" />}>
            <Route path="/mcd/dashboard" element={<Dashboard />} />
            <Route path="/mcd/wards" element={<Wards />} />
            <Route path="/mcd/fleet" element={<Fleet />} />
            <Route path="/mcd/policy" element={<Policy />} />
            <Route path="/mcd/reports" element={<Reports />} />
            <Route path="/mcd/citizen-preview" element={<CitizenPreview />} />
            <Route path="/mcd/settings/users" element={<UserManagement />} />
          </Route>

          {/* Protected Citizen Routes */}
          <Route element={<AuthGuard requiredRole="citizen" />}>
            <Route path="/citizen/home" element={<Home />} />
            <Route path="/citizen/waste" element={<Waste />} />
            <Route path="/citizen/score" element={<Score />} />
          </Route>

          {/* 404 Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
