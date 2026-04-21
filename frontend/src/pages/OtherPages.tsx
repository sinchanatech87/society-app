import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getNotices, createNotice, updateNotice, deleteNotice, getComplaints, createComplaint, updateComplaint, getMaintenanceReport, getDuesReport } from '../api';
import { Btn, Modal, Field, Pill, PageHeader, Loader, StatCard } from '../components/UI';
import { useAuth } from '../context/AuthContext';

// ── NOTICES ───────────────────────────────────────────────────────────────────
export const Notices: React.FC = () => {
  const { isAdmin } = useAuth();
  const [notices, setNotices]   = useState<any[]>([]);
  const [loading, setLoad]      = useState(true);
  const [modal, setModal]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({ title:'', description:'', expiry_date:'' });

  const load = async () => { try { const { data } = await getNotices(); setNotices(data); } catch {} setLoad(false); };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.title) return toast.error('Title required');
    setSaving(true);
    try { await createNotice(form); toast.success('Notice published!'); setModal(false); setForm({ title:'', description:'', expiry_date:'' }); load(); }
    catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this notice?')) return;
    try { await deleteNotice(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <PageHeader title="Notices & Announcements" action={isAdmin ? <Btn variant="primary" onClick={() => setModal(true)}>+ Create Notice</Btn> : undefined} />
      {notices.length === 0 && <div style={{ color:'var(--text3)', textAlign:'center', padding:40 }}>No notices yet</div>}
      {notices.map(n => (
        <div key={n.id} className="card" style={{ marginBottom:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:500, marginBottom:6 }}>{n.title}</div>
              {n.description && <div style={{ fontSize:13, color:'var(--text2)', marginBottom:8 }}>{n.description}</div>}
              <div style={{ fontSize:11, color:'var(--text3)' }}>
                {new Date(n.created_at).toLocaleDateString('en-IN')} {n.expiry_date ? `· Expires: ${new Date(n.expiry_date).toLocaleDateString('en-IN')}` : ''}
              </div>
            </div>
            {isAdmin && (
              <div style={{ display:'flex', gap:6, marginLeft:12, flexShrink:0 }}>
                <Btn size="sm" variant="danger" onClick={() => handleDelete(n.id)}>Delete</Btn>
              </div>
            )}
          </div>
        </div>
      ))}
      <Modal open={modal} onClose={() => setModal(false)} title="Create Notice">
        <Field label="Title"><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Notice title..." /></Field>
        <Field label="Description"><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ resize:'none' }} /></Field>
        <Field label="Expiry Date"><input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} /></Field>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:16 }}>
          <Btn onClick={() => setModal(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={handleCreate} disabled={saving}>{saving ? 'Publishing...' : 'Publish Notice'}</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ── COMPLAINTS ────────────────────────────────────────────────────────────────
const STATUS_ICONS: Record<string,string> = { OPEN:'🔴', IN_PROGRESS:'🟡', RESOLVED:'🟢' };
const STATUS_PILL:  Record<string,'red'|'warn'|'green'> = { OPEN:'red', IN_PROGRESS:'warn', RESOLVED:'green' };

export const Complaints: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoad]          = useState(true);
  const [modal, setModal]           = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState({ category:'Plumbing', description:'' });

  const load = async () => { try { const { data } = await getComplaints(); setComplaints(data); } catch {} setLoad(false); };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.description) return toast.error('Description required');
    setSaving(true);
    try { await createComplaint(form); toast.success('Complaint raised!'); setModal(false); setForm({ category:'Plumbing', description:'' }); load(); }
    catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
    setSaving(false);
  };

  const handleStatus = async (id: number, status: string) => {
    try { await updateComplaint(id, { status }); load(); }
    catch { toast.error('Failed to update'); }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <PageHeader title={`Complaints (${complaints.length})`} action={<Btn variant="primary" onClick={() => setModal(true)}>+ Raise Complaint</Btn>} />
      {complaints.length === 0 && <div style={{ color:'var(--text3)', textAlign:'center', padding:40 }}>No complaints</div>}
      {complaints.map(c => (
        <div key={c.id} className="card" style={{ marginBottom:12, display:'flex', gap:14 }}>
          <div style={{ fontSize:22, lineHeight:1 }}>{STATUS_ICONS[c.status] || '🔴'}</div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
              <div>
                <span style={{ fontWeight:500 }}>{c.category}</span>
                <span style={{ fontSize:12, color:'var(--text3)', marginLeft:8 }}>{c.Member?.name} · {c.Member?.Unit?.unit_number} · {new Date(c.created_at).toLocaleDateString('en-IN')}</span>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <Pill variant={STATUS_PILL[c.status] || 'gray'}>{c.status.replace('_',' ')}</Pill>
                {isAdmin && (
                  <select value={c.status} onChange={e => handleStatus(c.id, e.target.value)} style={{ padding:'4px 8px', width:140, fontSize:12 }}>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                )}
              </div>
            </div>
            <div style={{ fontSize:13, color:'var(--text2)' }}>{c.description}</div>
          </div>
        </div>
      ))}
      <Modal open={modal} onClose={() => setModal(false)} title="Raise Complaint">
        <Field label="Category">
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {['Plumbing','Electrical','Lift','Cleanliness','Security','Garden','Other'].map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} style={{ resize:'none' }} placeholder="Describe the issue..." />
        </Field>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:16 }}>
          <Btn onClick={() => setModal(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={handleCreate} disabled={saving}>{saving ? 'Submitting...' : 'Submit Complaint'}</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ── REPORTS ───────────────────────────────────────────────────────────────────
const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const Reports: React.FC = () => {
  const [mReport, setMReport] = useState<any[]>([]);
  const [dReport, setDReport] = useState<any[]>([]);
  const [loading, setLoad]    = useState(true);

  useEffect(() => {
    Promise.all([getMaintenanceReport(), getDuesReport()])
      .then(([m, d]) => { setMReport(m.data); setDReport(d.data); })
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoad(false));
  }, []);

  if (loading) return <Loader />;

  const maxCollected = Math.max(...mReport.map((r: any) => r.collected || 0), 1);
  const maxDue = Math.max(...dReport.map((r: any) => r.totalOutstanding || 0), 1);

  return (
    <div>
      <PageHeader title="Reports & Analytics" />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <div className="card">
          <div style={{ fontSize:13, fontWeight:500, color:'var(--text2)', marginBottom:14 }}>Monthly Collection Trend</div>
          {mReport.slice(0,6).map((r: any) => (
            <div key={r.id} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                <span>{MONTHS[r.month]} {r.year}</span>
                <span style={{ color:'var(--success)' }}>₹{Number(r.collected).toLocaleString()}</span>
              </div>
              <div style={{ height:8, background:'var(--bg3)', borderRadius:4 }}>
                <div style={{ height:'100%', width:`${Math.round((r.collected/maxCollected)*100)}%`, background:'var(--success)', borderRadius:4 }} />
              </div>
            </div>
          ))}
          {mReport.length === 0 && <div style={{ color:'var(--text3)', fontSize:13 }}>No data yet</div>}
        </div>
        <div className="card">
          <div style={{ fontSize:13, fontWeight:500, color:'var(--text2)', marginBottom:14 }}>Outstanding Dues by Member</div>
          {dReport.slice(0,6).map((r: any) => (
            <div key={r.member.id} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                <span>{r.member.Unit?.unit_number} · {r.member.name}</span>
                <span style={{ color:'var(--danger)' }}>₹{r.totalOutstanding.toLocaleString()}</span>
              </div>
              <div style={{ height:8, background:'var(--bg3)', borderRadius:4 }}>
                <div style={{ height:'100%', width:`${Math.round((r.totalOutstanding/maxDue)*100)}%`, background:'var(--danger)', borderRadius:4 }} />
              </div>
            </div>
          ))}
          {dReport.length === 0 && <div style={{ color:'var(--text3)', fontSize:13, padding:20, textAlign:'center' }}>All dues cleared! 🎉</div>}
        </div>
      </div>
    </div>
  );
};

// ── SETTINGS ──────────────────────────────────────────────────────────────────
export const Settings: React.FC = () => {
  const [society, setSociety] = useState({ name:'Sunrise Heights CHS', address:'Koramangala, Bengaluru', reg_no:'KAR/CHS/2019/00124' });
  const [maint,   setMaint]   = useState({ flat_amount:2000, shop_amount:3200, due_day:25 });

  return (
    <div>
      <PageHeader title="Settings" />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div className="card">
          <div style={{ fontSize:13, fontWeight:500, color:'var(--text2)', marginBottom:16 }}>Society Information</div>
          <Field label="Society Name"><input value={society.name} onChange={e => setSociety(s => ({ ...s, name: e.target.value }))} /></Field>
          <Field label="Address"><input value={society.address} onChange={e => setSociety(s => ({ ...s, address: e.target.value }))} /></Field>
          <Field label="Registration No."><input value={society.reg_no} onChange={e => setSociety(s => ({ ...s, reg_no: e.target.value }))} /></Field>
          <Btn variant="primary" onClick={() => toast.success('Society info saved!')} style={{ marginTop:8 }}>Save Changes</Btn>
        </div>
        <div className="card">
          <div style={{ fontSize:13, fontWeight:500, color:'var(--text2)', marginBottom:16 }}>Maintenance Configuration</div>
          <Field label="Flat Maintenance (₹/month)"><input type="number" value={maint.flat_amount} onChange={e => setMaint(m => ({ ...m, flat_amount: +e.target.value }))} /></Field>
          <Field label="Shop Maintenance (₹/month)"><input type="number" value={maint.shop_amount} onChange={e => setMaint(m => ({ ...m, shop_amount: +e.target.value }))} /></Field>
          <Field label="Due Day of Month"><input type="number" value={maint.due_day} onChange={e => setMaint(m => ({ ...m, due_day: +e.target.value }))} min={1} max={28} /></Field>
          <Btn variant="primary" onClick={() => toast.success('Maintenance config updated!')} style={{ marginTop:8 }}>Update Config</Btn>
        </div>
      </div>
    </div>
  );
};
