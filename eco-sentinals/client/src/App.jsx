import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MCDDashboard from './pages/MCDDashboard';
import CitizenApp from './pages/CitizenApp';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
        <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">
                  EN
                </div>
                <span className="font-semibold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                  EcoNode
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 ml-2">
                  Viksit Bharat 2047
                </span>
              </div>
              <div className="flex space-x-4">
                <Link
                  to="/mcd-dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  MCD Dashboard
                </Link>
                <Link
                  to="/citizen-app"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Citizen App
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<MCDDashboard />} />
            <Route path="/mcd-dashboard" element={<MCDDashboard />} />
            <Route path="/citizen-app" element={<CitizenApp />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
