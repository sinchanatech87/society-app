import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getPayments, addPayment, editPayment, getMembers, getMaintenance } from '../api';
import { Btn, Modal, Field, TableCard, Th, Td, Pill, PageHeader, Loader } from '../components/UI';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [members, setMembers]   = useState<any[]>([]);
  const [cycles, setCycles]     = useState<any[]>([]);
  const [loading, setLoad]      = useState(true);
  const [modal, setModal]       = useState<'add'|'edit'|null>(null);
  const [editId, setEditId]     = useState<number|null>(null);
  const [saving, setSaving]     = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ member_id:'', maintenance_id:'', amount_paid:'', payment_mode:'UPI', paid_on: today });

  const load = async () => {
    try {
      const [p, m, c] = await Promise.all([getPayments(), getMembers(), getMaintenance()]);
      setPayments(p.data); setMembers(m.data); setCycles(c.data);
    } catch { toast.error('Failed to load'); }
    setLoad(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({ member_id:'', maintenance_id:'', amount_paid:'', payment_mode:'UPI', paid_on: today }); setEditId(null); setModal('add'); };
  const openEdit = (p: any) => {
    setForm({ member_id: p.member_id, maintenance_id: p.maintenance_id, amount_paid: p.amount_paid, payment_mode: p.payment_mode, paid_on: p.paid_on });
    setEditId(p.id); setModal('edit');
  };

  const handleSave = async () => {
    if (!form.member_id || !form.amount_paid) return toast.error('Member and amount required');
    setSaving(true);
    try {
      if (modal === 'add') { await addPayment(form); toast.success('Payment recorded!'); }
      else if (editId)     { await editPayment(editId, form); toast.success('Payment updated!'); }
      setModal(null); load();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
    setSaving(false);
  };

  const modeColor = (m: string) => m === 'UPI' ? 'blue' : m === 'CASH' ? 'gray' : 'warn';

  if (loading) return <Loader />;

  return (
    <div>
      <PageHeader title="Payments" action={<Btn variant="primary" onClick={openAdd}>+ Add Payment</Btn>} />

      <TableCard title={`Payment Records (${payments.length})`}>
        <thead><tr><Th>Date</Th><Th>Member</Th><Th>Unit</Th><Th>Amount</Th><Th>Mode</Th><Th>Month</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.id}>
              <Td style={{ color:'var(--text2)' }}>{new Date(p.paid_on).toLocaleDateString('en-IN')}</Td>
              <Td>{p.Member?.name}</Td>
              <Td><span style={{ fontFamily:'Space Mono,monospace', fontSize:12 }}>{p.Member?.Unit?.unit_number}</span></Td>
              <Td><span style={{ color:'var(--success)', fontWeight:500 }}>₹{Number(p.amount_paid).toLocaleString()}</span></Td>
              <Td><Pill variant={modeColor(p.payment_mode) as any}>{p.payment_mode}</Pill></Td>
              <Td style={{ color:'var(--text2)' }}>{MONTHS[p.MaintenanceCycle?.month]} {p.MaintenanceCycle?.year}</Td>
              <Td><Btn size="sm" onClick={() => openEdit(p)}>Edit</Btn></Td>
            </tr>
          ))}
          {payments.length === 0 && <tr><td colSpan={7} style={{ padding:24, textAlign:'center', color:'var(--text3)' }}>No payments yet</td></tr>}
        </tbody>
      </TableCard>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Payment' : 'Edit Payment'}>
        <Field label="Member">
          <select value={form.member_id} onChange={e => setForm(f => ({ ...f, member_id: e.target.value }))}>
            <option value="">Select member...</option>
            {members.filter(m => m.active).map(m => <option key={m.id} value={m.id}>{m.name} ({m.Unit?.unit_number})</option>)}
          </select>
        </Field>
        <Field label="Maintenance Cycle">
          <select value={form.maintenance_id} onChange={e => setForm(f => ({ ...f, maintenance_id: e.target.value }))}>
            <option value="">Select month...</option>
            {cycles.map(c => <option key={c.id} value={c.id}>{MONTHS[c.month]} {c.year}</option>)}
          </select>
        </Field>
        <Field label="Amount (₹)"><input type="number" value={form.amount_paid} onChange={e => setForm(f => ({ ...f, amount_paid: e.target.value }))} placeholder="2000" /></Field>
        <Field label="Payment Mode">
          <select value={form.payment_mode} onChange={e => setForm(f => ({ ...f, payment_mode: e.target.value }))}>
            <option>UPI</option><option>CASH</option><option>BANK</option>
          </select>
        </Field>
        <Field label="Date"><input type="date" value={form.paid_on} onChange={e => setForm(f => ({ ...f, paid_on: e.target.value }))} /></Field>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 }}>
          <Btn onClick={() => setModal(null)}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Payment'}</Btn>
        </div>
      </Modal>
    </div>
  );
};

export default Payments;
