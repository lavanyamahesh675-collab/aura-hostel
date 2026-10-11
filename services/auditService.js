const ActivityLog = require('../models/ActivityLog');
const { memoryStore } = require('../config/db');

class AuditService {
  static async logAction(action, user, role, details) {
    const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const logData = {
      logId,
      action,
      user: user || 'System Warden',
      userRole: role || 'Warden',
      details: details || {},
      timestamp: new Date()
    };

    if (!memoryStore.isInMemory) {
      try {
        await ActivityLog.create(logData);
      } catch (e) {
        // Log fallback
      }
    } else {
      memoryStore.activityLogs.unshift(logData);
      if (memoryStore.activityLogs.length > 100) memoryStore.activityLogs.pop();
    }
    return logData;
  }
}

module.exports = AuditService;
