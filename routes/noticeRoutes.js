const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const NotificationService = require('../services/notificationService');
const { memoryStore } = require('../config/db');

// Seed notices
const seedNotices = [
  {
    noticeId: 'NTC-801',
    title: 'Curfew Hours Compliance Notice',
    message: 'All residents must check in at the hostel main gate by 21:30 sharp. Late entry requires prior warden approval.',
    category: 'Emergency',
    priority: 'Urgent',
    audience: 'All',
    createdBy: 'Chief Warden',
    publishedDate: new Date('2026-10-01'),
    isPinned: true
  },
  {
    noticeId: 'NTC-802',
    title: 'Special Sunday Mess Feast',
    message: 'Sunday Special Dinner will include Chicken Biryani / Special Veg Thali and Ice Cream.',
    category: 'Mess',
    priority: 'Normal',
    audience: 'Students',
    createdBy: 'Mess Committee',
    publishedDate: new Date('2026-10-05'),
    isPinned: false
  }
];

if (!memoryStore.notices || memoryStore.notices.length === 0) {
  memoryStore.notices = [...seedNotices];
}

// GET /api/notices
router.get('/', async (req, res) => {
  try {
    const { category, audience } = req.query;
    if (!memoryStore.isInMemory) {
      let query = {};
      if (category) query.category = category;
      if (audience) query.audience = { $in: ['All', audience] };
      const notices = await Notice.find(query).sort({ isPinned: -1, publishedDate: -1 });
      return res.json({ success: true, count: notices.length, data: notices });
    } else {
      let results = memoryStore.notices;
      if (category) results = results.filter(n => n.category === category);
      if (audience) results = results.filter(n => n.audience === 'All' || n.audience === audience);
      return res.json({ success: true, count: results.length, data: results });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/notices
router.post('/', async (req, res) => {
  try {
    const { title, message, category, priority, audience, isPinned } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and Message content are required' });
    }

    const created = await NotificationService.publishNotice({
      title,
      message,
      category,
      priority,
      audience,
      createdBy: req.session.user ? req.session.user.name : 'Chief Warden',
      isPinned: !!isPinned
    });

    return res.status(201).json({ success: true, message: 'Notice published successfully', data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
