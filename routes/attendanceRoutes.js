const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { memoryStore } = require('../config/db');

// Seed Attendance data
const seedAttendance = [
  { studentId: 'STU-1001', studentName: 'Alexander Johnson', date: '2026-10-09', status: 'Present', checkInTime: '21:00' },
  { studentId: 'STU-1002', studentName: 'Sophia Martinez', date: '2026-10-09', status: 'Present', checkInTime: '20:45' },
  { studentId: 'STU-1003', studentName: 'Rohan Sharma', date: '2026-10-09', status: 'Present', checkInTime: '21:15' },
  { studentId: 'STU-1004', studentName: 'Emily Watson', date: '2026-10-09', status: 'On Leave', remarks: 'Approved Weekend Home Leave' }
];

if (!memoryStore.attendance || memoryStore.attendance.length === 0) {
  memoryStore.attendance = [...seedAttendance];
}

// GET /api/attendance
router.get('/', async (req, res) => {
  try {
    const { date, studentId, status } = req.query;

    if (!memoryStore.isInMemory) {
      let query = {};
      if (date) query.date = date;
      if (studentId) query.studentId = studentId;
      if (status) query.status = status;
      const records = await Attendance.find(query).sort({ date: -1 });
      return res.json({ success: true, count: records.length, data: records });
    } else {
      let results = memoryStore.attendance;
      if (date) results = results.filter(a => a.date === date);
      if (studentId) results = results.filter(a => a.studentId === studentId);
      if (status) results = results.filter(a => a.status === status);
      return res.json({ success: true, count: results.length, data: results });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/attendance
router.post('/', async (req, res) => {
  try {
    const { studentId, studentName, date, status, checkInTime, remarks } = req.body;

    if (!studentId || !studentName) {
      return res.status(400).json({ success: false, message: 'Student ID and Name are required' });
    }

    const attendanceRecord = {
      studentId,
      studentName,
      date: date || new Date().toISOString().split('T')[0],
      status: status || 'Present',
      checkInTime: checkInTime || '21:00',
      remarks: remarks || '',
      markedBy: req.session.user ? req.session.user.name : 'System Warden'
    };

    if (!memoryStore.isInMemory) {
      const created = await Attendance.create(attendanceRecord);
      return res.status(201).json({ success: true, message: 'Attendance recorded', data: created });
    } else {
      const created = { _id: `att-${Date.now()}`, ...attendanceRecord };
      memoryStore.attendance.unshift(created);
      return res.status(201).json({ success: true, message: 'Attendance recorded', data: created });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
