import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import { DemoProvider } from './context/DemoContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { IssuerDashboard } from './pages/IssuerDashboard';
import { StudentWallet } from './pages/StudentWallet';
import { VerifyPortal } from './pages/VerifyPortal';
import { TamperDemo } from './pages/TamperDemo';
import { RevocationDemo } from './pages/RevocationDemo';
import { ActivityPage } from './pages/ActivityPage';
import { ArchitecturePage } from './pages/ArchitecturePage';

export const App: React.FC = () => {
  return (
    <WalletProvider>
      <DemoProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                {/* 2 Primary Portals: Organization & Student */}
                <Route path="/issuer" element={<IssuerDashboard />} />
                <Route path="/organization" element={<Navigate to="/issuer" replace />} />
                <Route path="/wallet" element={<StudentWallet />} />
                <Route path="/student" element={<Navigate to="/wallet" replace />} />
                {/* Verifier & Explorer */}
                <Route path="/verify" element={<VerifyPortal />} />
                <Route path="/activity" element={<ActivityPage />} />
                <Route path="/tamper-demo" element={<TamperDemo />} />
                <Route path="/registry" element={<RevocationDemo />} />
                <Route path="/architecture" element={<ArchitecturePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </DemoProvider>
    </WalletProvider>
  );
};

export default App;
