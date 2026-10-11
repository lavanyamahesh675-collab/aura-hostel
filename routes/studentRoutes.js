const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Room = require('../models/Room');
const { memoryStore, isDbConnected } = require('../config/db');

// Seed Data helper for 16 Rooms across Blocks A, B, C, D, E
const seedRoomsData = [
  { roomNumber: 'A-101', block: 'Block A', floor: 1, type: 'Single', capacity: 1, occupied: 1, status: 'Full', monthlyFee: 8000 },
  { roomNumber: 'A-102', block: 'Block A', floor: 1, type: 'Double', capacity: 2, occupied: 2, status: 'Full', monthlyFee: 6000 },
  { roomNumber: 'A-103', block: 'Block A', floor: 1, type: 'Triple', capacity: 3, occupied: 3, status: 'Full', monthlyFee: 4500 },
  { roomNumber: 'B-201', block: 'Block B', floor: 2, type: 'Double', capacity: 2, occupied: 1, status: 'Available', monthlyFee: 6000 },
  { roomNumber: 'B-202', block: 'Block B', floor: 2, type: 'Triple', capacity: 3, occupied: 2, status: 'Available', monthlyFee: 4500 },
  { roomNumber: 'B-203', block: 'Block B', floor: 2, type: 'Single', capacity: 1, occupied: 1, status: 'Full', monthlyFee: 8000 },
  { roomNumber: 'C-301', block: 'Block C', floor: 3, type: 'Single', capacity: 1, occupied: 1, status: 'Full', monthlyFee: 8500 },
  { roomNumber: 'C-302', block: 'Block C', floor: 3, type: 'Triple', capacity: 3, occupied: 2, status: 'Available', monthlyFee: 4500 },
  { roomNumber: 'C-303', block: 'Block C', floor: 3, type: 'Double', capacity: 2, occupied: 1, status: 'Available', monthlyFee: 6500 },
  { roomNumber: 'D-401', block: 'Block D', floor: 4, type: 'Suite', capacity: 2, occupied: 1, status: 'Available', monthlyFee: 10000 },
  { roomNumber: 'D-402', block: 'Block D', floor: 4, type: 'Double', capacity: 2, occupied: 1, status: 'Available', monthlyFee: 6500 },
  { roomNumber: 'D-403', block: 'Block D', floor: 4, type: 'Single', capacity: 1, occupied: 0, status: 'Available', monthlyFee: 9000 },
  { roomNumber: 'E-501', block: 'Block D', floor: 5, type: 'Triple', capacity: 3, occupied: 2, status: 'Available', monthlyFee: 4800 },
  { roomNumber: 'E-502', block: 'Block D', floor: 5, type: 'Double', capacity: 2, occupied: 1, status: 'Available', monthlyFee: 6200 }
];

// Seed Data helper for 16 Students
const seedStudentsData = [
  { studentId: 'STU-1001', name: 'Alexander Johnson', email: 'alex.j@aurahostel.com', phone: '9876543210', gender: 'Male', block: 'Block A', roomNo: 'A-101', feeStatus: 'Paid', dietPreference: 'Vegetarian', department: 'Computer Science', academicYear: '3rd Year' },
  { studentId: 'STU-1002', name: 'Sophia Martinez', email: 'sophia.m@aurahostel.com', phone: '9812345678', gender: 'Female', block: 'Block A', roomNo: 'A-102', feeStatus: 'Paid', dietPreference: 'Non-Vegetarian', department: 'Electronics', academicYear: '2nd Year' },
  { studentId: 'STU-1003', name: 'Rohan Sharma', email: 'rohan.s@aurahostel.com', phone: '9765432109', gender: 'Male', block: 'Block B', roomNo: 'B-201', feeStatus: 'Pending', dietPreference: 'Vegetarian', department: 'Mechanical', academicYear: '4th Year' },
  { studentId: 'STU-1004', name: 'Emily Watson', email: 'emily.w@aurahostel.com', phone: '9988776655', gender: 'Female', block: 'Block B', roomNo: 'B-202', feeStatus: 'Paid', dietPreference: 'Special Diet', department: 'Information Tech', academicYear: '1st Year' },
  { studentId: 'STU-1005', name: 'Priya Patel', email: 'priya.p@aurahostel.com', phone: '9123456780', gender: 'Female', block: 'Block A', roomNo: 'A-102', feeStatus: 'Overdue', dietPreference: 'Vegetarian', department: 'Civil Engineering', academicYear: '3rd Year' },
  { studentId: 'STU-1006', name: 'Marcus Vance', email: 'marcus.v@aurahostel.com', phone: '9543210987', gender: 'Male', block: 'Block D', roomNo: 'D-401', feeStatus: 'Paid', dietPreference: 'Non-Vegetarian', department: 'Artificial Intel', academicYear: '2nd Year' },
  { studentId: 'STU-1007', name: 'Aarav Sengupta', email: 'aarav.s@aurahostel.com', phone: '9876123456', gender: 'Male', block: 'Block A', roomNo: 'A-103', feeStatus: 'Paid', dietPreference: 'Vegetarian', department: 'Data Science', academicYear: '3rd Year' },
  { studentId: 'STU-1008', name: 'Jessica Taylor', email: 'jessica.t@aurahostel.com', phone: '9765123480', gender: 'Female', block: 'Block C', roomNo: 'C-301', feeStatus: 'Paid', dietPreference: 'Non-Vegetarian', department: 'Biotechnology', academicYear: '4th Year' },
  { studentId: 'STU-1009', name: 'Vikram Malhotra', email: 'vikram.m@aurahostel.com', phone: '9988112233', gender: 'Male', block: 'Block A', roomNo: 'A-103', feeStatus: 'Pending', dietPreference: 'Vegetarian', department: 'Electrical Eng', academicYear: '2nd Year' },
  { studentId: 'STU-1010', name: 'Ananya Deshmukh', email: 'ananya.d@aurahostel.com', phone: '9123887766', gender: 'Female', block: 'Block C', roomNo: 'C-302', feeStatus: 'Paid', dietPreference: 'Special Diet', department: 'Computer Science', academicYear: '1st Year' },
  { studentId: 'STU-1011', name: 'Liam O\'Connor', email: 'liam.o@aurahostel.com', phone: '9543998877', gender: 'Male', block: 'Block B', roomNo: 'B-202', feeStatus: 'Paid', dietPreference: 'Non-Vegetarian', department: 'Aerospace', academicYear: '3rd Year' },
  { studentId: 'STU-1012', name: 'Kavya Nair', email: 'kavya.n@aurahostel.com', phone: '9812998877', gender: 'Female', block: 'Block C', roomNo: 'C-302', feeStatus: 'Overdue', dietPreference: 'Vegetarian', department: 'Chemical Eng', academicYear: '4th Year' },
  { studentId: 'STU-1013', name: 'Daniel Zhang', email: 'daniel.z@aurahostel.com', phone: '9765998811', gender: 'Male', block: 'Block D', roomNo: 'D-402', feeStatus: 'Paid', dietPreference: 'Non-Vegetarian', department: 'Robotics', academicYear: '2nd Year' },
  { studentId: 'STU-1014', name: 'Meera Kulkarni', email: 'meera.k@aurahostel.com', phone: '9988223344', gender: 'Female', block: 'Block C', roomNo: 'C-303', feeStatus: 'Pending', dietPreference: 'Vegetarian', department: 'Cyber Security', academicYear: '3rd Year' },
  { studentId: 'STU-1015', name: 'Tariq Al-Mansoor', email: 'tariq.a@aurahostel.com', phone: '9123112233', gender: 'Male', block: 'Block B', roomNo: 'B-203', feeStatus: 'Paid', dietPreference: 'Non-Vegetarian', department: 'Petroleum Eng', academicYear: '4th Year' },
  { studentId: 'STU-1016', name: 'Sneha Reddy', email: 'sneha.r@aurahostel.com', phone: '9543112233', gender: 'Female', block: 'Block A', roomNo: 'A-103', feeStatus: 'Paid', dietPreference: 'Vegetarian', department: 'Computer Science', academicYear: '2nd Year' }
];

// Populate memory store
memoryStore.rooms = JSON.parse(JSON.stringify(seedRoomsData));
memoryStore.students = JSON.parse(JSON.stringify(seedStudentsData));

// Auto Seed MongoDB if connected
const autoSeedMongoDB = async () => {
  if (isDbConnected()) {
    try {
      await Room.deleteMany({});
      await Student.deleteMany({});
      await Room.insertMany(seedRoomsData);
      await Student.insertMany(seedStudentsData);
      console.log('🌱 [SEED] Initialized MongoDB with 16 Students and 14 Rooms');
    } catch (e) {
      console.warn('Seed Mongo notice:', e.message);
    }
  }
};
autoSeedMongoDB();

// GET /api/students - Retrieve all students
router.get('/students', async (req, res) => {
  try {
    const { search, block, feeStatus } = req.query;

    if (isDbConnected()) {
      let query = {};
      if (block) query.block = block;
      if (feeStatus) query.feeStatus = feeStatus;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { roomNo: { $regex: search, $options: 'i' } },
          { department: { $regex: search, $options: 'i' } }
        ];
      }
      const students = await Student.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: students.length, data: students });
    } else {
      let results = memoryStore.students;
      if (block) results = results.filter(s => s.block === block);
      if (feeStatus) results = results.filter(s => s.feeStatus === feeStatus);
      if (search) {
        const q = search.toLowerCase();
        results = results.filter(s => 
          s.name.toLowerCase().includes(q) || 
          s.studentId.toLowerCase().includes(q) || 
          s.email.toLowerCase().includes(q) || 
          s.roomNo.toLowerCase().includes(q) ||
          (s.department && s.department.toLowerCase().includes(q))
        );
      }
      return res.json({ success: true, count: results.length, data: results });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/students/:id
router.get('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let student = memoryStore.students.find(s => s.studentId === id || s._id === id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    return res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/students - Admit Student
router.post('/students', async (req, res) => {
  try {
    const { name, email, phone, gender, block, roomNo, feeStatus, dietPreference, guardianPhone, department, academicYear } = req.body;

    if (!name || name.trim().length < 8) {
      return res.status(400).json({ success: false, message: 'Student Name must be at least 8 characters long.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address format.' });
    }
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Contact Number must be strictly 10 digits.' });
    }
    if (!gender || !block || !roomNo) {
      return res.status(400).json({ success: false, message: 'Please select Gender, Block, and Room Number.' });
    }

    const studentId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
    const newStudentData = {
      studentId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      gender,
      block,
      roomNo,
      department: department || 'Computer Science',
      academicYear: academicYear || '1st Year',
      feeStatus: feeStatus || 'Pending',
      dietPreference: dietPreference || 'Vegetarian',
      guardianPhone: guardianPhone || '',
      admissionDate: new Date()
    };

    let createdStudent;

    if (isDbConnected()) {
      createdStudent = await Student.create(newStudentData);
      await Room.findOneAndUpdate({ roomNumber: roomNo }, { $inc: { occupied: 1 } });
    } else {
      createdStudent = { _id: `mem-${Date.now()}`, ...newStudentData };
      memoryStore.students.unshift(createdStudent);

      const targetRoom = memoryStore.rooms.find(r => r.roomNumber === roomNo);
      if (targetRoom) {
        targetRoom.occupied = (targetRoom.occupied || 0) + 1;
        if (targetRoom.occupied >= targetRoom.capacity) targetRoom.status = 'Full';
      }
    }

    const hostelEvents = req.app.get('hostelEvents');
    if (hostelEvents) {
      hostelEvents.emit('studentAdmitted', {
        studentId: createdStudent.studentId,
        name: createdStudent.name,
        roomNo: createdStudent.roomNo,
        block: createdStudent.block,
        timestamp: new Date()
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Student admitted and room allocated successfully!',
      data: createdStudent
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/rooms
router.get('/rooms', async (req, res) => {
  return res.json({ success: true, count: memoryStore.rooms.length, data: memoryStore.rooms });
});

// PATCH /api/students/:id
router.patch('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let idx = memoryStore.students.findIndex(s => s.studentId === id || s._id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Student not found' });

    let currentStudent = memoryStore.students[idx];

    if (updates.roomNo && updates.roomNo !== currentStudent.roomNo) {
      let oldRoom = memoryStore.rooms.find(r => r.roomNumber === currentStudent.roomNo);
      if (oldRoom && oldRoom.occupied > 0) oldRoom.occupied--;

      let newRoom = memoryStore.rooms.find(r => r.roomNumber === updates.roomNo);
      if (newRoom) newRoom.occupied++;
    }

    memoryStore.students[idx] = { ...currentStudent, ...updates };

    return res.json({
      success: true,
      message: 'Student record updated successfully!',
      data: memoryStore.students[idx]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/students/:id
router.delete('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let idx = memoryStore.students.findIndex(s => s.studentId === id || s._id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Student record not found' });

    let targetStudent = memoryStore.students[idx];
    memoryStore.students.splice(idx, 1);

    let targetRoom = memoryStore.rooms.find(r => r.roomNumber === targetStudent.roomNo);
    if (targetRoom && targetRoom.occupied > 0) {
      targetRoom.occupied--;
      targetRoom.status = 'Available';
    }

    const hostelEvents = req.app.get('hostelEvents');
    if (hostelEvents) {
      hostelEvents.emit('roomVacated', {
        studentId: targetStudent.studentId,
        name: targetStudent.name,
        roomNo: targetStudent.roomNo,
        timestamp: new Date()
      });
    }

    return res.json({
      success: true,
      message: `Student ${targetStudent.name} vacated and room ${targetStudent.roomNo} capacity restored.`,
      vacatedStudent: targetStudent
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/rooms/all
router.get('/rooms/all', async (req, res) => {
  return res.json({ success: true, count: memoryStore.rooms.length, data: memoryStore.rooms });
});

module.exports = router;
