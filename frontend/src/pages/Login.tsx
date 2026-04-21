import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ username: '', password: '' });
  const [loading, setLoad]  = useState(false);
  const [role, setRole]     = useState<'admin'|'member'>('admin');

  if (user) return <Navigate to="/" replace />;

  const fillDemo = (r: 'admin'|'member') => {
    setRole(r);
    setForm({ username: r === 'admin' ? 'admin@society.com' : 'ramesh@society.com', password: 'Society@123' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoad(true);
    try {
      await login(form.username, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoad(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:'36px 32px', width:360 }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:20, color:'var(--accent)', textAlign:'center', marginBottom:4 }}>🏢 SocietyMS</div>
        <div style={{ textAlign:'center', color:'var(--text2)', fontSize:13, marginBottom:28 }}>Society Management System</div>

        {/* Role toggle */}
        <div style={{ display:'flex', gap:6, marginBottom:20 }}>
          {(['admin','member'] as const).map(r => (
            <button key={r} onClick={() => fillDemo(r)} style={{
              flex:1, padding:8, borderRadius:8, border:'1px solid',
              borderColor: role===r ? 'var(--accent)' : 'var(--border2)',
              background: role===r ? 'rgba(79,142,247,0.15)' : 'var(--bg3)',
              color: role===r ? 'var(--accent)' : 'var(--text2)',
              cursor:'pointer', fontSize:12, textTransform:'capitalize', fontFamily:'DM Sans,sans-serif'
            }}>{r === 'admin' ? '👤 Admin' : '🏠 Member'}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:12, color:'var(--text2)', marginBottom:5 }}>Username / Email</label>
            <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="admin@society.com" required />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontSize:12, color:'var(--text2)', marginBottom:5 }}>Password</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} style={{
            width:'100%', padding:11, background:'var(--accent)', border:'none', borderRadius:8,
            color:'#fff', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'DM Sans,sans-serif',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
        <div style={{ marginTop:16, fontSize:11, color:'var(--text3)', textAlign:'center' }}>
          Demo: admin@society.com / Society@123
        </div>
      </div>
    </div>
  );
};

export default Login;
