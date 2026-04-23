require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const { sequelize } = require('./models');
const { User } = require('./models');
const routes  = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date() }));
app.use('/api', routes);
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

async function resetPasswords() {
  try {
    const hash = await bcrypt.hash('Society@123', 10);
    await User.update({ password_hash: hash }, { where: {} });
    console.log('✅ Passwords reset successfully');
  } catch (err) {
    console.error('Password reset failed:', err.message);
  }
}

sequelize.sync({ alter: false })
  .then(async () => {
    console.log('✅ Database connected');
    await resetPasswords();
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;