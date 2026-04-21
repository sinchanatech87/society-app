import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Maintenance from './pages/Maintenance';
import Payments from './pages/Payments';
import Ledger from './pages/Ledger';
import { Notices, Complaints, Reports, Settings } from './pages/OtherPages';

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: 'var(--card2)', color: 'var(--text)', border: '1px solid var(--border2)', fontSize: 13 },
          success: { iconTheme: { primary: '#2ecc8a', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#e74c6e', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/"            element={<Dashboard />} />
          <Route path="/members"     element={<Members />} />
          <Route path="/members/:id/ledger" element={<Ledger />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/payments"    element={<Payments />} />
          <Route path="/notices"     element={<Notices />} />
          <Route path="/complaints"  element={<Complaints />} />
          <Route path="/reports"     element={<Reports />} />
          <Route path="/settings"    element={<Settings />} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
