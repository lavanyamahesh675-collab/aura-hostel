const Notice = require('../models/Notice');
const { memoryStore } = require('../config/db');

class NotificationService {
  static async publishNotice(noticeData) {
    const noticeId = `NTC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newNotice = {
      noticeId,
      title: noticeData.title,
      message: noticeData.message,
      category: noticeData.category || 'General',
      priority: noticeData.priority || 'Normal',
      audience: noticeData.audience || 'All',
      createdBy: noticeData.createdBy || 'Chief Warden',
      publishedDate: new Date(),
      isPinned: noticeData.isPinned || false
    };

    if (!memoryStore.isInMemory) {
      return await Notice.create(newNotice);
    } else {
      const created = { _id: `ntc-${Date.now()}`, ...newNotice };
      memoryStore.notices.unshift(created);
      return created;
    }
  }
}

module.exports = NotificationService;
