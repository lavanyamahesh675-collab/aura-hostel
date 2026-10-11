const Room = require('../models/Room');
const Student = require('../models/Student');
const { memoryStore, isDbConnected } = require('../config/db');

class RoomService {
  /**
   * Allocate room to student and increment occupancy
   */
  static async allocateRoom(roomNumber) {
    if (isDbConnected()) {
      const room = await Room.findOne({ roomNumber });
      if (!room) throw new Error(`Room ${roomNumber} not found.`);
      if (room.occupied >= room.capacity) throw new Error(`Room ${roomNumber} is at full capacity.`);

      room.occupied += 1;
      if (room.occupied >= room.capacity) room.status = 'Full';
      await room.save();
      return room;
    } else {
      const room = memoryStore.rooms.find(r => r.roomNumber === roomNumber);
      if (!room) throw new Error(`Room ${roomNumber} not found.`);
      if ((room.occupied || 0) >= room.capacity) throw new Error(`Room ${roomNumber} is full.`);

      room.occupied = (room.occupied || 0) + 1;
      if (room.occupied >= room.capacity) room.status = 'Full';
      return room;
    }
  }

  /**
   * Vacate room bed and decrement occupancy
   */
  static async vacateRoom(roomNumber) {
    if (isDbConnected()) {
      const room = await Room.findOne({ roomNumber });
      if (room && room.occupied > 0) {
        room.occupied -= 1;
        room.status = 'Available';
        await room.save();
      }
      return room;
    } else {
      const room = memoryStore.rooms.find(r => r.roomNumber === roomNumber);
      if (room && (room.occupied || 0) > 0) {
        room.occupied -= 1;
        room.status = 'Available';
      }
      return room;
    }
  }

  /**
   * Transfer student between rooms
   */
  static async transferRoom(studentId, oldRoomNo, newRoomNo) {
    await this.vacateRoom(oldRoomNo);
    await this.allocateRoom(newRoomNo);
    return { oldRoomNo, newRoomNo, studentId };
  }
}

module.exports = RoomService;
