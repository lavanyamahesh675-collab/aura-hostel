const express = require('express');
const http = require('http');
const path = require('path');
const os = require('os');
const EventEmitter = require('events');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const studentRoutes = require('./routes/studentRoutes');
const roomRoutes = require('./routes/roomRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const { router: systemRoutes, logSystemEvent } = require('./routes/systemRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Initialize Express App & HTTP Server (Exp 9)
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Centralized EventEmitter (Exp 9)
class HostelEventEmitter extends EventEmitter {}
const hostelEvents = new HostelEventEmitter();
app.set('hostelEvents', hostelEvents);

// Register System Event Handlers
hostelEvents.on('studentAdmitted', (data) => {
  console.log(`[EVENT] 🎓 Student Admitted: ${data.name} (${data.studentId})`);
  logSystemEvent('STUDENT_ADMITTED', data);
});

hostelEvents.on('roomVacated', (data) => {
  console.log(`[EVENT] 🚪 Room Vacated: ${data.roomNo} by ${data.name}`);
  logSystemEvent('ROOM_VACATED', data);
});

hostelEvents.on('curfewAlert', (data) => {
  console.log(`[EVENT] 🚨 Curfew Alert Triggered at 21:30!`);
  logSystemEvent('CURFEW_ALERT', data);
});

// Database Connection
connectDB();

// Security Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(helmet({ contentSecurityPolicy: false }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300
});
app.use('/api/', limiter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'aura_cookie_secret_7788'));

// Session Management (Exp 7 & 8)
app.use(session({
  secret: process.env.SESSION_SECRET || 'aura_session_secret_9988',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 86400000,
    httpOnly: true,
    secure: false
  }
}));

// Static Assets
app.use(express.static(path.join(__dirname, 'public')));

// Mount Enterprise API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', studentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/system', systemRoutes);

// Fallback SPA html
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log('\n======================================================');
    console.log('🚀 AURA HOSTEL ERP SYSTEM SERVER ACTIVE');
    console.log(`🌐 PORT: http://localhost:${PORT}`);
    console.log(`💻 OS Platform: ${os.platform()} (${os.arch()})`);
    console.log(`📁 Resolved Base Directory: ${path.resolve(__dirname)}`);
    console.log('======================================================\n');
  });
}

module.exports = app;
