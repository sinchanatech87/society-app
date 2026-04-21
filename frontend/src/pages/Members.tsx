import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getMembers, createMember, updateMember, toggleStatus } from '../api';
import { Btn, Modal, Field, TableCard, Th, Td, Pill, PageHeader, Loader } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name:'', phone:'', email:'', occupancy:'OWNER', unit_number:'', unit_type:'FLAT', username:'', password:'' };

const Members: React.FC = () => {
  const { isAdmin } = useAuth();
  const [members, setMembers]   = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoad]      = useState(true);
  const [modal, setModal]       = useState<'add'|'edit'|null>(null);
  const [form, setForm]         = useState({ ...emptyForm });
  const [editId, setEditId]     = useState<number|null>(null);
  const [saving, setSaving]     = useState(false);

  const load = async () => {
    try { const { data } = await getMembers(); setMembers(data); setFiltered(data); }
    catch { toast.error('Failed to load members'); }
    setLoad(false);
  };
  useEffect(() => { load(); }, []);

  const search = (q: string) => {
    const lq = q.toLowerCase();
    setFiltered(members.filter(m => m.name.toLowerCase().includes(lq) || m.Unit?.unit_number?.toLowerCase().includes(lq)));
  };

  const openAdd  = () => { setForm({ ...emptyForm }); setEditId(null); setModal('add'); };
  const openEdit = (m: any) => {
    setForm({ name:m.name, phone:m.phone||'', email:m.email||'', occupancy:m.occupancy, unit_number:m.Unit?.unit_number||'', unit_type:m.Unit?.unit_type||'FLAT', username:'', password:'' });
    setEditId(m.id); setModal('edit');
  };

  const handleSave = async () => {
    if (!form.name || !form.unit_number) return toast.error('Name and unit are required');
    setSaving(true);
    try {
      if (modal === 'add') {
        await createMember(form);
        toast.success('Member added!');
      } else if (editId) {
        await updateMember(editId, { name: form.name, phone: form.phone, email: form.email, occupancy: form.occupancy });
        toast.success('Member updated!');
      }
      setModal(null); load();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Save failed'); }
    setSaving(false);
  };

  const handleToggle = async (id: number, name: string, active: boolean) => {
    try { await toggleStatus(id); toast.success(`${name} ${active ? 'deactivated' : 'activated'}`); load(); }
    catch { toast.error('Failed to update status'); }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <PageHeader title={`Members (${members.length})`} action={isAdmin ? <Btn variant="primary" onClick={openAdd}>+ Add Member</Btn> : undefined} />

      <TableCard
        title="All Members"
        action={<input placeholder="Search name or unit..." onChange={e => search(e.target.value)} style={{ width:200, padding:'6px 12px', fontSize:12 }} />}
      >
        <thead>
          <tr><Th>Unit</Th><Th>Name</Th><Th>Type</Th><Th>Occupancy</Th><Th>Phone</Th><Th>Email</Th><Th>Status</Th>{isAdmin && <Th>Actions</Th>}</tr>
        </thead>
        <tbody>
          {filtered.map(m => (
            <tr key={m.id} style={{ cursor:'default' }}>
              <Td><span style={{ fontFamily:'Space Mono,monospace', fontSize:12 }}>{m.Unit?.unit_number}</span></Td>
              <Td>{m.name}</Td>
              <Td><Pill variant={m.Unit?.unit_type === 'FLAT' ? 'blue' : 'warn'}>{m.Unit?.unit_type}</Pill></Td>
              <Td><Pill variant="gray">{m.occupancy}</Pill></Td>
              <Td style={{ color:'var(--text2)' }}>{m.phone || '—'}</Td>
              <Td style={{ color:'var(--text2)' }}>{m.email || '—'}</Td>
              <Td><Pill variant={m.active ? 'green' : 'red'}>{m.active ? 'Active' : 'Inactive'}</Pill></Td>
              {isAdmin && (
                <Td>
                  <div style={{ display:'flex', gap:6 }}>
                    <Btn size="sm" onClick={() => openEdit(m)}>Edit</Btn>
                    <Btn size="sm" variant={m.active ? 'danger' : 'ghost'} onClick={() => handleToggle(m.id, m.name, m.active)}>
                      {m.active ? 'Deactivate' : 'Activate'}
                    </Btn>
                  </div>
                </Td>
              )}
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={8} style={{ padding:24, textAlign:'center', color:'var(--text3)' }}>No members found</td></tr>
          )}
        </tbody>
      </TableCard>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'add' ? 'Add New Member' : 'Edit Member'}>
        <Field label="Full Name"><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ramesh Kumar" /></Field>
        {modal === 'add' && (
          <>
            <Field label="Unit Number"><input value={form.unit_number} onChange={e => setForm(f => ({ ...f, unit_number: e.target.value }))} placeholder="A-101" /></Field>
            <Field label="Unit Type">
              <select value={form.unit_type} onChange={e => setForm(f => ({ ...f, unit_type: e.target.value }))}>
                <option>FLAT</option><option>SHOP</option>
              </select>
            </Field>
          </>
        )}
        <Field label="Occupancy">
          <select value={form.occupancy} onChange={e => setForm(f => ({ ...f, occupancy: e.target.value }))}>
            <option>OWNER</option><option>TENANT</option>
          </select>
        </Field>
        <Field label="Phone"><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="9999999999" /></Field>
        <Field label="Email"><input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="name@email.com" /></Field>
        {modal === 'add' && (
          <>
            <Field label="Login Username (email)"><input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="name@society.com" /></Field>
            <Field label="Password"><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Default: Society@123" /></Field>
          </>
        )}
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 }}>
          <Btn onClick={() => setModal(null)}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Member'}</Btn>
        </div>
      </Modal>
    </div>
  );
};

export default Members;
