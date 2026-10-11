/**
 * Complaints Module Helper
 */
const ComplaintModule = {
  async submitNewComplaint(data) {
    const res = await window.API.post('/api/complaints', data);
    if (res.success && window.Notifications) {
      window.Notifications.showToast(`Complaint ${res.data.complaintId} registered successfully`, 'success');
    }
    return res;
  }
};

window.ComplaintModule = ComplaintModule;
