const express = require('express');
const router = express.Router();
const os = require('os');
const path = require('path');
const SchemaValidationService = require('../services/schemaValidationService');
const { memoryStore } = require('../config/db');

// Global Event Logs Audit Stream
const eventLogs = [];
const MAX_LOGS = 50;

const logSystemEvent = (type, details) => {
  const logEntry = {
    id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toLocaleTimeString(),
    type,
    details
  };
  eventLogs.unshift(logEntry);
  if (eventLogs.length > MAX_LOGS) eventLogs.pop();
};

// GET /api/health
router.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    system: 'AuraHostel ERP Enterprise API',
    uptime: Math.floor(process.uptime()),
    database: memoryStore.isInMemory ? 'In-Memory Fallback' : 'MongoDB Connected',
    timestamp: new Date().toISOString()
  });
});

// GET /api/system/metrics (Exp 9 OS & Path Telemetry)
router.get('/metrics', (req, res) => {
  try {
    const cpus = os.cpus();
    const configDir = path.resolve(__dirname, '../config');
    const schemasDir = path.resolve(__dirname, '../schemas');
    const publicDir = path.resolve(__dirname, '../public');

    const metrics = {
      platform: os.platform(),
      arch: os.arch(),
      osType: os.type(),
      cpuModel: cpus.length > 0 ? cpus[0].model : 'Generic CPU',
      cpuCores: cpus.length,
      totalMemory: (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
      freeMemory: (os.freemem() / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
      memoryUsagePercent: (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(1) + '%',
      serverUptimeSeconds: Math.floor(os.uptime()),
      processUptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      pid: process.pid,
      paths: {
        configDir,
        schemasDir,
        publicDir,
        currentFile: __filename
      },
      timestamp: new Date().toISOString()
    };

    return res.json({ success: true, metrics });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/system/validate-schema (Exp 6 XML, DTD & XSD Validation Engine)
router.get('/validate-schema', (req, res) => {
  try {
    const result = SchemaValidationService.validateRulesSchema();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/system/trigger-event (Exp 9)
router.post('/trigger-event', (req, res) => {
  const { eventName, details } = req.body;
  const hostelEvents = req.app.get('hostelEvents');

  if (!eventName) {
    return res.status(400).json({ success: false, message: 'eventName is required' });
  }

  if (hostelEvents) {
    hostelEvents.emit(eventName, details || { triggeredBy: 'Warden Panel', timestamp: new Date() });
    return res.json({
      success: true,
      message: `Event '${eventName}' dispatched successfully`,
      event: eventName
    });
  } else {
    return res.status(500).json({ success: false, message: 'EventEmitter instance not found' });
  }
});

// GET /api/system/event-logs (Exp 9)
router.get('/event-logs', (req, res) => {
  return res.json({
    success: true,
    logsCount: eventLogs.length,
    logs: eventLogs
  });
});

module.exports = {
  router,
  logSystemEvent
};
