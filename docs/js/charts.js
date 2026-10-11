/**
 * AuraHostel ERP - Dynamic Data Visualizations with Chart.js (Exp 4)
 * Styled for Modern Light Theme
 */

class DashboardCharts {
  constructor() {
    this.occupancyChartInstance = null;
    this.dietChartInstance = null;
    this.feeTrendChartInstance = null;
    this.complaintChartInstance = null;
    this.occupancyFullInstance = null;
    this.dietFullInstance = null;
  }

  /**
   * Initialize or Update All Charts with Fresh Async API Data
   */
  renderCharts = (students = [], rooms = []) => {
    this.renderOccupancyChart(rooms, 'occupancyChart');
    this.renderOccupancyChart(rooms, 'occupancyChartFull');
    this.renderDietChart(students, 'dietChart');
    this.renderDietChart(students, 'dietChartFull');
    this.renderFeeTrendChart();
    this.renderComplaintChart();
  };

  /**
   * Bar Chart - Room Occupancy Rate per Block
   */
  renderOccupancyChart = (rooms = [], elementId = 'occupancyChart') => {
    const ctx = document.getElementById(elementId);
    if (!ctx) return;

    const blocks = ['Block A', 'Block B', 'Block C', 'Block D'];
    const occupiedPerBlock = [0, 0, 0, 0];
    const capacityPerBlock = [0, 0, 0, 0];

    rooms.forEach(room => {
      const idx = blocks.indexOf(room.block);
      if (idx !== -1) {
        occupiedPerBlock[idx] += room.occupied || 0;
        capacityPerBlock[idx] += room.capacity || 0;
      }
    });

    if (elementId === 'occupancyChart' && this.occupancyChartInstance) {
      this.occupancyChartInstance.destroy();
    }
    if (elementId === 'occupancyChartFull' && this.occupancyFullInstance) {
      this.occupancyFullInstance.destroy();
    }

    const chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: blocks,
        datasets: [
          {
            label: 'Occupied Beds',
            data: occupiedPerBlock,
            backgroundColor: '#4f46e5',
            borderColor: '#4338ca',
            borderWidth: 1.5,
            borderRadius: 6
          },
          {
            label: 'Total Capacity',
            data: capacityPerBlock,
            backgroundColor: '#e2e8f0',
            borderColor: '#cbd5e1',
            borderWidth: 1.5,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#1e293b', font: { family: 'Outfit', size: 12, weight: '600' } } }
        },
        scales: {
          x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
          y: { ticks: { color: '#64748b', stepSize: 1 }, grid: { color: 'rgba(0, 0, 0, 0.05)' }, beginAtZero: true }
        }
      }
    });

    if (elementId === 'occupancyChart') this.occupancyChartInstance = chartInstance;
    if (elementId === 'occupancyChartFull') this.occupancyFullInstance = chartInstance;
  };

  /**
   * Doughnut Chart - Mess Diet Distribution
   */
  renderDietChart = (students = [], elementId = 'dietChart') => {
    const ctx = document.getElementById(elementId);
    if (!ctx) return;

    let vegCount = 0, nonVegCount = 0, specialCount = 0;
    students.forEach(student => {
      const pref = student.dietPreference || student.messPreference || 'Vegetarian';
      if (pref === 'Vegetarian') vegCount++;
      else if (pref === 'Non-Vegetarian') nonVegCount++;
      else specialCount++;
    });

    if (elementId === 'dietChart' && this.dietChartInstance) {
      this.dietChartInstance.destroy();
    }
    if (elementId === 'dietChartFull' && this.dietFullInstance) {
      this.dietFullInstance.destroy();
    }

    const chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Vegetarian', 'Non-Vegetarian', 'Special Diet'],
        datasets: [
          {
            data: [vegCount, nonVegCount, specialCount],
            backgroundColor: ['#059669', '#e11d48', '#d97706'],
            borderColor: '#ffffff',
            borderWidth: 3,
            hoverOffset: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { position: 'bottom', labels: { color: '#1e293b', font: { family: 'Outfit', size: 12, weight: '600' }, padding: 15 } }
        }
      }
    });

    if (elementId === 'dietChart') this.dietChartInstance = chartInstance;
    if (elementId === 'dietChartFull') this.dietFullInstance = chartInstance;
  };

  /**
   * Line Chart - Monthly Fee Collection Trend (6 Months)
   */
  renderFeeTrendChart = () => {
    const ctx = document.getElementById('feeTrendChart');
    if (!ctx) return;

    if (this.feeTrendChartInstance) this.feeTrendChartInstance.destroy();

    this.feeTrendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [{
          label: 'Fee Collection (₹)',
          data: [68000, 74000, 89000, 102000, 115000, 128000],
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#059669',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#1e293b', font: { weight: '600' } } } },
        scales: {
          x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
          y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(0, 0, 0, 0.05)' }, beginAtZero: true }
        }
      }
    });
  };

  /**
   * Horizontal Bar Chart - Complaints by Category
   */
  renderComplaintChart = () => {
    const ctx = document.getElementById('complaintChart');
    if (!ctx) return;

    if (this.complaintChartInstance) this.complaintChartInstance.destroy();

    this.complaintChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Wi-Fi', 'Plumbing', 'Electrical', 'Cleaning', 'Carpentry'],
        datasets: [
          { label: 'Resolved Tickets', data: [12, 9, 7, 15, 4], backgroundColor: '#059669', borderRadius: 6 },
          { label: 'Pending Tickets', data: [3, 2, 1, 4, 1], backgroundColor: '#f43f5e', borderRadius: 6 }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#1e293b', font: { weight: '600' } } } },
        scales: {
          x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(0, 0, 0, 0.05)' }, beginAtZero: true },
          y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(0, 0, 0, 0.05)' } }
        }
      }
    });
  };
}

window.dashboardCharts = new DashboardCharts();
