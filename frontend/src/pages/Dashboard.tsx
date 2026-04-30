import React, { useEffect, useState } from 'react';
//mobile resposive update 
import { StatCard, TableCard, Th, Td, Pill, Loader } from '../components/UI';
import { getDuesReport, getMaintenanceReport, getPayments } from '../api';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [dues, setDues]         = useState<any[]>([]);
  const [reports, setReports]   = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoad]      = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (isAdmin) {
          const [d, r, p] = await Promise.all([getDuesReport(), getMaintenanceReport(), getPayments()]);
          setDues(d.data);
          setReports(r.data);
          setPayments(p.data.slice(0, 5));
        }
      } catch {}
      setLoad(false);
    };
    load();
  }, [isAdmin]);

  if (loading) return <Loader />;

  const totalOutstanding = dues.reduce((s: number, d: any) => s + d.totalOutstanding, 0);
  const latestCycle      = reports[0];
  const collected        = latestCycle?.collected || 0;
  const flatTotal        = 19 * (latestCycle?.flat_amount || 2000);
  const shopTotal        = 5  * (latestCycle?.shop_amount || 3200);
  const totalDue         = flatTotal + shopTotal;
  const pct              = totalDue > 0 ? Math.round((collected / totalDue) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>Sunrise Heights CHS — 19 Flats · 5 Shops</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }} className="stat-grid-4">
        <StatCard label="Total Units"    value={24}    sub="19 Flats · 5 Shops" />
        <StatCard label="Apr Collection" value={`₹${collected.toLocaleString()}`} sub={`of ₹${totalDue.toLocaleString()} due`} color="var(--warn)" />
        <StatCard label="Collection %"   value={`${pct}%`} sub={`${dues.length} members pending`} color={pct >= 80 ? 'var(--success)' : 'var(--warn)'} />
        <StatCard label="Total Dues"     value={`₹${totalOutstanding.toLocaleString()}`} sub="Outstanding balance" color="var(--danger)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="two-col">
        {/* Progress */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: 14 }}>Collection Status</div>
          {[
            { label: `Flats (19)`, collected: Math.min(collected * 0.7, flatTotal), total: flatTotal, color: 'var(--accent)' },
            { label: `Shops (5)`,  collected: Math.min(collected * 0.3, shopTotal), total: shopTotal, color: 'var(--accent2)' },
          ].map(r => (
            <div key={r.label} style={{ marginBottom: 12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                <span>{r.label}</span>
                <span style={{ color:'var(--text2)' }}>₹{Math.round(r.collected).toLocaleString()} / ₹{r.total.toLocaleString()}</span>
              </div>
              <div style={{ height:6, background:'var(--bg3)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${Math.round((r.collected/r.total)*100)}%`, background:r.color, borderRadius:3 }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
              <span style={{ color:'var(--text)' }}>Overall</span>
              <span style={{ color:'var(--warn)', fontWeight:500 }}>{pct}%</span>
            </div>
            <div style={{ height:6, background:'var(--bg3)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background:'var(--warn)', borderRadius:3, transition:'width .5s' }} />
            </div>
          </div>
        </div>

        {/* Recent payments */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: 12 }}>Recent Payments</div>
          {payments.length === 0 && <div style={{ color:'var(--text3)', fontSize:13 }}>No payments yet</div>}
          {payments.map((p: any) => (
            <div key={p.id} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border)', fontSize:12 }}>
              <span>{p.Member?.Unit?.unit_number} · {p.Member?.name}</span>
              <span style={{ color:'var(--success)' }}>+₹{Number(p.amount_paid).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pending dues table */}
      {dues.length > 0 && (
        <TableCard title={`Pending Dues (${dues.length} members)`}>
          <thead><tr><Th>Unit</Th><Th>Member</Th><Th>Type</Th><Th>Outstanding</Th></tr></thead>
          <tbody>
            {dues.slice(0, 5).map((d: any) => (
              <tr key={d.member.id}>
                <Td><span style={{ fontFamily:'Space Mono,monospace', fontSize:12 }}>{d.member.Unit?.unit_number}</span></Td>
                <Td>{d.member.name}</Td>
                <Td><Pill variant={d.member.Unit?.unit_type === 'FLAT' ? 'blue' : 'warn'}>{d.member.Unit?.unit_type}</Pill></Td>
                <Td><span style={{ color:'var(--danger)', fontWeight:500 }}>₹{d.totalOutstanding.toLocaleString()}</span></Td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      )}
    </div>
  );
};

export default Dashboard;
