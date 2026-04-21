const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { audit } = require('../middleware/audit');
const { login } = require('../controllers/authController');
const { getMembers, getMember, createMember, updateMember, toggleStatus } = require('../controllers/memberController');
const { generateMaintenance, getMaintenance, getMemberLedger } = require('../controllers/maintenanceController');
const {
  addPayment, updatePayment, getPayments,
  getNotices, createNotice, updateNotice, deleteNotice,
  getComplaints, createComplaint, updateComplaint,
  maintenanceReport, duesReport
} = require('../controllers/otherControllers');
const { User, Member } = require('../models');

// ── AUTH ──────────────────────────────────────────────────────────────────────
router.post('/auth/login', login);

// ── PROFILE ───────────────────────────────────────────────────────────────────
router.get('/users/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id','username','role'],
      include: [{ model: Member }]
    });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/users/me', authenticate, async (req, res) => {
  try {
    const member = await Member.findOne({ where: { user_id: req.user.id } });
    if (!member) return res.status(404).json({ error: 'Member not found' });
    await member.update({ name: req.body.name, phone: req.body.phone, email: req.body.email });
    res.json(member);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── MEMBERS ───────────────────────────────────────────────────────────────────
router.get('/members',     authenticate, getMembers);
router.get('/members/:id', authenticate, getMember);
router.post('/members',    authenticate, requireAdmin, audit('member','CREATE'), createMember);
router.put('/members/:id', authenticate, requireAdmin, audit('member','UPDATE'), updateMember);
router.patch('/members/:id', authenticate, requireAdmin, audit('member','STATUS_CHANGE'), toggleStatus);

// ── MAINTENANCE ───────────────────────────────────────────────────────────────
router.post('/maintenance/generate',          authenticate, requireAdmin, audit('maintenance','GENERATE'), generateMaintenance);
router.get('/maintenance',                    authenticate, getMaintenance);
router.get('/maintenance/member/:id/ledger',  authenticate, getMemberLedger);

// ── PAYMENTS ──────────────────────────────────────────────────────────────────
router.get('/payments',     authenticate, getPayments);
router.post('/payments',    authenticate, requireAdmin, audit('payment','CREATE'), addPayment);
router.put('/payments/:id', authenticate, requireAdmin, audit('payment','UPDATE'), updatePayment);

// ── NOTICES ───────────────────────────────────────────────────────────────────
router.get('/notices',        authenticate, getNotices);
router.post('/notices',       authenticate, requireAdmin, createNotice);
router.put('/notices/:id',    authenticate, requireAdmin, updateNotice);
router.delete('/notices/:id', authenticate, requireAdmin, deleteNotice);

// ── COMPLAINTS ────────────────────────────────────────────────────────────────
router.get('/complaints',        authenticate, requireAdmin, getComplaints);
router.post('/complaints',       authenticate, createComplaint);
router.patch('/complaints/:id',  authenticate, requireAdmin, updateComplaint);

// ── REPORTS ───────────────────────────────────────────────────────────────────
router.get('/reports/maintenance', authenticate, requireAdmin, maintenanceReport);
router.get('/reports/dues',        authenticate, requireAdmin, duesReport);

// ── SETTINGS ──────────────────────────────────────────────────────────────────
router.get('/settings/society', authenticate, (req, res) => {
  res.json({ name: 'Sunrise Heights CHS', address: 'Koramangala, Bengaluru', flat_count: 19, shop_count: 5 });
});

module.exports = router;
