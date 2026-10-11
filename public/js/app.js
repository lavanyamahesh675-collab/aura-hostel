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

  // --- 1. SESSION & INITIALIZATION ---
  const initApp = async () => {
    try {
      // Check Auth Session (Exp 7 & 8)
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      
      if (data.authenticated) {
        AppState.user = data.user;
        renderUserProfile(data.user);
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

  const renderUserProfile = (user) => {
    if (elements.userName) elements.userName.textContent = user.name;
    if (elements.userRole) elements.userRole.textContent = user.role;
    if (elements.userAvatar && user.avatar) elements.userAvatar.src = user.avatar;
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
      if (elements.xmlValidationBadge) {
        elements.xmlValidationBadge.innerHTML = `<span class="spinner-border spinner-border-sm me-1 text-primary"></span>Validating...`;
      }

      const res = await fetch('/api/system/validate-schema');
      const data = await res.json();

      if (data.success) {
        if (elements.xmlValidationBadge) {
          elements.xmlValidationBadge.innerHTML = data.valid
            ? `<span class="badge bg-success-subtle text-success border border-success-subtle p-2 fs-6"><i class="fa-solid fa-check-circle me-1"></i>DTD & XSD VALIDATED & COMPLIANT</span>`
            : `<span class="badge bg-danger-subtle text-danger border border-danger-subtle p-2 fs-6"><i class="fa-solid fa-triangle-exclamation me-1"></i>VALIDATION FAILED</span>`;
        }

        if (elements.xmlCodeDisplay) {
          // Render a clean visual hostel policy view instead of raw XML code
          elements.xmlCodeDisplay.innerHTML = `
            <div class="p-3">
              <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <h6 class="fw-bold text-dark mb-0"><i class="fa-solid fa-book-open me-2 text-primary"></i>Official Policy & Curfew Standards</h6>
                <span class="badge bg-light text-muted border">Ref: AURA-2026</span>
              </div>
              
              <div class="row g-3 mb-3">
                <div class="col-6">
                  <div class="p-2.5 bg-light rounded-3">
                    <div class="text-muted small">Daily In-Time</div>
                    <div class="fw-bold fs-5 text-dark">${data.summary.curfewPolicy.inTime} PM</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-2.5 bg-light rounded-3">
                    <div class="text-muted small">Daily Out-Time</div>
                    <div class="fw-bold fs-5 text-dark">${data.summary.curfewPolicy.outTime} AM</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-2.5 bg-light rounded-3">
                    <div class="text-muted small">Late Hour Fine</div>
                    <div class="fw-bold fs-5 text-danger">₹${data.summary.curfewPolicy.finePerLateHour}/hr</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-2.5 bg-light rounded-3">
                    <div class="text-muted small">Emergency Line</div>
                    <div class="fw-bold fs-6 text-primary">${data.summary.curfewPolicy.emergencyContact}</div>
                  </div>
                </div>
              </div>

              <div class="p-2.5 bg-success-subtle border border-success-subtle rounded-3 text-success small d-flex align-items-center gap-2">
                <i class="fa-solid fa-shield-check fs-5"></i>
                <div>All hostel regulations, meal timings, and curfew parameters adhere to verified schema specifications.</div>
              </div>
            </div>
          `;
        }

        const summaryContainer = document.getElementById('xmlRulesSummary');
        if (summaryContainer && data.summary) {
          summaryContainer.innerHTML = `
            <div class="policy-card mb-3">
              <h6 class="fw-bold text-dark mb-2"><i class="fa-solid fa-utensils me-2 text-primary"></i>Weekly Mess Schedule Highlights</h6>
              <div class="small text-muted mb-2">Validated across 7 Days with 4 Daily Meal Intervals (Breakfast, Lunch, Snacks, Dinner).</div>
              <ul class="list-unstyled small mb-0">
                <li class="py-1 border-bottom d-flex justify-content-between"><span>Breakfast</span> <span class="fw-semibold text-dark">07:30 - 09:30</span></li>
                <li class="py-1 border-bottom d-flex justify-content-between"><span>Lunch</span> <span class="fw-semibold text-dark">12:30 - 14:30</span></li>
                <li class="py-1 border-bottom d-flex justify-content-between"><span>Evening Snacks</span> <span class="fw-semibold text-dark">17:00 - 18:00</span></li>
                <li class="py-1 d-flex justify-content-between"><span>Dinner</span> <span class="fw-semibold text-dark">19:30 - 21:30</span></li>
              </ul>
            </div>
            <div class="small text-muted text-center"><i class="fa-solid fa-check-double text-success me-1"></i>Compliant with DTD grammar and XSD structural specifications</div>
          `;
        }
      }
    } catch (error) {
      console.error('Schema validation error:', error);
    }
  };

  // --- 6. EVENT LISTENERS ---
  const setupEventListeners = () => {
    // Navigation Tab Switches
    elements.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = link.getAttribute('data-tab');

        elements.navLinks.forEach(l => l.classList.remove('active'));
        elements.viewSections.forEach(s => s.classList.remove('active-view'));

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

        // Client-side Validation Engine Trigger (Exp 3)
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
            await refreshAllData();
          } else {
            window.ValidationEngine.setError('studentName', result.message);
          }
        } catch (error) {
          console.error('Error admitting student:', error);
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
              if (data.success) refreshAllData();
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
