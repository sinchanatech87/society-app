const { Payment, Member, MaintenanceCycle, Notice, Complaint, Unit } = require('../models');
const { Op, fn, col } = require('sequelize');

// ─── PAYMENTS ────────────────────────────────────────────────────────────────
const addPayment = async (req, res) => {
  try {
    const { member_id, maintenance_id, amount_paid, payment_mode, paid_on } = req.body;
    const payment = await Payment.create({ member_id, maintenance_id, amount_paid, payment_mode, paid_on });
    res.status(201).json(payment);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    await payment.update(req.body);
    res.json(payment);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{ model: Member }, { model: MaintenanceCycle }],
      order: [['paid_on', 'DESC']],
      limit: 100
    });
    res.json(payments);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── NOTICES ─────────────────────────────────────────────────────────────────
const getNotices = async (req, res) => {
  try {
    const notices = await Notice.findAll({ order: [['created_at', 'DESC']] });
    res.json(notices);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const createNotice = async (req, res) => {
  try {
    const { title, description, expiry_date } = req.body;
    const notice = await Notice.create({ title, description, expiry_date, created_by: req.user.id });
    res.status(201).json(notice);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findByPk(req.params.id);
    if (!notice) return res.status(404).json({ error: 'Notice not found' });
    await notice.update(req.body);
    res.json(notice);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByPk(req.params.id);
    if (!notice) return res.status(404).json({ error: 'Notice not found' });
    await notice.destroy();
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── COMPLAINTS ──────────────────────────────────────────────────────────────
const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      include: [{ model: Member, include: [Unit] }],
      order: [['created_at', 'DESC']]
    });
    res.json(complaints);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const createComplaint = async (req, res) => {
  try {
    const { category, description } = req.body;
    const member_id = req.user.memberId;
    if (!member_id) return res.status(403).json({ error: 'Only members can raise complaints' });
    const complaint = await Complaint.create({ member_id, category, description });
    res.status(201).json(complaint);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    await complaint.update({ status: req.body.status });
    res.json(complaint);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── REPORTS ─────────────────────────────────────────────────────────────────
const maintenanceReport = async (req, res) => {
  try {
    const cycles = await MaintenanceCycle.findAll({ order: [['year','DESC'],['month','DESC']], limit: 12 });
    const result = await Promise.all(cycles.map(async c => {
      const collected = await Payment.sum('amount_paid', { where: { maintenance_id: c.id } }) || 0;
      return { ...c.toJSON(), collected };
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const duesReport = async (req, res) => {
  try {
    const members = await Member.findAll({ where: { active: true }, include: [Unit] });
    const cycles  = await MaintenanceCycle.findAll({ order: [['year','DESC'],['month','DESC']], limit: 3 });
    const payments = await Payment.findAll();

    const report = members.map(m => {
      const dues = cycles.map(c => {
        const due  = m.Unit.unit_type === 'FLAT' ? parseFloat(c.flat_amount) : parseFloat(c.shop_amount);
        const paid = payments.filter(p => p.member_id === m.id && p.maintenance_id === c.id)
                             .reduce((s, p) => s + parseFloat(p.amount_paid), 0);
        return { month: c.month, year: c.year, due, paid, balance: due - paid };
      });
      const totalOutstanding = dues.reduce((s, d) => s + d.balance, 0);
      return { member: m, dues, totalOutstanding };
    }).filter(r => r.totalOutstanding > 0);

    res.json(report);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = {
  addPayment, updatePayment, getPayments,
  getNotices, createNotice, updateNotice, deleteNotice,
  getComplaints, createComplaint, updateComplaint,
  maintenanceReport, duesReport
};
