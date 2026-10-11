const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { memoryStore, isDbConnected } = require('../config/db');

// Seed complaints for memory store
const seedComplaints = [
  {
    complaintId: 'CMP-101',
    studentName: 'Rohan Sharma',
    category: 'Wi-Fi',
    subject: 'Low speed connection on Block B 2nd floor',
    description: 'Wi-Fi signal drops frequently in room B-201 during evening peak hours.',
    roomNo: 'B-201',
    priority: 'High',
    status: 'In-Progress',
    assignedStaff: 'IT Support Team',
    createdAt: new Date('2026-10-05')
  },
  {
    complaintId: 'CMP-102',
    studentName: 'Priya Patel',
    category: 'Plumbing',
    subject: 'Leaking bathroom tap in room A-102',
    description: 'Bathroom tap is dripping continuously causing water wastage.',
    roomNo: 'A-102',
    priority: 'Medium',
    status: 'Submitted',
    assignedStaff: 'Unassigned',
    createdAt: new Date('2026-10-07')
  }
];

if (!memoryStore.complaints || memoryStore.complaints.length === 0) {
  memoryStore.complaints = [...seedComplaints];
}

// GET /api/complaints
router.get('/', async (req, res) => {
  try {
    const { category, priority, status } = req.query;
    if (isDbConnected()) {
      let query = {};
      if (category) query.category = category;
      if (priority) query.priority = priority;
      if (status) query.status = status;
      const complaints = await Complaint.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: complaints.length, data: complaints });
    } else {
      let results = memoryStore.complaints;
      if (category) results = results.filter(c => c.category === category);
      if (priority) results = results.filter(c => c.priority === priority);
      if (status) results = results.filter(c => c.status === status);
      return res.json({ success: true, count: results.length, data: results });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/complaints
router.post('/', async (req, res) => {
  try {
    const { studentName, category, subject, description, roomNo, priority } = req.body;

    if (!studentName || !category || !subject || !description || !roomNo) {
      return res.status(400).json({ success: false, message: 'Please provide all mandatory complaint fields' });
    }

    const complaintId = `CMP-${Math.floor(100 + Math.random() * 900)}`;
    const newComplaint = {
      complaintId,
      studentName: studentName.trim(),
      category,
      subject: subject.trim(),
      description: description.trim(),
      roomNo,
      priority: priority || 'Medium',
      status: 'Submitted',
      assignedStaff: 'Unassigned',
      createdAt: new Date()
    };

    if (isDbConnected()) {
      const created = await Complaint.create(newComplaint);
      return res.status(201).json({ success: true, message: 'Complaint registered successfully', data: created });
    } else {
      const created = { _id: `cmp-${Date.now()}`, ...newComplaint };
      memoryStore.complaints.unshift(created);
      return res.status(201).json({ success: true, message: 'Complaint registered successfully', data: created });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/complaints/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedStaff, resolutionNotes } = req.body;

    if (isDbConnected()) {
      const updated = await Complaint.findOneAndUpdate(
        { $or: [{ _id: id }, { complaintId: id }] },
        { status, assignedStaff, resolutionNotes },
        { new: true }
      );
      return res.json({ success: true, message: 'Complaint status updated', data: updated });
    } else {
      const idx = memoryStore.complaints.findIndex(c => c.complaintId === id || c._id === id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Complaint not found' });

      if (status) memoryStore.complaints[idx].status = status;
      if (assignedStaff) memoryStore.complaints[idx].assignedStaff = assignedStaff;
      if (resolutionNotes) memoryStore.complaints[idx].resolutionNotes = resolutionNotes;

      return res.json({ success: true, message: 'Complaint status updated', data: memoryStore.complaints[idx] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
