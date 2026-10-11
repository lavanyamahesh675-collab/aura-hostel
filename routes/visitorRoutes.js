const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const { memoryStore } = require('../config/db');

// Seed visitors data
const seedVisitors = [
  {
    visitorId: 'VIS-701',
    visitorName: 'David Johnson',
    contactNumber: '9876511111',
    studentName: 'Alexander Johnson',
    roomNo: 'A-101',
    purpose: 'Parental Visit & Delivering Study Materials',
    checkInTime: new Date(),
    status: 'Inside',
    authorizationStatus: 'Approved'
  }
];

if (!memoryStore.visitors || memoryStore.visitors.length === 0) {
  memoryStore.visitors = [...seedVisitors];
}

// GET /api/visitors
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    if (!memoryStore.isInMemory) {
      let query = status ? { status } : {};
      const visitors = await Visitor.find(query).sort({ checkInTime: -1 });
      return res.json({ success: true, count: visitors.length, data: visitors });
    } else {
      let results = memoryStore.visitors;
      if (status) results = results.filter(v => v.status === status);
      return res.json({ success: true, count: results.length, data: results });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/visitors
router.post('/', async (req, res) => {
  try {
    const { visitorName, contactNumber, studentName, roomNo, purpose } = req.body;

    if (!visitorName || !contactNumber || !studentName || !roomNo || !purpose) {
      return res.status(400).json({ success: false, message: 'All visitor fields are required' });
    }

    const visitorId = `VIS-${Math.floor(100 + Math.random() * 900)}`;
    const newVisitor = {
      visitorId,
      visitorName: visitorName.trim(),
      contactNumber: contactNumber.trim(),
      studentName: studentName.trim(),
      roomNo,
      purpose: purpose.trim(),
      checkInTime: new Date(),
      status: 'Inside',
      authorizationStatus: 'Approved'
    };

    if (!memoryStore.isInMemory) {
      const created = await Visitor.create(newVisitor);
      return res.status(201).json({ success: true, message: 'Visitor checked in successfully', data: created });
    } else {
      const created = { _id: `vis-${Date.now()}`, ...newVisitor };
      memoryStore.visitors.unshift(created);
      return res.status(201).json({ success: true, message: 'Visitor checked in successfully', data: created });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/visitors/:id/checkout
router.patch('/:id/checkout', async (req, res) => {
  try {
    const { id } = req.params;

    if (!memoryStore.isInMemory) {
      const updated = await Visitor.findOneAndUpdate(
        { $or: [{ _id: id }, { visitorId: id }] },
        { status: 'Checked Out', checkOutTime: new Date() },
        { new: true }
      );
      return res.json({ success: true, message: 'Visitor checked out', data: updated });
    } else {
      const idx = memoryStore.visitors.findIndex(v => v.visitorId === id || v._id === id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Visitor not found' });

      memoryStore.visitors[idx].status = 'Checked Out';
      memoryStore.visitors[idx].checkOutTime = new Date();

      return res.json({ success: true, message: 'Visitor checked out', data: memoryStore.visitors[idx] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
