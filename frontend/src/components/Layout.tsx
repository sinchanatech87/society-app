import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--text3)' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }} className="main-content">
        <Outlet />
      </main>
      <style>{`
        @media (max-width: 768px) {
          .main-content {
            padding: 70px 16px 80px 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;