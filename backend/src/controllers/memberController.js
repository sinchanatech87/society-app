const bcrypt = require('bcryptjs');
const { Member, Unit, User, sequelize } = require('../models');

// GET /api/members
const getMembers = async (req, res) => {
  try {
    const members = await Member.findAll({
      include: [{ model: Unit }, { model: User, attributes: ['username', 'role'] }],
      order: [['id', 'ASC']]
    });
    res.json(members);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/members/:id
const getMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id, {
      include: [Unit, { model: User, attributes: ['username', 'role'] }]
    });
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/members
const createMember = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, phone, email, occupancy, unit_number, unit_type, parking_count, username, password, role } = req.body;

    // Create or find unit
    let [unit] = await Unit.findOrCreate({
      where: { unit_number },
      defaults: { unit_type, parking_count: parking_count || 0 },
      transaction: t
    });

    // Create user account
    const hash = await bcrypt.hash(password || 'Society@123', 10);
    const user = await User.create({ username: username || email, password_hash: hash, role: role || 'MEMBER' }, { transaction: t });

    // Create member
    const member = await Member.create({ user_id: user.id, unit_id: unit.id, name, phone, email, occupancy: occupancy || 'OWNER' }, { transaction: t });

    await t.commit();
    res.status(201).json({ ...member.toJSON(), Unit: unit });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/members/:id
const updateMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    const { name, phone, email, occupancy } = req.body;
    await member.update({ name, phone, email, occupancy });
    res.json(member);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// PATCH /api/members/:id  — toggle active
const toggleStatus = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    await member.update({ active: !member.active });
    res.json({ id: member.id, active: member.active });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getMembers, getMember, createMember, updateMember, toggleStatus };
