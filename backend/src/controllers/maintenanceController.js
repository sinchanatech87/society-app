const { MaintenanceCycle, Payment, Member, Unit } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// POST /api/maintenance/generate
const generateMaintenance = async (req, res) => {
  try {
    const { month, year, flat_amount, shop_amount } = req.body;
    const existing = await MaintenanceCycle.findOne({ where: { month, year } });
    if (existing) return res.status(409).json({ error: 'Maintenance already generated for this month' });

    const cycle = await MaintenanceCycle.create({ month, year, flat_amount, shop_amount });
    res.json(cycle);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/maintenance
const getMaintenance = async (req, res) => {
  try {
    const cycles = await MaintenanceCycle.findAll({ order: [['year','DESC'],['month','DESC']] });
    res.json(cycles);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/maintenance/member/:id/ledger
const getMemberLedger = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id, { include: [Unit] });
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const cycles = await MaintenanceCycle.findAll({ order: [['year','DESC'],['month','DESC']] });
    const payments = await Payment.findAll({ where: { member_id: req.params.id } });

    const ledger = cycles.map(c => {
      const due = member.Unit.unit_type === 'FLAT' ? parseFloat(c.flat_amount) : parseFloat(c.shop_amount);
      const paid = payments.filter(p => p.maintenance_id === c.id).reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
      return {
        cycle_id: c.id,
        month: c.month,
        year: c.year,
        amount_due: due,
        amount_paid: paid,
        balance: due - paid,
        status: paid >= due ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID'
      };
    });

    const totalDue  = ledger.reduce((s, r) => s + r.amount_due, 0);
    const totalPaid = ledger.reduce((s, r) => s + r.amount_paid, 0);

    res.json({ member, ledger, summary: { total_due: totalDue, total_paid: totalPaid, outstanding: totalDue - totalPaid } });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { generateMaintenance, getMaintenance, getMemberLedger };
