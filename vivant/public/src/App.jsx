import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import ImageCrawl from './test';
import TestSvg from './ExtractSvg';
import './App.css';

import { Carte } from './pages/Carte';

// Component wrapper for the old structure to be accessible via /test
const OldTestComponents = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-8">Test Zone</h1>
    <ImageCrawl />
    <TestSvg />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Default Route, the new landing page */}
          <Route index element={<Home />} />
          
          {/* Route to whatever they were previously testing */}
          <Route path="test" element={<OldTestComponents />} />

          {/* Route for the map */}
          <Route path="carte" element={<Carte />} />

          {/* You can add more routes here, e.g. <Route path="about" element={<About />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
