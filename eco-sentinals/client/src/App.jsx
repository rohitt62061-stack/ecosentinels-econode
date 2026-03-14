import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import MCDDashboard from './pages/MCDDashboard';
import CitizenApp from './pages/CitizenApp';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen font-sans">
          <main>
            <Routes>
              <Route path="/" element={<Navigate to="/mcd-dashboard" replace />} />
              <Route path="/mcd-dashboard" element={<MCDDashboard />} />
              <Route path="/citizen-app" element={<CitizenApp />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
