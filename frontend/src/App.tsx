import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { GuidedDemoPage } from './pages/GuidedDemoPage';

export const App: React.FC = () => {
  return (
    <WalletProvider>
      <DemoProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-[#070C18] text-slate-100 selection:bg-cyan-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/issuer" element={<IssuerDashboard />} />
                <Route path="/wallet" element={<StudentWallet />} />
                <Route path="/verify" element={<VerifyPortal />} />
                <Route path="/registry" element={<RevocationDemo />} />
                <Route path="/tamper-demo" element={<TamperDemo />} />
                <Route path="/activity" element={<ActivityPage />} />
                <Route path="/architecture" element={<ArchitecturePage />} />
                <Route path="/demo" element={<GuidedDemoPage />} />
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
