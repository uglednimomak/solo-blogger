import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<App view="about" />} />
        <Route path="/summaries" element={<App view="summaries" />} />
        <Route path="/summaries/:summaryId" element={<App view="summary-detail" />} />
        <Route path="/:slug" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
