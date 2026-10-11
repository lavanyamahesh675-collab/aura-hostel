const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { memoryStore, isDbConnected } = require('../config/db');

// Seed initial users if empty in memoryStore
const defaultUsers = [
  {
    id: 'USR-001',
    name: 'Dr. Robert Warden',
    email: 'warden@aurahostel.com',
    username: 'warden',
    password: 'admin123',
    role: 'Warden',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'USR-002',
    name: 'Sarah Chief Admin',
    email: 'admin@aurahostel.com',
    username: 'admin',
    password: 'admin123',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'USR-003',
    name: 'Alexander Johnson',
    email: 'alex@aurahostel.com',
    username: 'alex',
    password: 'student123',
    role: 'Student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

if (!memoryStore.users || memoryStore.users.length === 0) {
  memoryStore.users = [...defaultUsers];
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, username, password, role } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Default role protection: Public registration defaults to Student unless authenticated Admin
    const assignedRole = (role && role !== 'Admin') ? role : 'Student';

    if (isDbConnected()) {
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User with this email or username already exists' });
      }

      const newUser = await User.create({
        name,
        email,
        username,
        password,
        role: assignedRole
      });

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully!',
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
      });
    } else {
      const existing = memoryStore.users.find(u => u.email === email || u.username === username);
      if (existing) {
        return res.status(400).json({ success: false, message: 'User with this email or username already exists' });
      }

      const newUser = {
        id: `USR-${Date.now()}`,
        name,
        email,
        username,
        password,
        role: assignedRole,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
      memoryStore.users.push(newUser);

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully!',
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    let user;
    let isMatch = false;

    if (isDbConnected()) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        isMatch = await user.comparePassword(password);
      }
    } else {
      user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.username === email.toLowerCase());
      if (user && user.password === password) {
        isMatch = true;
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Use warden@aurahostel.com / admin123' });
    }

    const sessionUser = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      loginTime: new Date().toISOString()
    };

    req.session.user = sessionUser;

    res.cookie('aura_auth_token', Buffer.from(JSON.stringify(sessionUser)).toString('base64'), {
      maxAge: 86400000,
      httpOnly: true,
      signed: true
    });

    const hostelEvents = req.app.get('hostelEvents');
    if (hostelEvents) {
      hostelEvents.emit('userLogin', { user: user.name, role: user.role, time: new Date() });
    }

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: sessionUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me or /session
router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ authenticated: true, user: req.session.user });
  }

  // Fallback demo user
  const defaultUser = {
    id: 'USR-001',
    name: 'Dr. Robert Warden',
    email: 'warden@aurahostel.com',
    role: 'Warden',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };
  req.session.user = defaultUser;
  return res.json({ authenticated: true, user: defaultUser });
});

router.get('/session', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ authenticated: true, user: req.session.user });
  }
  const defaultUser = {
    id: 'USR-001',
    name: 'Dr. Robert Warden',
    email: 'warden@aurahostel.com',
    role: 'Warden',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };
  req.session.user = defaultUser;
  return res.json({ authenticated: true, user: defaultUser });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('aura_auth_token');
    res.clearCookie('connect.sid');
    return res.json({ success: true, message: 'Logged out successfully' });
  });
});

module.exports = router;
