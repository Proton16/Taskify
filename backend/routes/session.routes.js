// routes/session.js
import express from 'express';
import Session from '../models/sessions.model.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// Create session
router.post('/', verifyToken, async (req, res) => {
  const { title, websites, duration } = req.body;

  const session = await Session.create({
    userId: req.userId,
    title,
    websites,
    duration
  });

  res.status(201).json(session);
});

// Get sessions grouped by date
router.get('/', verifyToken, async (req, res) => {
  const sessions = await Session.find({ userId: req.userId }).sort({ createdAt: -1 });

  // Group by date
  const grouped = {};
  sessions.forEach(session => {
    const date = new Date(session.createdAt).toDateString();

    if (!grouped[date]) grouped[date] = [];

    const icon = session.title.toLowerCase().includes('youtube')
      ? '📺'
      : '🎯';

    grouped[date].push({
      id: session._id,
      title: session.title,
      icon,
      websites: session.websites,
      duration: session.duration,
      createdAt: session.createdAt
    });
  });

  res.json(grouped);
});

export default router;