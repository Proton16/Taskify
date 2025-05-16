// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ msg: 'User already exists' });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash });

  res.status(201).json({ msg: 'Signup successful' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ msg: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  const name = email.split('@')[0];
  const profileIcon = name[0].toUpperCase();

  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      name,
      profileIcon
    }
  });
});
// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('email');

    if (!user) return res.status(404).json({ msg: 'User not found' });

    const name = user.email.split('@')[0];
    const profileIcon = name[0].toUpperCase();

    res.json({
      id: user._id,
      email: user.email,
      name,
      profileIcon
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;