import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import ImageCrawl from './test';
import './App.css';

import { Carte } from './pages/Carte';

// Component wrapper for the old structure to be accessible via /test
const OldTestComponents = () => (
  <div>
    <ImageCrawl />
  </div>
);

function App() {
  return (
    <BrowserRouter basename="/vivant">
      <Routes>
        {/* Redirection racine vers /home */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        {/* Wrapper pour conserver le MainLayout sur toutes ces routes */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/carte" element={<OldTestComponents />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
