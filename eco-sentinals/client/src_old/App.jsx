import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MCDDashboard from './pages/MCDDashboard';
import CitizenApp from './pages/CitizenApp';
import CitizenProfile from './pages/CitizenProfile';
import AlertsManagement from './pages/AlertsManagement';
import ReportSelectCategory from './pages/ReportSelectCategory';

import Onboarding from './pages/Onboarding';
import CitizenLogin from './pages/CitizenLogin';
import MCDLogin from './pages/MCDLogin';
import MCDProfile from './pages/MCDProfile';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/citizen-login"    element={<CitizenLogin />} />
          <Route path="/mcd-login"        element={<MCDLogin />} />
          <Route path="/mcd-profile"      element={<MCDProfile />} />
          <Route path="/mcd-dashboard"    element={<MCDDashboard />} />
          <Route path="/citizen-app"      element={<CitizenApp />} />
          <Route path="/citizen-profile"  element={<CitizenProfile />} />
          <Route path="/alerts-management" element={<AlertsManagement />} />
          <Route path="/report"           element={<ReportSelectCategory />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
