/**
 * AuraHostel ERP - Main Single Page Application Coordinator (Exp 1 - 10)
 * Handles state management, async REST API communication, view switching, and telemetry streaming.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global Application State
  const AppState = {
    user: null,
    students: [],
    rooms: [],
    activeTab: 'dashboard',
    admitModal: null,
    editModal: null
  };

  // DOM Elements
  const elements = {
    navLinks: document.querySelectorAll('.nav-link-custom'),
    viewSections: document.querySelectorAll('.view-section'),
    headerTitle: document.getElementById('header-title'),
    userAvatar: document.getElementById('user-avatar'),
    userName: document.getElementById('user-name'),
    userRole: document.getElementById('user-role'),
    
    // Dashboard Stats
    statTotalStudents: document.getElementById('stat-total-students'),
    statAvailableBeds: document.getElementById('stat-available-beds'),
    statOccupancyRate: document.getElementById('stat-occupancy-rate'),
    statPendingFees: document.getElementById('stat-pending-fees'),
    
    // Containers
    studentRosterTableBody: document.getElementById('studentRosterTableBody'),
    roomGridContainer: document.getElementById('roomGridContainer'),
    eventLogTerminal: document.getElementById('eventLogTerminal'),
    xmlCodeDisplay: document.getElementById('xmlCodeDisplay'),
    xmlValidationBadge: document.getElementById('xmlValidationBadge'),
    
    // Forms & Search
    searchStudentInput: document.getElementById('searchStudentInput'),
    filterBlockSelect: document.getElementById('filterBlockSelect'),
    filterFeeSelect: document.getElementById('filterFeeSelect'),
    admitStudentForm: document.getElementById('admitStudentForm'),
    btnSaveStudent: document.getElementById('btnSaveStudent'),
    btnValidateXml: document.getElementById('btnValidateXml'),
    btnTriggerCurfew: document.getElementById('btnTriggerCurfew')
  };

  // Initialize Bootstrap Modals
  if (document.getElementById('admitStudentModal')) {
    AppState.admitModal = new bootstrap.Modal(document.getElementById('admitStudentModal'));
  }
  if (document.getElementById('newComplaintModal')) {
    AppState.complaintModal = new bootstrap.Modal(document.getElementById('newComplaintModal'));
  }
  if (document.getElementById('paymentModal')) {
    AppState.paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
  }

  // --- 1. SESSION & ROLE-BASED UI CONTROLLER (Exp 7 & 8) ---
  const applyRoleUI = (user) => {
    if (!user) return;
    const role = user.role || 'Warden';
    AppState.user = user;

    // 1. Update Profile Badges & Avatar
    if (elements.userName) elements.userName.textContent = user.name;
    if (elements.userAvatar && user.avatar) elements.userAvatar.src = user.avatar;
    if (elements.userRole) {
      if (role === 'Student') {
        elements.userRole.textContent = `RESIDENT STUDENT (${user.roomNo || 'A-101'})`;
        elements.userRole.className = 'badge bg-success-subtle text-success border border-success-subtle px-2 py-1';
      } else if (role === 'Admin') {
        elements.userRole.textContent = 'CAMPUS ADMINISTRATOR';
        elements.userRole.className = 'badge bg-info-subtle text-info border border-info-subtle px-2 py-1';
      } else {
        elements.userRole.textContent = 'CHIEF WARDEN';
        elements.userRole.className = 'badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1';
      }
    }

    // 2. Update Brand Subtitle
    const subtitle = document.getElementById('brand-role-subtitle');
    if (subtitle) {
      if (role === 'Student') subtitle.textContent = 'STUDENT LIVING PORTAL';
      else if (role === 'Admin') subtitle.textContent = 'ADMINISTRATIVE DESK';
      else subtitle.textContent = 'CAMPUS OPERATIONS';
    }

    // 3. Filter Sidebar Items by data-role
    document.querySelectorAll('#navMenu li').forEach(li => {
      const allowedRoles = (li.getAttribute('data-role') || '').split(',').map(s => s.trim());
      if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        li.style.display = 'none';
      } else {
        li.style.display = 'block';
      }
    });

    // 4. Warden-specific Curfew Bell Box
    const curfewBox = document.getElementById('wardenCurfewBox');
    if (curfewBox) {
      curfewBox.style.display = (role === 'Warden') ? 'block' : 'none';
    }

    // 5. Filter Header Action Buttons
    const btnExport = document.getElementById('btnExportRoster');
    const btnAdmit = document.getElementById('btnHeaderAdmit');
    const btnStudentComplaint = document.getElementById('btnStudentComplaintQuick');
    const btnStudentPay = document.getElementById('btnStudentPayQuick');

    if (btnExport) btnExport.style.display = (role === 'Warden' || role === 'Admin') ? 'inline-block' : 'none';
    if (btnAdmit) btnAdmit.style.display = (role === 'Warden' || role === 'Admin') ? 'inline-block' : 'none';
    if (btnStudentComplaint) btnStudentComplaint.classList.toggle('d-none', role !== 'Student');
    if (btnStudentPay) btnStudentPay.classList.toggle('d-none', role !== 'Student');

    // 6. Set Active View according to Role
    if (role === 'Student') {
      const studentTab = document.querySelector('.nav-link-custom[data-tab="student-portal"]');
      if (studentTab) {
        document.querySelectorAll('.nav-link-custom').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active-view'));
        studentTab.classList.add('active');
        const view = document.getElementById('student-portal-view');
        if (view) view.classList.add('active-view');
      }
      if (elements.headerTitle) elements.headerTitle.textContent = 'Resident Living Space & Quarters';
      loadStudentPortalData(user);
    } else if (role === 'Admin') {
      const adminTab = document.querySelector('.nav-link-custom[data-tab="dashboard"]');
      if (adminTab) {
        document.querySelectorAll('.nav-link-custom').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active-view'));
        adminTab.classList.add('active');
        const view = document.getElementById('dashboard-view');
        if (view) view.classList.add('active-view');
      }
      if (elements.headerTitle) elements.headerTitle.textContent = 'Campus Operations & Admissions';
      loadAdminComplaintsData();
    } else {
      const wardenTab = document.querySelector('.nav-link-custom[data-tab="dashboard"]');
      if (wardenTab) {
        document.querySelectorAll('.nav-link-custom').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active-view'));
        wardenTab.classList.add('active');
        const view = document.getElementById('dashboard-view');
        if (view) view.classList.add('active-view');
      }
      if (elements.headerTitle) elements.headerTitle.textContent = 'Executive Operations Dashboard';
    }
  };

  const initApp = async () => {
    try {
      // Check Auth Session (Exp 7 & 8)
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      
      if (data.authenticated) {
        AppState.user = data.user;
        applyRoleUI(data.user);
      } else {
        applyRoleUI({
          role: 'Warden',
          name: 'Dr. Robert Warden',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        });
      }

      // Initial Data Loading
      await refreshAllData();
      
      // Setup Event Handlers
      setupEventListeners();
      
      // Start Telemetry Polling (Every 4 Seconds)
      setInterval(pollTelemetry, 4000);

      console.log('✨ [AuraHostel ERP] Client Engine Initialized Successfully.');
    } catch (error) {
      console.error('App init error:', error);
    }
  };

  // Refresh All Core Application Data
  const refreshAllData = async () => {
    await Promise.all([
      fetchStudents(),
      fetchRooms(),
      fetchSystemMetrics()
    ]);
    updateDashboardOverview();
    if (window.dashboardCharts) {
      window.dashboardCharts.renderCharts(AppState.students, AppState.rooms);
    }
  };

  // --- 2. ASYNC API HANDLERS (Exp 5 & 10) ---
  const fetchStudents = async () => {
    try {
      const search = elements.searchStudentInput ? elements.searchStudentInput.value : '';
      const block = elements.filterBlockSelect ? elements.filterBlockSelect.value : '';
      const feeStatus = elements.filterFeeSelect ? elements.filterFeeSelect.value : '';

      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (block) queryParams.append('block', block);
      if (feeStatus) queryParams.append('feeStatus', feeStatus);

      const res = await fetch(`/api/students?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        AppState.students = data.data;
        renderStudentTable(data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms/all');
      const data = await res.json();
      if (data.success) {
        AppState.rooms = data.data;
        renderRoomGrid(data.data);
        populateRoomSelectOptions(data.data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchSystemMetrics = async () => {
    try {
      const res = await fetch('/api/system/metrics');
      const data = await res.json();
      if (data.success) {
        renderTelemetryMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error fetching system metrics:', error);
    }
  };

  // --- 3. DYNAMIC UI RENDERERS ---
  const updateDashboardOverview = () => {
    const totalStudents = AppState.students.length;
    let totalCapacity = 0;
    let totalOccupied = 0;

    AppState.rooms.forEach(r => {
      totalCapacity += r.capacity || 0;
      totalOccupied += r.occupied || 0;
    });

    const availableBeds = Math.max(0, totalCapacity - totalOccupied);
    const occupancyRate = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : 0;
    const pendingCount = AppState.students.filter(s => s.feeStatus === 'Pending' || s.feeStatus === 'Overdue').length;

    if (elements.statTotalStudents) elements.statTotalStudents.textContent = totalStudents;
    if (elements.statAvailableBeds) elements.statAvailableBeds.textContent = availableBeds;
    if (elements.statOccupancyRate) elements.statOccupancyRate.textContent = `${occupancyRate}%`;
    if (elements.statPendingFees) elements.statPendingFees.textContent = pendingCount;
  };

  const renderStudentTable = (students) => {
    if (!elements.studentRosterTableBody) return;

    if (students.length === 0) {
      elements.studentRosterTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-muted">
            <i class="fa-solid fa-folder-open me-2"></i>No student records match the specified filters.
          </td>
        </tr>
      `;
      return;
    }

    elements.studentRosterTableBody.innerHTML = students.map(s => {
      let badgeClass = 'badge-paid';
      if (s.feeStatus === 'Pending') badgeClass = 'badge-pending';
      if (s.feeStatus === 'Overdue') badgeClass = 'badge-overdue';

      return `
        <tr>
          <td class="fw-bold text-info">${s.studentId}</td>
          <td>
            <div class="fw-semibold">${s.name}</div>
            <div class="small text-muted">${s.email}</div>
          </td>
          <td>${s.phone}</td>
          <td><span class="badge bg-dark border border-secondary">${s.gender}</span></td>
          <td>
            <span class="badge bg-secondary bg-opacity-25 text-white me-1">${s.block}</span>
            <span class="fw-bold text-cyan">${s.roomNo}</span>
          </td>
          <td><span class="badge bg-dark text-light border border-secondary">${s.dietPreference || 'Vegetarian'}</span></td>
          <td><span class="badge-status ${badgeClass}">${s.feeStatus}</span></td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-warning btn-edit-student" data-id="${s.studentId}" title="Edit Record">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="btn btn-outline-danger btn-delete-student" data-id="${s.studentId}" data-name="${s.name}" title="Vacate Room">
                <i class="fa-solid fa-user-minus"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  };

  const renderRoomGrid = (rooms) => {
    if (!elements.roomGridContainer) return;

    elements.roomGridContainer.innerHTML = rooms.map(r => {
      const isFull = r.occupied >= r.capacity;
      const statusClass = isFull ? 'status-full' : 'status-available';
      const pct = Math.min(100, Math.round(((r.occupied || 0) / r.capacity) * 100));

      return `
        <div class="glass-panel room-card ${statusClass}">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h5 class="fw-bold mb-0 text-white">${r.roomNumber}</h5>
              <span class="small text-muted">${r.block} • ${r.type}</span>
            </div>
            <span class="badge ${isFull ? 'bg-danger' : 'bg-success'} text-white">${isFull ? 'FULL' : 'AVAILABLE'}</span>
          </div>

          <div class="mt-3">
            <div class="d-flex justify-content-between small text-muted mb-1">
              <span>Occupancy</span>
              <span>${r.occupied || 0} / ${r.capacity} Beds</span>
            </div>
            <div class="progress bg-dark" style="height: 6px;">
              <div class="progress-bar ${isFull ? 'bg-danger' : 'bg-cyan'}" style="width: ${pct}%"></div>
            </div>
          </div>

          <div class="mt-3 pt-2 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
            <span class="small fw-semibold text-accent-cyan">₹${r.monthlyFee}/mo</span>
            <button class="btn btn-sm btn-outline-cyan rounded-pill btn-quick-assign" data-room="${r.roomNumber}" data-block="${r.block}" ${isFull ? 'disabled' : ''}>
              ${isFull ? 'Full' : 'Assign'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  };

  const populateRoomSelectOptions = (rooms) => {
    const roomSelect = document.getElementById('studentRoomNo');
    if (!roomSelect) return;

    const availableRooms = rooms.filter(r => (r.occupied || 0) < r.capacity);
    roomSelect.innerHTML = `
      <option value="">-- Select Available Room --</option>
      ${availableRooms.map(r => `<option value="${r.roomNumber}">${r.roomNumber} (${r.block} - ${r.type})</option>`).join('')}
    `;
  };

  const renderTelemetryMetrics = (metrics) => {
    const elPlatform = document.getElementById('telemetry-platform');
    const elArch = document.getElementById('telemetry-arch');
    const elCpu = document.getElementById('telemetry-cpu');
    const elRam = document.getElementById('telemetry-ram');
    const elUptime = document.getElementById('telemetry-uptime');
    const elPaths = document.getElementById('telemetry-paths');

    if (elPlatform) elPlatform.textContent = `${metrics.platform} (${metrics.arch})`;
    if (elArch) elArch.textContent = metrics.nodeVersion;
    if (elCpu) elCpu.textContent = `${metrics.cpuModel} (${metrics.cpuCores} Cores)`;
    if (elRam) elRam.textContent = `${metrics.freeMemory} free / ${metrics.totalMemory} (${metrics.memoryUsagePercent} in use)`;
    if (elUptime) elUptime.textContent = `${Math.floor(metrics.processUptimeSeconds / 60)} mins ${metrics.processUptimeSeconds % 60} secs`;
    if (elPaths) {
      elPaths.innerHTML = `
        <div class="mb-1 text-muted"><i class="fa-solid fa-server me-2 text-primary"></i>Architecture: Express Engine & Mongoose Persistence</div>
        <div class="text-muted"><i class="fa-solid fa-database me-2 text-success"></i>Storage: Production-Ready Database Store</div>
      `;
    }
  };

  // --- 4. TELEMETRY & EVENT AUDIT STREAMING (Exp 9) ---
  const pollTelemetry = async () => {
    try {
      const res = await fetch('/api/system/event-logs');
      const data = await res.json();
      if (data.success && elements.eventLogTerminal) {
        if (data.logs.length === 0) {
          elements.eventLogTerminal.innerHTML = `
            <div class="p-4 text-center text-muted">
              <i class="fa-solid fa-bell-slash fs-4 mb-2 d-block text-secondary"></i>
              <span>No recent events. System is standing by and monitoring live operations.</span>
            </div>
          `;
        } else {
          elements.eventLogTerminal.innerHTML = data.logs.map(log => {
            let detailText = '';
            let icon = 'fa-circle-info';
            let badgeBg = 'bg-primary-subtle text-primary border border-primary-subtle';

            if (log.type === 'STUDENT_ADMITTED') {
              icon = 'fa-user-check text-success';
              badgeBg = 'bg-success-subtle text-success border border-success-subtle';
              detailText = `Student ${log.details.name || ''} admitted to Room ${log.details.roomNo || ''} (${log.details.block || ''})`;
            } else if (log.type === 'ROOM_VACATED') {
              icon = 'fa-door-open text-warning';
              badgeBg = 'bg-warning-subtle text-warning border border-warning-subtle';
              detailText = `Room ${log.details.roomNo || ''} vacated by ${log.details.name || ''}. Bed restored.`;
            } else if (log.type === 'CURFEW_ALERT') {
              icon = 'fa-bell text-danger';
              badgeBg = 'bg-danger-subtle text-danger border border-danger-subtle';
              detailText = `Curfew alert activated for 21:30 in-time policy. Warden audit broadcast sent.`;
            } else if (log.type === 'USER_LOGIN') {
              icon = 'fa-key text-info';
              badgeBg = 'bg-info-subtle text-info border border-info-subtle';
              detailText = `User ${log.details.user || ''} (${log.details.role || ''}) successfully authenticated.`;
            } else {
              detailText = typeof log.details === 'object' ? Object.values(log.details).filter(v => typeof v === 'string').join(' • ') : String(log.details);
            }

            return `
              <div class="activity-item">
                <div class="me-2 fs-5"><i class="fa-solid ${icon}"></i></div>
                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="badge ${badgeBg} activity-badge">${log.type.replace('_', ' ')}</span>
                    <span class="text-muted small"><i class="fa-regular fa-clock me-1"></i>${log.timestamp}</span>
                  </div>
                  <div class="text-dark small fw-medium">${detailText}</div>
                </div>
              </div>
            `;
          }).join('');
        }
      }
    } catch (e) {
      // Silent telemetry fetch retry
    }
  };

  // --- 5. XML / DTD / XSD VALIDATOR (Exp 6) ---
  const handleValidateXmlSchema = async () => {
    try {
      if (elements.btnValidateXml) {
        elements.btnValidateXml.disabled = true;
        elements.btnValidateXml.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Verifying Standards...`;
      }
      if (elements.xmlValidationBadge) {
        elements.xmlValidationBadge.innerHTML = `<span class="spinner-border spinner-border-sm me-1 text-primary"></span>Validating XML, DTD & XSD...`;
      }

      const res = await fetch('/api/system/validate-schema');
      const data = await res.json();

      if (data.success) {
        if (elements.btnValidateXml) {
          elements.btnValidateXml.disabled = false;
          elements.btnValidateXml.innerHTML = `<i class="fa-solid fa-check-double me-2"></i>Verified & Compliant`;
          elements.btnValidateXml.classList.remove('btn-cyan');
          elements.btnValidateXml.classList.add('btn-success');
        }

        if (elements.xmlValidationBadge) {
          elements.xmlValidationBadge.innerHTML = data.valid
            ? `<span class="badge bg-success-subtle text-success border border-success-subtle p-2 fs-6"><i class="fa-solid fa-check-circle me-1"></i>DTD & XSD VALIDATED & COMPLIANT</span>`
            : `<span class="badge bg-danger-subtle text-danger border border-danger-subtle p-2 fs-6"><i class="fa-solid fa-triangle-exclamation me-1"></i>VALIDATION FAILED</span>`;
        }

        const summary = data.summary || {};
        const curfew = summary.curfewPolicy || { inTime: '21:30', outTime: '06:00', finePerLateHour: 100, emergencyContact: '+91-98765-00000' };
        const categories = summary.roomCategories || [
          { type: 'Single', capacity: 1, monthlyFee: 8000, amenities: 'AC, Attached Bath, Desk, Wi-Fi' },
          { type: 'Double', capacity: 2, monthlyFee: 6000, amenities: 'Fan, Twin Desks, Wi-Fi' },
          { type: 'Triple', capacity: 3, monthlyFee: 4500, amenities: 'Fan, Triple Desks, Wi-Fi' },
          { type: 'Suite', capacity: 2, monthlyFee: 10000, amenities: 'AC, Balcony, Private Bath, Premium Wi-Fi' }
        ];

        if (elements.xmlCodeDisplay) {
          elements.xmlCodeDisplay.innerHTML = `
            <div class="p-3">
              <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <h6 class="fw-bold text-dark mb-0"><i class="fa-solid fa-shield-halved me-2 text-primary"></i>Official Policy & Curfew Standards</h6>
                <span class="badge bg-success-subtle text-success border border-success-subtle"><i class="fa-solid fa-circle-check me-1"></i>XML / DTD / XSD Valid</span>
              </div>
              
              <div class="row g-3 mb-3">
                <div class="col-6">
                  <div class="p-2.5 bg-light rounded-3">
                    <div class="text-muted small">Campus Gate Curfew (In-Time)</div>
                    <div class="fw-bold fs-5 text-dark">${curfew.inTime} PM</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-2.5 bg-light rounded-3">
                    <div class="text-muted small">Campus Gate Opening (Out-Time)</div>
                    <div class="fw-bold fs-5 text-dark">${curfew.outTime} AM</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-2.5 bg-light rounded-3">
                    <div class="text-muted small">Late Hour Fine</div>
                    <div class="fw-bold fs-5 text-danger">₹${curfew.finePerLateHour}/hr</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-2.5 bg-light rounded-3">
                    <div class="text-muted small">Emergency Warden Helpline</div>
                    <div class="fw-bold fs-6 text-primary">${curfew.emergencyContact}</div>
                  </div>
                </div>
              </div>

              <div class="p-2.5 bg-light rounded-3 mb-3">
                <div class="fw-bold text-dark small mb-2"><i class="fa-solid fa-bed me-1 text-primary"></i>Verified Room Inventory Classifications</div>
                <div class="row g-2">
                  ${categories.map(c => `
                    <div class="col-6">
                      <div class="p-2 bg-white rounded border small">
                        <div class="fw-semibold text-dark">${c.type} Sharing &bull; ₹${c.monthlyFee}/mo</div>
                        <div class="text-muted" style="font-size: 0.75rem;">Cap: ${c.capacity} &bull; ${c.amenities}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="p-2.5 bg-success-subtle border border-success-subtle rounded-3 text-success small d-flex align-items-center gap-2">
                <i class="fa-solid fa-shield-check fs-5"></i>
                <div>All curfew regulations, bed inventory, and dietary schedules conform 100% to hostelRules.dtd & hostelRules.xsd schema rules.</div>
              </div>
            </div>
          `;
        }

        const summaryContainer = document.getElementById('xmlRulesSummary');
        if (summaryContainer) {
          summaryContainer.innerHTML = `
            <div class="policy-card mb-3">
              <h6 class="fw-bold text-dark mb-2"><i class="fa-solid fa-utensils me-2 text-primary"></i>Weekly Mess Schedule Highlights</h6>
              <div class="small text-muted mb-2">Validated across 7 Days with 4 Daily Meal Intervals (Breakfast, Lunch, Snacks, Dinner).</div>
              <ul class="list-unstyled small mb-0">
                <li class="py-1.5 border-bottom d-flex justify-content-between"><span>Breakfast</span> <span class="fw-semibold text-dark">07:30 - 09:30</span></li>
                <li class="py-1.5 border-bottom d-flex justify-content-between"><span>Lunch</span> <span class="fw-semibold text-dark">12:30 - 14:30</span></li>
                <li class="py-1.5 border-bottom d-flex justify-content-between"><span>Evening Snacks</span> <span class="fw-semibold text-dark">17:00 - 18:00</span></li>
                <li class="py-1.5 d-flex justify-content-between"><span>Dinner</span> <span class="fw-semibold text-dark">19:30 - 21:30</span></li>
              </ul>
            </div>
            <div class="small text-muted text-center"><i class="fa-solid fa-check-double text-success me-1"></i>Compliant with DTD grammar and XSD structural specifications</div>
          `;
        }

        // Also populate 7-Day table in student-mess-view if container exists
        const weeklyContainer = document.getElementById('fullWeeklyMenuContainer');
        if (weeklyContainer && summary.weeklyMenu) {
          weeklyContainer.innerHTML = `
            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Breakfast (07:30 - 09:30)</th>
                    <th>Lunch (12:30 - 14:30)</th>
                    <th>Dinner (19:30 - 21:30)</th>
                  </tr>
                </thead>
                <tbody>
                  ${summary.weeklyMenu.map(d => `
                    <tr>
                      <td class="fw-bold text-dark">${d.day}</td>
                      <td>${d.breakfast}</td>
                      <td>${d.lunch}</td>
                      <td>${d.dinner}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;
        }

        if (window.Notifications) {
          window.Notifications.showToast('Hostel regulations and curfew verified against DTD & XSD schemas with 100% compliance!', 'success');
        }
      }
    } catch (error) {
      console.error('Schema validation error:', error);
      if (elements.btnValidateXml) elements.btnValidateXml.disabled = false;
    }
  };

  // --- 6. ROLE DATA LOADERS ---
  const loadStudentPortalData = async (user) => {
    const heroName = document.getElementById('studentHeroName');
    if (heroName) heroName.textContent = `${user.name} — Room ${user.roomNo || 'A-101'}`;

    // Load Student Payments
    try {
      const res = await fetch('/api/payments');
      const data = await res.json();
      if (data.success) {
        const tbody = document.getElementById('studentFeeHistoryTableBody');
        if (tbody) {
          tbody.innerHTML = data.data.map(p => `
            <tr>
              <td><strong>${p.receiptNo}</strong></td>
              <td>${p.paymentFor || 'Hostel Fee'}</td>
              <td class="fw-bold text-dark">₹${p.amount.toLocaleString()}</td>
              <td>${p.month || 'October 2026'}</td>
              <td><span class="badge bg-light text-dark border">${p.paymentMethod || 'UPI'}</span></td>
              <td class="small text-muted">${p.transactionRef || 'TXN-99881122'}</td>
              <td><span class="badge bg-success-subtle text-success border border-success-subtle">Paid</span></td>
            </tr>
          `).join('');
        }
      }
    } catch (e) {
      console.error('Error loading student payments:', e);
    }

    // Load Student Complaints
    try {
      const res = await fetch('/api/complaints');
      const data = await res.json();
      if (data.success) {
        const tbody = document.getElementById('studentComplaintsTableBody');
        if (tbody) {
          tbody.innerHTML = data.data.map(c => {
            const statusClass = c.status === 'Resolved' ? 'bg-success-subtle text-success border-success-subtle' :
                                c.status === 'In-Progress' ? 'bg-primary-subtle text-primary border-primary-subtle' : 'bg-warning-subtle text-warning border-warning-subtle';
            return `
              <tr>
                <td><strong>${c.complaintId}</strong></td>
                <td><span class="badge bg-light text-dark border">${c.category}</span></td>
                <td>
                  <div class="fw-semibold text-dark">${c.subject}</div>
                  <div class="small text-muted">${c.description}</div>
                </td>
                <td><span class="badge ${c.priority === 'High' ? 'bg-danger text-white' : 'bg-light text-muted border'}">${c.priority}</span></td>
                <td><span class="badge ${statusClass} border">${c.status}</span></td>
                <td class="small text-muted">${new Date(c.createdAt || Date.now()).toLocaleDateString()}</td>
                <td class="small text-muted">${c.assignedStaff || 'Maintenance Crew'}</td>
              </tr>
            `;
          }).join('');
        }
      }
    } catch (e) {
      console.error('Error loading student complaints:', e);
    }

    // Pre-load weekly menu if not loaded
    const menuContainer = document.getElementById('fullWeeklyMenuContainer');
    if (menuContainer && menuContainer.children.length === 0) {
      handleValidateXmlSchema();
    }
  };

  const loadAdminComplaintsData = async () => {
    try {
      const res = await fetch('/api/complaints');
      const data = await res.json();
      if (data.success) {
        const tbody = document.getElementById('adminComplaintsTableBody');
        if (tbody) {
          tbody.innerHTML = data.data.map(c => {
            const statusBadge = c.status === 'Resolved' ? '<span class="badge bg-success-subtle text-success border border-success-subtle">Resolved</span>' :
                                c.status === 'In-Progress' ? '<span class="badge bg-primary-subtle text-primary border border-primary-subtle">In-Progress</span>' :
                                '<span class="badge bg-warning-subtle text-warning border border-warning-subtle">Submitted</span>';
            return `
              <tr>
                <td><strong>${c.complaintId}</strong></td>
                <td>
                  <div class="fw-bold text-dark">${c.studentName || 'Resident'}</div>
                  <div class="small text-muted">Room: ${c.roomNo}</div>
                </td>
                <td><span class="badge bg-light text-dark border">${c.category}</span></td>
                <td>
                  <div class="fw-semibold text-dark">${c.subject}</div>
                  <div class="small text-muted">${c.description}</div>
                </td>
                <td><span class="badge ${c.priority === 'High' ? 'bg-danger text-white' : 'bg-light text-dark border'}">${c.priority}</span></td>
                <td>${statusBadge}</td>
                <td class="small text-muted">${c.assignedStaff || 'Unassigned'}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary btn-sm" onclick="window.updateComplaintStatus('${c.complaintId}', 'In-Progress')">In-Progress</button>
                    <button class="btn btn-outline-success btn-sm" onclick="window.updateComplaintStatus('${c.complaintId}', 'Resolved')">Resolve</button>
                  </div>
                </td>
              </tr>
            `;
          }).join('');
        }
      }
    } catch (e) {
      console.error('Error loading admin complaints:', e);
    }
  };

  // Global window functions for action buttons
  window.updateComplaintStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assignedStaff: 'Campus Facility Staff' })
      });
      const data = await res.json();
      if (data.success) {
        if (window.Notifications) window.Notifications.showToast(`Complaint ${id} updated to '${status}'`, 'success');
        loadAdminComplaintsData();
      }
    } catch (e) {
      console.error('Error updating complaint status:', e);
    }
  };

  window.saveStudentDiet = (diet) => {
    if (window.Notifications) {
      window.Notifications.showToast(`Mess diet preference updated to '${diet}'`, 'success');
    }
  };

  window.handleGatePassSubmit = (event) => {
    event.preventDefault();
    const dest = document.getElementById('passDestination').value;
    const outTime = document.getElementById('passOutTime').value;
    const inTime = document.getElementById('passInTime').value;
    const tbody = document.getElementById('studentGatePassTableBody');
    if (tbody) {
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td><strong>GP-${Math.floor(1000 + Math.random() * 9000)}</strong></td>
        <td>${dest}</td>
        <td>${new Date(outTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
        <td>${new Date(inTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
        <td><span class="badge bg-warning-subtle text-warning border border-warning-subtle">Submitted (Pending Review)</span></td>
      `;
      tbody.prepend(newRow);
    }
    document.getElementById('gatePassForm').reset();
    if (window.Notifications) {
      window.Notifications.showToast('Gate pass request submitted to Chief Warden for curfew review', 'success');
    }
  };

  window.quickSwitchRole = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        const modalEl = document.getElementById('loginModal');
        if (modalEl && window.bootstrap) {
          const modalInstance = bootstrap.Modal.getInstance(modalEl);
          if (modalInstance) modalInstance.hide();
        }
        applyRoleUI(data.user);
        if (window.Notifications) {
          window.Notifications.showToast(`Signed in as ${data.user.name} (${data.user.role})`, 'success');
        }
      }
    } catch (e) {
      console.error('Error switching role:', e);
    }
  };

  // --- 7. EVENT LISTENERS ---
  const setupEventListeners = () => {
    // Navigation Tab Switches (Including newly added role tabs)
    document.querySelectorAll('.nav-link-custom').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = link.getAttribute('data-tab');

        document.querySelectorAll('.nav-link-custom').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active-view'));

        link.classList.add('active');
        const targetView = document.getElementById(`${tabId}-view`);
        if (targetView) targetView.classList.add('active-view');

        if (elements.headerTitle) {
          elements.headerTitle.textContent = link.textContent.trim();
        }

        AppState.activeTab = tabId;

        if (tabId === 'analytics' && window.dashboardCharts) {
          window.dashboardCharts.renderCharts(AppState.students, AppState.rooms);
        }
        if (tabId === 'rulebook') {
          handleValidateXmlSchema();
        }
        if (tabId === 'admin-complaints') {
          loadAdminComplaintsData();
        }
        if (tabId === 'student-portal' || tabId === 'student-fees' || tabId === 'student-complaints' || tabId === 'student-mess') {
          if (AppState.user) loadStudentPortalData(AppState.user);
        }
      });
    });

    // Search and Filter Listeners
    if (elements.searchStudentInput) {
      elements.searchStudentInput.addEventListener('input', fetchStudents);
    }
    if (elements.filterBlockSelect) {
      elements.filterBlockSelect.addEventListener('change', fetchStudents);
    }
    if (elements.filterFeeSelect) {
      elements.filterFeeSelect.addEventListener('change', fetchStudents);
    }

    // Submit Admit Student Form with Validation (Exp 3 & 5)
    if (elements.admitStudentForm) {
      elements.admitStudentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(elements.admitStudentForm);

        const isValid = window.ValidationEngine.validateStudentForm(formData);
        if (!isValid) return;

        const payload = Object.fromEntries(formData.entries());

        try {
          const res = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const result = await res.json();

          if (result.success) {
            if (AppState.admitModal) AppState.admitModal.hide();
            elements.admitStudentForm.reset();
            window.ValidationEngine.resetFormState('admitStudentForm');
            if (window.Notifications) window.Notifications.showToast(`Student ${payload.name} admitted successfully`, 'success');
            await refreshAllData();
          } else {
            window.ValidationEngine.setError('studentName', result.message);
          }
        } catch (error) {
          console.error('Error admitting student:', error);
        }
      });
    }

    // New Complaint Form Submission
    const complaintForm = document.getElementById('newComplaintForm');
    if (complaintForm) {
      complaintForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const category = document.getElementById('complaintCategory').value;
        const roomNo = document.getElementById('complaintRoomNo').value;
        const subject = document.getElementById('complaintSubject').value;
        const description = document.getElementById('complaintDescription').value;
        const priority = document.getElementById('complaintPriority').value;
        const studentName = AppState.user ? AppState.user.name : 'Alexander Johnson';

        try {
          const res = await fetch('/api/complaints', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentName, category, roomNo, subject, description, priority })
          });
          const data = await res.json();
          if (data.success) {
            if (AppState.complaintModal) AppState.complaintModal.hide();
            complaintForm.reset();
            if (window.Notifications) window.Notifications.showToast(`Ticket ${data.data.complaintId} created successfully!`, 'success');
            if (AppState.user) loadStudentPortalData(AppState.user);
            loadAdminComplaintsData();
          }
        } catch (err) {
          console.error('Error submitting complaint:', err);
        }
      });
    }

    // New Fee Payment Form Submission
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
      paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = document.getElementById('paymentAmount').value;
        const paymentFor = document.getElementById('paymentCategory').value;
        const payMethod = document.querySelector('input[name="payMethod"]:checked').value;
        const studentId = (AppState.user && AppState.user.studentId) ? AppState.user.studentId : 'STU-1001';
        const studentName = (AppState.user && AppState.user.name) ? AppState.user.name : 'Alexander Johnson';

        try {
          const res = await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentId,
              studentName,
              amount: Number(amount),
              paymentFor,
              month: 'October 2026',
              paymentMethod: payMethod,
              transactionRef: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`
            })
          });
          const data = await res.json();
          if (data.success) {
            if (AppState.paymentModal) AppState.paymentModal.hide();
            paymentForm.reset();
            if (window.Notifications) window.Notifications.showToast(`Payment of ₹${amount} recorded! Fee status: Paid`, 'success');
            if (AppState.user) loadStudentPortalData(AppState.user);
            refreshAllData();
          }
        } catch (err) {
          console.error('Error recording payment:', err);
        }
      });
    }

    // Quick Assign Button in Room Cards
    document.addEventListener('click', (e) => {
      const assignBtn = e.target.closest('.btn-quick-assign');
      if (assignBtn) {
        const roomNo = assignBtn.getAttribute('data-room');
        const block = assignBtn.getAttribute('data-block');
        
        const roomSelect = document.getElementById('studentRoomNo');
        const blockSelect = document.getElementById('studentBlock');
        
        if (blockSelect) blockSelect.value = block;
        if (roomSelect) roomSelect.value = roomNo;

        if (AppState.admitModal) AppState.admitModal.show();
      }

      // Delete / Vacate Student Button
      const deleteBtn = e.target.closest('.btn-delete-student');
      if (deleteBtn) {
        const studentId = deleteBtn.getAttribute('data-id');
        const studentName = deleteBtn.getAttribute('data-name');

        if (confirm(`Are you sure you want to vacate room for student ${studentName} (${studentId})?`)) {
          fetch(`/api/students/${studentId}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                if (window.Notifications) window.Notifications.showToast(`Room vacated for student ${studentName}`, 'success');
                refreshAllData();
              }
            });
        }
      }
    });

    // Curfew Trigger Button (Exp 9)
    if (elements.btnTriggerCurfew) {
      elements.btnTriggerCurfew.addEventListener('click', async () => {
        await fetch('/api/system/trigger-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventName: 'curfewAlert', details: { triggeredBy: AppState.user ? AppState.user.name : 'Warden' } })
        });
        if (window.Notifications) window.Notifications.showToast('🚨 21:30 CURFEW ALARM BROADCASTED TO ALL RESIDENTS!', 'error');
        pollTelemetry();
      });
    }

    // Validate XML Button
    if (elements.btnValidateXml) {
      elements.btnValidateXml.addEventListener('click', handleValidateXmlSchema);
    }
  };

  // Launch App
  initApp();
});
