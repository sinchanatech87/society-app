const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ─── USER ────────────────────────────────────────────────────────────────────
const User = sequelize.define('User', {
  id:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username:      { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role:          { type: DataTypes.ENUM('ADMIN','TREASURER','CHAIRMAN','MEMBER','TENANT'), defaultValue: 'MEMBER' },
  active:        { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'users', timestamps: true, createdAt: 'created_at', updatedAt: false });

// ─── UNIT ────────────────────────────────────────────────────────────────────
const Unit = sequelize.define('Unit', {
  id:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  unit_number:   { type: DataTypes.STRING(20), allowNull: false, unique: true },
  unit_type:     { type: DataTypes.ENUM('FLAT','SHOP'), allowNull: false },
  parking_count: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'units', timestamps: false });

// ─── MEMBER ──────────────────────────────────────────────────────────────────
const Member = sequelize.define('Member', {
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:   { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  unit_id:   { type: DataTypes.INTEGER, references: { model: 'units', key: 'id' } },
  name:      { type: DataTypes.STRING(100), allowNull: false },
  phone:     { type: DataTypes.STRING(15) },
  email:     { type: DataTypes.STRING(100) },
  occupancy: { type: DataTypes.ENUM('OWNER','TENANT'), defaultValue: 'OWNER' },
  active:    { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'members', timestamps: true, createdAt: 'created_at', updatedAt: false });

// ─── MAINTENANCE CYCLE ───────────────────────────────────────────────────────
const MaintenanceCycle = sequelize.define('MaintenanceCycle', {
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  month:        { type: DataTypes.INTEGER, allowNull: false },
  year:         { type: DataTypes.INTEGER, allowNull: false },
  flat_amount:  { type: DataTypes.DECIMAL(10,2), allowNull: false },
  shop_amount:  { type: DataTypes.DECIMAL(10,2), allowNull: false },
  generated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'maintenance_cycles', timestamps: false });

// ─── PAYMENT ─────────────────────────────────────────────────────────────────
const Payment = sequelize.define('Payment', {
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  member_id:      { type: DataTypes.INTEGER, references: { model: 'members', key: 'id' } },
  maintenance_id: { type: DataTypes.INTEGER, references: { model: 'maintenance_cycles', key: 'id' } },
  amount_paid:    { type: DataTypes.DECIMAL(10,2), allowNull: false },
  payment_mode:   { type: DataTypes.ENUM('CASH','UPI','BANK'), allowNull: false },
  paid_on:        { type: DataTypes.DATEONLY, allowNull: false }
}, { tableName: 'payments', timestamps: false });

// ─── NOTICE ──────────────────────────────────────────────────────────────────
const Notice = sequelize.define('Notice', {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title:       { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  expiry_date: { type: DataTypes.DATEONLY },
  created_by:  { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } }
}, { tableName: 'notices', timestamps: true, createdAt: 'created_at', updatedAt: false });

// ─── COMPLAINT ───────────────────────────────────────────────────────────────
const Complaint = sequelize.define('Complaint', {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  member_id:   { type: DataTypes.INTEGER, references: { model: 'members', key: 'id' } },
  category:    { type: DataTypes.STRING(100) },
  description: { type: DataTypes.TEXT },
  status:      { type: DataTypes.ENUM('OPEN','IN_PROGRESS','RESOLVED'), defaultValue: 'OPEN' }
}, { tableName: 'complaints', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// ─── AUDIT LOG ───────────────────────────────────────────────────────────────
const AuditLog = sequelize.define('AuditLog', {
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  entity:       { type: DataTypes.STRING(50) },
  entity_id:    { type: DataTypes.INTEGER },
  action:       { type: DataTypes.STRING(50) },
  performed_by: { type: DataTypes.INTEGER },
  timestamp:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'audit_logs', timestamps: false });

// ─── ASSOCIATIONS ────────────────────────────────────────────────────────────
User.hasOne(Member, { foreignKey: 'user_id' });
Member.belongsTo(User, { foreignKey: 'user_id' });

Unit.hasMany(Member, { foreignKey: 'unit_id' });
Member.belongsTo(Unit, { foreignKey: 'unit_id' });

Member.hasMany(Payment, { foreignKey: 'member_id' });
Payment.belongsTo(Member, { foreignKey: 'member_id' });

MaintenanceCycle.hasMany(Payment, { foreignKey: 'maintenance_id' });
Payment.belongsTo(MaintenanceCycle, { foreignKey: 'maintenance_id' });

Member.hasMany(Complaint, { foreignKey: 'member_id' });
Complaint.belongsTo(Member, { foreignKey: 'member_id' });

User.hasMany(Notice, { foreignKey: 'created_by' });
Notice.belongsTo(User, { foreignKey: 'created_by' });

module.exports = { User, Unit, Member, MaintenanceCycle, Payment, Notice, Complaint, AuditLog, sequelize };
