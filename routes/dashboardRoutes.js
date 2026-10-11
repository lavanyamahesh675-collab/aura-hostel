const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');
const Attendance = require('../models/Attendance');
const Visitor = require('../models/Visitor');
const { memoryStore, isDbConnected } = require('../config/db');

// GET /api/dashboard/summary
router.get('/summary', async (req, res) => {
  try {
    let totalStudents = 0;
    let totalRooms = 0;
    let occupiedBeds = 0;
    let totalCapacity = 0;
    let pendingFeesCount = 0;
    let pendingComplaintsCount = 0;
    let presentToday = 0;
    let visitorsInside = 0;

    if (isDbConnected()) {
      totalStudents = await Student.countDocuments();
      totalRooms = await Room.countDocuments();
      
      const rooms = await Room.find();
      rooms.forEach(r => {
        totalCapacity += r.capacity || 0;
        occupiedBeds += r.occupied || 0;
      });

      pendingFeesCount = await Student.countDocuments({ feeStatus: { $in: ['Pending', 'Overdue'] } });
      pendingComplaintsCount = await Complaint.countDocuments({ status: { $ne: 'Resolved' } });
      presentToday = await Attendance.countDocuments({ status: 'Present' });
      visitorsInside = await Visitor.countDocuments({ status: 'Inside' });
    } else {
      totalStudents = memoryStore.students.length;
      totalRooms = memoryStore.rooms.length;
      
      memoryStore.rooms.forEach(r => {
        totalCapacity += r.capacity || 0;
        occupiedBeds += r.occupied || 0;
      });

      pendingFeesCount = memoryStore.students.filter(s => s.feeStatus === 'Pending' || s.feeStatus === 'Overdue').length;
      pendingComplaintsCount = memoryStore.complaints.filter(c => c.status !== 'Resolved').length;
      presentToday = memoryStore.attendance.filter(a => a.status === 'Present').length;
      visitorsInside = memoryStore.visitors.filter(v => v.status === 'Inside').length;
    }

    const availableBeds = Math.max(0, totalCapacity - occupiedBeds);
    const occupancyRate = totalCapacity > 0 ? parseFloat(((occupiedBeds / totalCapacity) * 100).toFixed(1)) : 0;

    return res.json({
      success: true,
      summary: {
        totalStudents,
        totalRooms,
        totalCapacity,
        occupiedBeds,
        availableBeds,
        occupancyRate,
        pendingFeesCount,
        pendingComplaintsCount,
        presentToday,
        visitorsInside
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dashboard/occupancy
router.get('/occupancy', async (req, res) => {
  try {
    const blocks = ['Block A', 'Block B', 'Block C', 'Block D'];
    const data = blocks.map(block => {
      const roomsInBlock = memoryStore.rooms.filter(r => r.block === block);
      const capacity = roomsInBlock.reduce((acc, r) => acc + (r.capacity || 0), 0);
      const occupied = roomsInBlock.reduce((acc, r) => acc + (r.occupied || 0), 0);
      return { block, capacity, occupied, available: Math.max(0, capacity - occupied) };
    });

    return res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dashboard/mess-distribution
router.get('/mess-distribution', async (req, res) => {
  try {
    const students = memoryStore.students;
    let veg = 0, nonVeg = 0, special = 0;

    students.forEach(s => {
      if (s.messPreference === 'Vegetarian' || s.dietPreference === 'Vegetarian') veg++;
      else if (s.messPreference === 'Non-Vegetarian' || s.dietPreference === 'Non-Vegetarian') nonVeg++;
      else special++;
    });

    return res.json({
      success: true,
      data: { vegetarian: veg, nonVegetarian: nonVeg, specialDiet: special }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
