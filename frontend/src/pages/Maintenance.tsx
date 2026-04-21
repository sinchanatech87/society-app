import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getMaintenance, generateMaintenance, getMembers } from '../api';
import { Btn, Modal, Field, TableCard, Th, Td, Pill, StatCard, PageHeader, Loader } from '../components/UI';

const MONTHS = ['','January','February','March','April','May','June','July','August','September','October','November','December'];

const Maintenance: React.FC = () => {
  const [cycles, setCycles]     = useState<any[]>([]);
  const [members, setMembers]   = useState<any[]>([]);
  const [loading, setLoad]      = useState(true);
  const [modal, setModal]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const now = new Date();
  const [form, setForm] = useState({ month: now.getMonth() + 1, year: now.getFullYear(), flat_amount: 2000, shop_amount: 3200 });

  const load = async () => {
    try {
      const [c, m] = await Promise.all([getMaintenance(), getMembers()]);
      setCycles(c.data); setMembers(m.data);
    } catch { toast.error('Failed to load'); }
    setLoad(false);
  };
  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    setSaving(true);
    try {
      await generateMaintenance(form);
      toast.success(`Maintenance generated for ${MONTHS[form.month]} ${form.year}`);
      setModal(false); load();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed to generate'); }
    setSaving(false);
  };

  if (loading) return <Loader />;

  const flatCount = members.filter(m => m.Unit?.unit_type === 'FLAT' && m.active).length;
  const shopCount = members.filter(m => m.Unit?.unit_type === 'SHOP' && m.active).length;
  const latest    = cycles[0];
  const monthly   = latest ? flatCount * Number(latest.flat_amount) + shopCount * Number(latest.shop_amount) : 0;

  return (
    <div>
      <PageHeader title="Maintenance" action={<Btn variant="primary" onClick={() => setModal(true)}>+ Generate Maintenance</Btn>} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        <StatCard label="Flat Rate"     value={`₹${Number(latest?.flat_amount||2000).toLocaleString()}`} sub="per flat / month" />
        <StatCard label="Shop Rate"     value={`₹${Number(latest?.shop_amount||3200).toLocaleString()}`} sub="per shop / month" color="var(--accent2)" />
        <StatCard label="Monthly Total" value={`₹${monthly.toLocaleString()}`} sub={`${flatCount} flats + ${shopCount} shops`} color="var(--success)" />
      </div>

      <TableCard title="Maintenance Cycles">
        <thead><tr><Th>Month</Th><Th>Year</Th><Th>Flat Amount</Th><Th>Shop Amount</Th><Th>Generated On</Th><Th>Status</Th></tr></thead>
        <tbody>
          {cycles.map(c => (
            <tr key={c.id}>
              <Td>{MONTHS[c.month]}</Td>
              <Td>{c.year}</Td>
              <Td>₹{Number(c.flat_amount).toLocaleString()}</Td>
              <Td>₹{Number(c.shop_amount).toLocaleString()}</Td>
              <Td style={{ color:'var(--text2)' }}>{new Date(c.generated_at).toLocaleDateString('en-IN')}</Td>
              <Td><Pill variant={c === latest ? 'warn' : 'green'}>{c === latest ? 'In Progress' : 'Closed'}</Pill></Td>
            </tr>
          ))}
          {cycles.length === 0 && <tr><td colSpan={6} style={{ padding:24, textAlign:'center', color:'var(--text3)' }}>No maintenance cycles yet</td></tr>}
        </tbody>
      </TableCard>

      <Modal open={modal} onClose={() => setModal(false)} title="Generate Monthly Maintenance">
        <Field label="Month">
          <select value={form.month} onChange={e => setForm(f => ({ ...f, month: +e.target.value }))}>
            {MONTHS.slice(1).map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
        </Field>
        <Field label="Year"><input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: +e.target.value }))} /></Field>
        <Field label="Flat Maintenance (₹)"><input type="number" value={form.flat_amount} onChange={e => setForm(f => ({ ...f, flat_amount: +e.target.value }))} /></Field>
        <Field label="Shop Maintenance (₹)"><input type="number" value={form.shop_amount} onChange={e => setForm(f => ({ ...f, shop_amount: +e.target.value }))} /></Field>
        <div style={{ background:'var(--bg3)', borderRadius:8, padding:12, fontSize:13, color:'var(--text2)', marginBottom:4 }}>
          Total to bill: <strong style={{ color:'var(--text)' }}>₹{(flatCount * form.flat_amount + shopCount * form.shop_amount).toLocaleString()}</strong>
          <span style={{ fontSize:11, marginLeft:8 }}>({flatCount}×₹{form.flat_amount} + {shopCount}×₹{form.shop_amount})</span>
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:16 }}>
          <Btn onClick={() => setModal(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={handleGenerate} disabled={saving}>{saving ? 'Generating...' : 'Generate'}</Btn>
        </div>
      </Modal>
    </div>
  );
};

export default Maintenance;
