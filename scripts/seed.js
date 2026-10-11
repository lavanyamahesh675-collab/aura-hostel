/**
 * AuraHostel ERP - Master Database Seed Script
 * Generates sample Users, Students, Rooms, Payments, Complaints, Attendance, Visitors, Notices & Activity Logs.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Student = require('../models/Student');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');
const Attendance = require('../models/Attendance');
const Visitor = require('../models/Visitor');
const Notice = require('../models/Notice');
const ActivityLog = require('../models/ActivityLog');

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aura_hostel';
    console.log('🌱 Connecting to MongoDB for seeding at:', mongoURI);
    
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 4000 });

    console.log('🧹 Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Room.deleteMany({}),
      Payment.deleteMany({}),
      Complaint.deleteMany({}),
      Attendance.deleteMany({}),
      Visitor.deleteMany({}),
      Notice.deleteMany({}),
      ActivityLog.deleteMany({})
    ]);

    console.log('📦 Seeding Hostel Rooms...');
    const seedRooms = [
      { roomNumber: 'A-101', block: 'Block A', floor: 1, type: 'Single', capacity: 1, occupied: 1, monthlyFee: 8000, status: 'Full', amenities: ['AC', 'Wi-Fi', 'Study Desk'] },
      { roomNumber: 'A-102', block: 'Block A', floor: 1, type: 'Double', capacity: 2, occupied: 2, monthlyFee: 6000, status: 'Full', amenities: ['Ceiling Fan', 'Wi-Fi'] },
      { roomNumber: 'B-201', block: 'Block B', floor: 2, type: 'Double', capacity: 2, occupied: 1, monthlyFee: 6000, status: 'Available', amenities: ['Ceiling Fan', 'Study Desk'] },
      { roomNumber: 'B-202', block: 'Block B', floor: 2, type: 'Triple', capacity: 3, occupied: 2, monthlyFee: 4500, status: 'Available', amenities: ['Ceiling Fan', 'Shared Balcony'] },
      { roomNumber: 'C-301', block: 'Block C', floor: 3, type: 'Single', capacity: 1, occupied: 0, monthlyFee: 8500, status: 'Available', amenities: ['AC', 'Private Washroom'] },
      { roomNumber: 'C-302', block: 'Block C', floor: 3, type: 'Triple', capacity: 3, occupied: 0, monthlyFee: 4500, status: 'Available', amenities: ['Ceiling Fan'] },
      { roomNumber: 'D-401', block: 'Block D', floor: 4, type: 'Suite', capacity: 2, occupied: 1, monthlyFee: 10000, status: 'Available', amenities: ['Mini Fridge', 'AC', 'Balcony'] },
      { roomNumber: 'D-402', block: 'Block D', floor: 4, type: 'Double', capacity: 2, occupied: 0, monthlyFee: 6500, status: 'Available', amenities: ['Ceiling Fan', 'Wi-Fi'] }
    ];
    const createdRooms = await Room.insertMany(seedRooms);
    console.log(`✅ ${createdRooms.length} Rooms seeded.`);

    console.log('📦 Seeding Student Roster...');
    const seedStudents = [
      {
        studentId: 'STU-1001',
        name: 'Alexander Johnson',
        email: 'alex.j@aurahostel.com',
        phone: '9876543210',
        gender: 'Male',
        department: 'Computer Science',
        academicYear: '3rd Year',
        rollNumber: 'CS2023-045',
        block: 'Block A',
        roomNo: 'A-101',
        bedNumber: 'Bed-1',
        feeStatus: 'Paid',
        messPreference: 'Vegetarian',
        studentStatus: 'Active'
      },
      {
        studentId: 'STU-1002',
        name: 'Sophia Martinez',
        email: 'sophia.m@aurahostel.com',
        phone: '9812345678',
        gender: 'Female',
        department: 'Electronics',
        academicYear: '2nd Year',
        rollNumber: 'EC2024-012',
        block: 'Block A',
        roomNo: 'A-102',
        bedNumber: 'Bed-1',
        feeStatus: 'Paid',
        messPreference: 'Non-Vegetarian',
        studentStatus: 'Active'
      },
      {
        studentId: 'STU-1003',
        name: 'Rohan Sharma',
        email: 'rohan.s@aurahostel.com',
        phone: '9765432109',
        gender: 'Male',
        department: 'Mechanical',
        academicYear: '4th Year',
        rollNumber: 'ME2022-089',
        block: 'Block B',
        roomNo: 'B-201',
        bedNumber: 'Bed-1',
        feeStatus: 'Pending',
        messPreference: 'Vegetarian',
        studentStatus: 'Active'
      },
      {
        studentId: 'STU-1004',
        name: 'Emily Watson',
        email: 'emily.w@aurahostel.com',
        phone: '9988776655',
        gender: 'Female',
        department: 'Information Tech',
        academicYear: '1st Year',
        rollNumber: 'IT2025-003',
        block: 'Block B',
        roomNo: 'B-202',
        bedNumber: 'Bed-1',
        feeStatus: 'Paid',
        messPreference: 'Special Diet',
        studentStatus: 'Active'
      },
      {
        studentId: 'STU-1005',
        name: 'Priya Patel',
        email: 'priya.p@aurahostel.com',
        phone: '9123456780',
        gender: 'Female',
        department: 'Civil Engineering',
        academicYear: '3rd Year',
        rollNumber: 'CE2023-034',
        block: 'Block A',
        roomNo: 'A-102',
        bedNumber: 'Bed-2',
        feeStatus: 'Overdue',
        messPreference: 'Vegetarian',
        studentStatus: 'Active'
      },
      {
        studentId: 'STU-1006',
        name: 'Marcus Vance',
        email: 'marcus.v@aurahostel.com',
        phone: '9543210987',
        gender: 'Male',
        department: 'Artificial Intel',
        academicYear: '2nd Year',
        rollNumber: 'AI2024-077',
        block: 'Block D',
        roomNo: 'D-401',
        bedNumber: 'Bed-1',
        feeStatus: 'Paid',
        messPreference: 'Non-Vegetarian',
        studentStatus: 'Active'
      }
    ];
    const createdStudents = await Student.insertMany(seedStudents);
    console.log(`✅ ${createdStudents.length} Students seeded.`);

    console.log('📦 Seeding User Accounts (Admin, Warden, Student)...');
    const seedUsers = [
      {
        username: 'warden',
        email: 'warden@aurahostel.com',
        password: 'admin123',
        name: 'Dr. Robert Warden',
        role: 'Warden'
      },
      {
        username: 'admin',
        email: 'admin@aurahostel.com',
        password: 'admin123',
        name: 'Sarah Chief Admin',
        role: 'Admin'
      },
      {
        username: 'alex',
        email: 'alex@aurahostel.com',
        password: 'student123',
        name: 'Alexander Johnson',
        role: 'Student',
        studentRef: createdStudents[0]._id
      }
    ];

    for (let u of seedUsers) {
      await User.create(u);
    }
    console.log(`✅ ${seedUsers.length} User accounts seeded.`);

    console.log('🎉 Seeding Complete Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
