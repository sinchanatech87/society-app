import React from 'react';
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

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : user?.role?.slice(0, 2).toUpperCase() || 'U';

  return (
    <aside style={{
      width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.5px' }}>
          🏢 SocietyMS
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>Sunrise Heights CHS</div>
      </div>

      {/* Nav */}
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

      {/* User block */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 600, flexShrink: 0, color: '#fff'
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name || user?.username}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{user?.role}</div>
        </div>
        <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 14, cursor: 'pointer', padding: 4 }}>⏻</button>
      </div>
    </aside>
  );
};

const NavItem: React.FC<{ path: string; label: string; icon: string }> = ({ path, label, icon }) => (
  <NavLink to={path} end={path === '/'} style={({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
    color: isActive ? 'var(--accent)' : 'var(--text2)',
    background: isActive ? 'rgba(79,142,247,0.12)' : 'transparent',
    border: isActive ? '1px solid rgba(79,142,247,0.25)' : '1px solid transparent',
    fontSize: 13, marginBottom: 2, textDecoration: 'none', transition: 'all .15s'
  })}>
    <span style={{ fontSize: 14 }}>{icon}</span>
    {label}
  </NavLink>
);

export default Sidebar;
