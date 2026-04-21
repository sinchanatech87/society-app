import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMemberLedger } from '../api';
import { StatCard, Btn, Loader } from '../components/UI';

const MONTHS = ['','January','February','March','April','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const STATUS_COLOR: Record<string,string> = { PAID:'var(--success)', PARTIAL:'var(--warn)', UNPAID:'var(--danger)' };

const Ledger: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData]   = useState<any>(null);
  const [loading, setLoad] = useState(true);

  useEffect(() => {
    getMemberLedger(Number(id))
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load ledger'))
      .finally(() => setLoad(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!data)   return <div style={{ color:'var(--text3)', padding:40, textAlign:'center' }}>Ledger not found</div>;

  const { member, ledger, summary } = data;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <Btn onClick={() => navigate('/members')}>← Back</Btn>
        <div>
          <h1 style={{ fontSize:20, fontWeight:600 }}>{member.name}</h1>
          <div style={{ fontSize:13, color:'var(--text2)' }}>{member.Unit?.unit_number} · {member.Unit?.unit_type} · {member.occupancy}</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        <StatCard label="Total Billed"  value={`₹${Number(summary.total_due).toLocaleString()}`}   color="var(--accent)" />
        <StatCard label="Total Paid"    value={`₹${Number(summary.total_paid).toLocaleString()}`}   color="var(--success)" />
        <StatCard label="Outstanding"   value={`₹${Number(summary.outstanding).toLocaleString()}`}  color={summary.outstanding > 0 ? 'var(--danger)' : 'var(--success)'} />
      </div>

      <div className="card">
        <div style={{ fontSize:13, fontWeight:500, color:'var(--text2)', marginBottom:14 }}>Maintenance Ledger</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 90px 90px 90px 80px', fontSize:11, color:'var(--text3)', padding:'0 0 8px', borderBottom:'1px solid var(--border)', gap:8 }}>
          <span>Month</span><span style={{ textAlign:'right' }}>Due</span><span style={{ textAlign:'right' }}>Paid</span><span style={{ textAlign:'right' }}>Balance</span><span style={{ textAlign:'right' }}>Status</span>
        </div>
        {ledger.map((row: any) => (
          <div key={row.cycle_id} style={{ display:'grid', gridTemplateColumns:'1fr 90px 90px 90px 80px', padding:'10px 0', borderBottom:'1px solid rgba(42,51,82,.4)', fontSize:13, gap:8, alignItems:'center' }}>
            <span>{MONTHS[row.month]} {row.year}</span>
            <span style={{ textAlign:'right', color:'var(--text2)' }}>₹{Number(row.amount_due).toLocaleString()}</span>
            <span style={{ textAlign:'right', color:'var(--success)' }}>₹{Number(row.amount_paid).toLocaleString()}</span>
            <span style={{ textAlign:'right', fontWeight:500, color: STATUS_COLOR[row.status] }}>₹{Number(row.balance).toLocaleString()}</span>
            <span style={{ textAlign:'right' }}>
              <span style={{ fontSize:11, fontWeight:500, color: STATUS_COLOR[row.status] }}>{row.status}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ledger;
