require('dotenv').config();
const app = require('../src/app');
const connectDB = require('../src/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    return res.status(500).json({ error: 'Database connection failed' });
  }
};