import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/',            label: 'Dashboard',   icon: '⊞', adminOnly: false },
  { path: '/members',     label: 'Members',     icon: '👥', adminOnly: false },
  { path: '/maintenance', label: 'Maintenance', icon: '🔄', adminOnly: true  },
  { path: '/payments',    label: 'Payments',    icon: '💳', adminOnly: true  },
  { path: '/notices',     label: 'Notices',     icon: '📢', adminOnly: false },
  { path: '/complaints',  label: 'Complaints',  icon: '🎫', adminOnly: false },
  { path: '/reports',     label: 'Reports',     icon: '📊', adminOnly: true  },
  { path: '/settings',    label: 'Settings',    icon: '⚙',  adminOnly: true  },
];

const Sidebar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : user?.role?.slice(0, 2).toUpperCase() || 'U';

  const visibleItems = navItems.filter(i => !i.adminOnly || isAdmin);
  const bottomItems = visibleItems.slice(0, 5);

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside style={{
        width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', height: '100vh',
        position: 'sticky', top: 0, flexShrink: 0
      }} className="desktop-sidebar">
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
            🏢 SocietyMS
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>Sunrise Heights CHS</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase', padding: '8px 8px 4px' }}>Overview</div>
          {navItems.slice(0, 1).map(item => <NavItem key={item.path} {...item} />)}
          <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase', padding: '12px 8px 4px' }}>Management</div>
          {navItems.slice(1, 4).filter(i => !i.adminOnly || isAdmin).map(item => <NavItem key={item.path} {...item} />)}
          <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase', padding: '12px 8px 4px' }}>Community</div>
          {navItems.slice(4, 6).map(item => <NavItem key={item.path} {...item} />)}
          {isAdmin && (
            <>
              <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase', padding: '12px 8px 4px' }}>Admin</div>
              {navItems.slice(6).map(item => <NavItem key={item.path} {...item} />)}
            </>
          )}
        </nav>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || user?.username}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{user?.role}</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 14, cursor: 'pointer', padding: 4 }}>⏻</button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="mobile-topbar" style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        padding: '12px 16px', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>🏢 SocietyMS</div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 20, cursor: 'pointer' }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* MOBILE DRAWER MENU */}
      {menuOpen && (
        <div className="mobile-drawer" style={{
          display: 'none', position: 'fixed', top: 52, left: 0, right: 0, bottom: 0,
          background: 'var(--bg2)', zIndex: 99, overflowY: 'auto', padding: '12px 8px'
        }}>
          {visibleItems.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderRadius: 10, marginBottom: 4, textDecoration: 'none',
                background: isActive ? 'rgba(79,142,247,0.12)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text)', fontSize: 15,
                border: isActive ? '1px solid rgba(79,142,247,0.25)' : '1px solid transparent'
              })}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12 }}>
            <button onClick={handleLogout} style={{
              width: '100%', padding: '12px 16px', background: 'transparent',
              border: '1px solid var(--danger)', borderRadius: 10, color: 'var(--danger)',
              fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
            }}>⏻ Logout</button>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAV */}
      <div className="mobile-bottom-nav" style={{
        display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--bg2)', borderTop: '1px solid var(--border)',
        padding: '8px 0', justifyContent: 'space-around', alignItems: 'center'
      }}>
        {bottomItems.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '4px 8px', borderRadius: 8, textDecoration: 'none', minWidth: 48,
              color: isActive ? 'var(--accent)' : 'var(--text3)', fontSize: 10, fontWeight: 500
            })}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .mobile-bottom-nav { display: flex !important; }
          .mobile-drawer { display: block !important; }
        }
      `}</style>
    </>
  );
};

const NavItem: React.FC<{ path: string; label: string; icon: string }> = ({ path, label, icon }) => (
  <NavLink to={path} end={path === '/'} style={({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8,
    cursor: 'pointer', color: isActive ? 'var(--accent)' : 'var(--text2)',
    background: isActive ? 'rgba(79,142,247,0.12)' : 'transparent',
    border: isActive ? '1px solid rgba(79,142,247,0.25)' : '1px solid transparent',
    fontSize: 13, marginBottom: 2, textDecoration: 'none', transition: 'all .15s'
  })}>
    <span style={{ fontSize: 14 }}>{icon}</span>
    {label}
  </NavLink>
);

export default Sidebar;