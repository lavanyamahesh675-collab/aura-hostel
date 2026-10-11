/**
 * Student Roster Component Helper
 */
const StudentModule = {
  async exportCSV() {
    const res = await window.API.get('/api/students');
    if (!res.success || !res.data) return;

    const headers = ['Student ID', 'Name', 'Email', 'Phone', 'Gender', 'Block', 'Room No', 'Fee Status', 'Diet'];
    const rows = res.data.map(s => [
      s.studentId,
      `"${s.name}"`,
      s.email,
      s.phone,
      s.gender,
      s.block,
      s.roomNo,
      s.feeStatus,
      s.dietPreference || s.messPreference
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AuraHostel_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (window.Notifications) window.Notifications.showToast('Student Roster exported to CSV!', 'success');
  }
};

window.StudentModule = StudentModule;
