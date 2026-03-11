const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authUser = require('../middleware/authUser');

const router = express.Router();

// Helper to generate JWT
function signToken(user) {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'name, email, phone, password required' });
    }
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email or phone already in use' });
    }
    const user = await User.create({ name, email, phone, password });
    const token = signToken(user);
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Login (email + password OR phone + password)
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    if ((!email && !phone) || !password) {
      return res.status(400).json({ success: false, message: 'email or phone plus password required' });
    }
    const user = await User.findOne(email ? { email } : { phone });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    user.lastLogin = new Date();
    await user.save();
    const token = signToken(user);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Get current user profile (protected)
router.get('/me', authUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email phone userType createdAt');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
