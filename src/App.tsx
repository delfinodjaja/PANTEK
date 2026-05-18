import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChainProvider } from './context/ChainContext';
import { Layout } from './components/Layout';
import { Overview } from './pages/Overview';
import { LiveMap } from './pages/LiveMap';
import { Assets } from './pages/Assets';
import { ScenarioLab } from './pages/ScenarioLab';
import { AnalysisEngine } from './pages/Analysis';
import { Monitoring } from './pages/Monitoring';
import { SystemLog } from './pages/Log';

import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <BrowserRouter>
      <ChainProvider>
        <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
        <Layout>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/map" element={<LiveMap />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/lab" element={<ScenarioLab />} />
            <Route path="/analysis" element={<AnalysisEngine />} />
            <Route path="/log" element={<SystemLog />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </ChainProvider>
    </BrowserRouter>
  );
}
