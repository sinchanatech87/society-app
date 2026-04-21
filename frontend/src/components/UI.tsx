import React from 'react';

/* ── BUTTON ─────────────────────────────────────────────────────────────── */
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}
export const Btn: React.FC<BtnProps> = ({ variant = 'ghost', size = 'md', children, style, ...rest }) => {
  const base: React.CSSProperties = {
    padding: size === 'sm' ? '5px 12px' : '8px 16px',
    fontSize: size === 'sm' ? 12 : 13,
    borderRadius: 8,
    border: '1px solid',
    transition: 'all .15s',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    ...style,
  };
  const variants = {
    primary: { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' },
    ghost:   { background: 'var(--bg3)',    borderColor: 'var(--border2)', color: 'var(--text)' },
    danger:  { background: 'transparent',   borderColor: 'var(--danger)',  color: 'var(--danger)' },
  };
  return <button style={{ ...base, ...variants[variant] }} {...rest}>{children}</button>;
};

/* ── MODAL ──────────────────────────────────────────────────────────────── */
export const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--card2)', border:'1px solid var(--border2)', borderRadius:16, padding:24, width:440, maxHeight:'85vh', overflowY:'auto' }}>
        <h2 style={{ fontSize:16, fontWeight:600, marginBottom:20 }}>{title}</h2>
        {children}
      </div>
    </div>
  );
};

/* ── FORM GROUP ─────────────────────────────────────────────────────────── */
export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display:'block', fontSize:12, color:'var(--text2)', marginBottom:5 }}>{label}</label>
    {children}
  </div>
);

/* ── STAT CARD ──────────────────────────────────────────────────────────── */
export const StatCard: React.FC<{ label: string; value: string | number; sub?: string; color?: string }> = ({ label, value, sub, color = 'var(--accent)' }) => (
  <div className="card">
    <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 }}>{label}</div>
    <div style={{ fontSize:26, fontWeight:600, color, lineHeight:1 }}>{value}</div>
    {sub && <div style={{ fontSize:11, color:'var(--text3)', marginTop:5 }}>{sub}</div>}
  </div>
);

/* ── TABLE CARD ─────────────────────────────────────────────────────────── */
export const TableCard: React.FC<{
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, action, children }) => (
  <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
    <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <span style={{ fontSize:14, fontWeight:500 }}>{title}</span>
      {action}
    </div>
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        {children}
      </table>
    </div>
  </div>
);

export const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, color:'var(--text3)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'1px solid var(--border)', background:'var(--bg2)', whiteSpace:'nowrap' }}>{children}</th>
);

export const Td: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <td style={{ padding:'11px 16px', borderBottom:'1px solid rgba(42,51,82,.5)', fontSize:13, verticalAlign:'middle', ...style }}>{children}</td>
);

/* ── PILL ───────────────────────────────────────────────────────────────── */
export const Pill: React.FC<{ variant: 'green'|'red'|'blue'|'warn'|'gray'; children: React.ReactNode }> = ({ variant, children }) => (
  <span className={`pill pill-${variant}`}>{children}</span>
);

/* ── PAGE HEADER ────────────────────────────────────────────────────────── */
export const PageHeader: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
    <h1 style={{ fontSize:20, fontWeight:600 }}>{title}</h1>
    {action}
  </div>
);

/* ── LOADING ────────────────────────────────────────────────────────────── */
export const Loader: React.FC = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200, color:'var(--text3)' }}>Loading...</div>
);
