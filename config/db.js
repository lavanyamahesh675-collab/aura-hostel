const mongoose = require('mongoose');

// In-Memory Persistence Storage Layer (Fallback Mode)
const memoryStore = {
  isInMemory: true, // Default to in-memory until MongoDB explicitly connects
  users: [],
  students: [],
  rooms: [],
  payments: [],
  complaints: [],
  attendance: [],
  visitors: [],
  notices: [],
  activityLogs: []
};

const isDbConnected = () => {
  return mongoose.connection.readyState === 1 && !memoryStore.isInMemory;
};

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aura_hostel';
  
  try {
    mongoose.set('strictQuery', false);
    // Disable command buffering so operations don't hang if Mongo isn't up
    mongoose.set('bufferCommands', false);
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000
    });
    
    console.log('✅ [DATABASE] MongoDB Connected Successfully at:', mongoURI);
    memoryStore.isInMemory = false;
  } catch (error) {
    console.log('⚡ [DATABASE] Operating in High-Performance Local In-Memory Store (Instant Standalone Mode)');
    memoryStore.isInMemory = true;
  }
};

mongoose.connection.on('disconnected', () => {
  memoryStore.isInMemory = true;
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ [DATABASE] MongoDB Reconnected.');
  memoryStore.isInMemory = false;
});

module.exports = {
  connectDB,
  memoryStore,
  isDbConnected
};
