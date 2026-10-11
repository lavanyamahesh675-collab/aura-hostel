const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const RoomService = require('../services/roomService');
const { memoryStore, isDbConnected } = require('../config/db');

// GET /api/rooms
router.get('/', async (req, res) => {
  try {
    const { block, floor, type, status } = req.query;

    if (isDbConnected()) {
      let query = {};
      if (block) query.block = block;
      if (floor) query.floor = Number(floor);
      if (type) query.type = type;
      if (status) query.status = status;

      const rooms = await Room.find(query).sort({ roomNumber: 1 });
      return res.json({ success: true, count: rooms.length, data: rooms });
    } else {
      let results = memoryStore.rooms;
      if (block) results = results.filter(r => r.block === block);
      if (floor) results = results.filter(r => r.floor === Number(floor));
      if (type) results = results.filter(r => r.type === type);
      if (status) results = results.filter(r => r.status === status);

      return res.json({ success: true, count: results.length, data: results });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/rooms/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let room;
    if (isDbConnected()) {
      room = await Room.findOne({ $or: [{ _id: id }, { roomNumber: id }] });
    } else {
      room = memoryStore.rooms.find(r => r.roomNumber === id || r._id === id);
    }
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    return res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/rooms
router.post('/', async (req, res) => {
  try {
    const { roomNumber, block, floor, type, capacity, monthlyFee, amenities } = req.body;

    if (!roomNumber || !block || !type || !capacity) {
      return res.status(400).json({ success: false, message: 'Room Number, Block, Type, and Capacity are required' });
    }

    const roomData = {
      roomNumber: roomNumber.trim(),
      block,
      floor: Number(floor) || 1,
      type,
      capacity: Number(capacity),
      occupied: 0,
      monthlyFee: Number(monthlyFee) || 5000,
      amenities: amenities || ['Wi-Fi', 'Study Desk'],
      status: 'Available'
    };

    if (isDbConnected()) {
      const created = await Room.create(roomData);
      return res.status(201).json({ success: true, message: 'Room created successfully', data: created });
    } else {
      const created = { _id: `room-${Date.now()}`, ...roomData };
      memoryStore.rooms.push(created);
      return res.status(201).json({ success: true, message: 'Room created successfully', data: created });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/rooms/:id/allocate
router.post('/:id/allocate', async (req, res) => {
  try {
    const { id } = req.params;
    const room = await RoomService.allocateRoom(id);
    return res.json({ success: true, message: `Room ${id} bed allocated successfully`, data: room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/rooms/:id/vacate
router.post('/:id/vacate', async (req, res) => {
  try {
    const { id } = req.params;
    const room = await RoomService.vacateRoom(id);
    return res.json({ success: true, message: `Room ${id} bed vacated successfully`, data: room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
