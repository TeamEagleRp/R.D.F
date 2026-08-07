// R.D.F Dashboard App
document.addEventListener('DOMContentLoaded', async () => {
  // Check auth
  let user = null;
  let isAdmin = false;

  try {
    const res = await fetch('/api/user');
    const data = await res.json();
    user = data.user;
    isAdmin = data.isAdmin;
  } catch (err) {
    console.error('Auth check failed', err);
  }

  if (!user) {
    window.location.href = '/';
    return;
  }

  // Set user info
  document.getElementById('user-avatar').src = user.avatar;
  document.getElementById('user-name').textContent = user.global_name || user.username;

// If not admin, hide forms and admin nav link
  if (!isAdmin) {
    document.querySelectorAll('.admin-only').forEach((el) => el.classList.add('hidden'));
  } else {
    document.querySelectorAll('.admin-nav-link').forEach((el) => (el.style.display = ''));
  }

  // ---- Navigation ----
  const navLinks = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page');

  function showPage(pageName) {
    pages.forEach((page) => page.classList.remove('active'));
    document.getElementById(`page-${pageName}`).classList.add('active');

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.page === pageName);
    });
  }

navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(link.dataset.page);
if (link.dataset.page === 'members') {
        loadMembers();
        loadDutyStatus();
        loadDirectedStatus();
      }
if (link.dataset.page === 'admin') {
        loadAdminPanel();
      }
      if (link.dataset.page === 'log') {
        loadLog();
      }
    });
  });

  // ---- Load data ----
  async function loadSection() {
    const res = await fetch('/api/sector');
    const data = await res.json();
    renderSector(data.records);
  }

  async function loadVehicles() {
    const res = await fetch('/api/vehicles');
    const data = await res.json();
    renderVehicles(data.records);
  }

async function loadWanted() {
    const res = await fetch('/api/wanted');
    const data = await res.json();
    renderWanted(data.records);
  }

  async function loadMembers() {
    const list = document.getElementById('members-list');
    list.innerHTML = '<div class="empty-msg">جارٍ تحميل الأفراد...</div>';
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      renderMembers(data.members, data.botReady);
    } catch (err) {
      list.innerHTML = '<div class="empty-msg">تعذر تحميل الأفراد</div>';
    }
  }

// ---- Render functions ----
  const sectorList = document.getElementById('sector-list');
  const vehicleList = document.getElementById('vehicle-list');
  const wantedList = document.getElementById('wanted-list');

  // Show delete button only if user is admin and is the one who added the record
  function deleteBtn(type, r) {
    if (isAdmin && String(r.added_by_id) === String(user.id)) {
      return `<button class="delete-btn" data-type="${type}" data-id="${r.id}">حذف</button>`;
    }
    return '';
  }

  function renderSector(records) {
    if (!records.length) {
      sectorList.innerHTML = '<div class="empty-msg">لا توجد بيانات مضافة بعد</div>';
      return;
    }
    sectorList.innerHTML = records.map((r) => `
      <div class="record-card">
        <h3>${escapeHtml(r.name)}</h3>
        <p>الرتبة: <span class="record-value">${escapeHtml(r.rank)}</span></p>
        <div class="record-meta">أضيف بواسطة: ${escapeHtml(r.added_by || '')}</div>
        ${deleteBtn('sector', r)}
      </div>
    `).join('');
  }

  function renderVehicles(records) {
    if (!records.length) {
      vehicleList.innerHTML = '<div class="empty-msg">لا توجد مركبات مضافة بعد</div>';
      return;
    }
    vehicleList.innerHTML = records.map((r) => `
      <div class="record-card">
        ${r.photo ? `<img src="${r.photo}" alt="${escapeHtml(r.name)}" class="record-photo">` : ''}
        <h3>${escapeHtml(r.name)}</h3>
        <p>اللون: <span class="record-value">${escapeHtml(r.color)}</span></p>
        <div class="record-meta">أضيف بواسطة: ${escapeHtml(r.added_by || '')}</div>
        ${deleteBtn('vehicle', r)}
      </div>
    `).join('');
  }

  function renderWanted(records) {
    if (!records.length) {
      wantedList.innerHTML = '<div class="empty-msg">لا يوجد مطلوبون بعد</div>';
      return;
    }
    const dangerClass = {
      'قصوى': 'danger-quswa',
      'متوسطة': 'danger-mutawassita',
      'خفيفة': 'danger-khafifa',
    };
    wantedList.innerHTML = records.map((r) => `
      <div class="record-card">
        ${r.photo ? `<img src="${r.photo}" alt="${escapeHtml(r.name)}" class="record-photo">` : ''}
        <h3>${escapeHtml(r.name)}</h3>
        <p>التهمة: <span class="record-value">${escapeHtml(r.charge)}</span></p>
        <span class="danger ${dangerClass[r.danger] || ''}">${escapeHtml(r.danger)}</span>
        <div class="record-meta">أضيف بواسطة: ${escapeHtml(r.added_by || '')}</div>
        ${deleteBtn('wanted', r)}
      </div>
    `).join('');
  }

function renderMembers(members, botReady) {
    const list = document.getElementById('members-list');
    if (!botReady) {
      list.innerHTML = '<div class="empty-msg">البوت غير متصل حالياً. سيتم التحديث تلقائياً...</div>';
      return;
    }
    if (!members.length) {
      list.innerHTML = '<div class="empty-msg">لا يوجد أفراد بهذه الرتبة حالياً</div>';
      return;
    }

    const online = members.filter(m => m.isOnline);
    const offline = members.filter(m => !m.isOnline);

    const renderCard = (m) => {
      // Duty status: on duty if online AND onDuty, else off duty
      const onDuty = m.isOnline && m.isOnDuty;
      return `
      <div class="record-card member-card ${m.isOnline ? 'member-online' : 'member-offline'}">
        <div class="member-avatar-wrap ${m.isOnline ? 'online-glow' : ''}">
          <img src="${m.avatar}" alt="${m.displayName}" class="member-avatar">
          <span class="member-status-dot ${m.isOnline ? 'online' : 'offline'}"></span>
        </div>
        <div class="member-info">
          <h3>${m.displayName}</h3>
          <span class="status ${m.isOnline ? 'online' : 'offline'}">
            ${m.isOnline ? 'متصل الآن' : 'غير متصل'}
          </span>
          ${m.isOnline ? `
            <div class="duty-badge ${onDuty ? 'on-duty' : 'off-duty'}">
              ${onDuty ? 'بالخدمة' : 'خارج الخدمة'}
            </div>
          ` : ''}
        </div>
      </div>
    `;
    };

    let html = '';

    // Online section with divider line
    if (online.length > 0) {
      html += `
        <div class="divider-line"><span>متصل</span></div>
        <div class="records-list">
          ${online.map(renderCard).join('')}
        </div>
      `;
    }

    // Offline section with divider line
    if (offline.length > 0) {
      html += `
        <div class="divider-line" style="margin-top:40px;"><span>غير متصل</span></div>
        <div class="records-list">
          ${offline.map(renderCard).join('')}
        </div>
      `;
    }

    list.innerHTML = html;
  }

  // ---- Duty (تسجيل دخول للخدمة) ----
  let currentUserOnDuty = false;

async function loadDutyStatus() {
    try {
      const res = await fetch('/api/duty/me');
      const data = await res.json();
      currentUserOnDuty = data.isOnDuty;
      const statusEl = document.getElementById('duty-status');
      const btn = document.getElementById('duty-button');
      if (!statusEl || !btn) return;
      // Only show duty login for members who have the "الأفراد" role
      if (!data.hasRole) {
        document.getElementById('duty-section').style.display = 'none';
        return;
      }
      document.getElementById('duty-section').style.display = '';
      if (currentUserOnDuty) {
        statusEl.textContent = 'أنت مسجل دخول بالخدمة الآن ✅';
        statusEl.className = 'status-badge on-duty';
        btn.textContent = 'خروج من الخدمة';
        btn.className = 'btn-add danger-btn';
      } else {
        statusEl.textContent = 'أنت خارج الخدمة حالياً';
        statusEl.className = 'status-badge off-duty';
        btn.textContent = 'تسجيل دخول للخدمة';
        btn.className = 'btn-add';
      }
      btn.style.display = '';
    } catch (err) {
      const statusEl = document.getElementById('duty-status');
      if (statusEl) statusEl.textContent = 'تعذر تحميل حالة الخدمة';
    }
  }

const dutyBtn = document.getElementById('duty-button');
  if (dutyBtn) {
    dutyBtn.addEventListener('click', async () => {
      const endpoint = currentUserOnDuty ? '/api/duty/logout' : '/api/duty/login';
      const res = await fetch(endpoint, { method: 'POST' });
      if (res.ok) {
        await loadDutyStatus();
        loadMembers();
      } else {
        const d = await res.json();
        alert(d.error || 'فشل العملية');
      }
    });
  }

  // ---- Directed voice (دخول موجه) ----
  let currentDirectedNumber = null;

  async function loadDirectedStatus() {
    try {
      const res = await fetch('/api/directed/me');
      const data = await res.json();
      currentDirectedNumber = data.inDirected ? data.number : null;
      const section = document.getElementById('directed-section');
      const statusEl = document.getElementById('directed-status');
      const btn = document.getElementById('directed-button');
      const input = document.getElementById('directed-number');
      if (!section || !statusEl || !btn || !input) return;

      // Only show directed voice for members with the الأفراد role
      if (!data.hasRole) {
        section.style.display = 'none';
        return;
      }
      section.style.display = '';

if (currentDirectedNumber !== null) {
        statusEl.textContent = `أنت داخل الموجه ${currentDirectedNumber} الآن 🎙️`;
        statusEl.className = 'status-badge on-duty';
        btn.textContent = 'خروج من الموجه';
        btn.className = 'btn-add danger-btn';
        input.style.display = 'none';
      } else {
        statusEl.textContent = 'أنت خارج الموجه حالياً';
        statusEl.className = 'status-badge off-duty';
        btn.textContent = 'دخول موجه';
        btn.className = 'btn-add';
        input.style.display = '';
      }
    } catch (err) {
      const statusEl = document.getElementById('directed-status');
      if (statusEl) statusEl.textContent = 'تعذر تحميل حالة الموجه';
    }
  }

  const directedBtn = document.getElementById('directed-button');
  if (directedBtn) {
    directedBtn.addEventListener('click', async () => {
      if (currentDirectedNumber !== null) {
        // Leave directed voice
        const res = await fetch('/api/directed/leave', { method: 'POST' });
if (res.ok) {
          await loadDirectedStatus();
        } else {
          const d = await res.json();
          alert(d.error || 'فشل الخروج من الموجه');
        }
        return;
      }

      const input = document.getElementById('directed-number');
      const raw = input.value.trim();
      if (!raw) {
        alert('الرجاء إدخال رقم الموجه');
        return;
      }
      const n = parseFloat(raw);
      if (isNaN(n) || n < 1 || n > 100) {
        alert('الرجاء إدخال رقم بين 1 و 100');
        return;
      }

      const res = await fetch('/api/directed/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: n }),
      });
      if (res.ok) {
        const d = await res.json();
alert(`تم نقلك إلى الموجه ${d.number} 🎙️`);
        input.value = '';
        await loadDirectedStatus();
      } else {
        const d = await res.json();
        alert(d.error || 'فشل الدخول الموجه');
      }
    });
  }

  // Refresh members every 30 seconds
  setInterval(() => {
    if (document.getElementById('page-members').classList.contains('active')) {
      loadMembers();
    }
  }, 30000);

  // ---- Delete handler (event delegation) ----
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.delete-btn');
    if (!btn) return;
    if (!confirm('هل أنت متأكد أنك تريد حذف هذا السجل؟')) return;

    const type = btn.dataset.type;
    const id = btn.dataset.id;
    const res = await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (type === 'sector') loadSection();
      else if (type === 'vehicle') loadVehicles();
      else if (type === 'wanted') loadWanted();
    } else {
      const d = await res.json();
      alert(d.error || 'فشل الحذف');
    }
  });

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '<', '>': '>', '"': '"', "'": '&#039;',
    }[c]));
  }

  // ---- Form submissions ----
  const sectorForm = document.getElementById('sector-form');
  sectorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('sector-name').value.trim();
    const rank = document.getElementById('sector-rank').value.trim();
    if (!name || !rank) return;
    const res = await fetch('/api/sector', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, rank }),
    });
    if (res.ok) {
      sectorForm.reset();
      loadSection();
    } else {
      const d = await res.json();
      alert(d.error || 'فشل الإضافة');
    }
  });

  const vehicleForm = document.getElementById('vehicle-form');
  vehicleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', document.getElementById('vehicle-name').value.trim());
    fd.append('color', document.getElementById('vehicle-color').value.trim());
    const photo = document.getElementById('vehicle-photo').files[0];
    if (photo) fd.append('photo', photo);

    const res = await fetch('/api/vehicles', { method: 'POST', body: fd });
    if (res.ok) {
      vehicleForm.reset();
      loadVehicles();
    } else {
      const d = await res.json();
      alert(d.error || 'فشل الإضافة');
    }
  });

  const wantedForm = document.getElementById('wanted-form');
  wantedForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', document.getElementById('wanted-name').value.trim());
    fd.append('charge', document.getElementById('wanted-charge').value.trim());
    fd.append('danger', document.getElementById('wanted-danger').value);
    const photo = document.getElementById('wanted-photo').files[0];
    if (photo) fd.append('photo', photo);

    const res = await fetch('/api/wanted', { method: 'POST', body: fd });
    if (res.ok) {
      wantedForm.reset();
      loadWanted();
    } else {
      const d = await res.json();
      alert(d.error || 'فشل الإضافة');
    }
  });

// ---- Admin Panel ----
let adminRanks = [];
let guildMembersList = [];

  async function loadAdminPanel() {
    try {
      // Load sector members + render
      await loadAdminMembers();
    } catch (err) {
      console.error('Admin panel load error:', err);
    }
  }

  async function loadAdminMembers() {
    try {
      const res = await fetch('/api/admin/members');
      const data = await res.json();
      renderAdminMembers(data.members || []);
    } catch (err) {
      document.getElementById('admin-members-list').innerHTML = '<div class="empty-msg">تعذر تحميل الأفراد</div>';
    }
  }

  function renderAdminMembers(members) {
    const list = document.getElementById('admin-members-list');
    if (!members.length) {
      list.innerHTML = '<div class="empty-msg">لا يوجد أفراد في القطاع بعد</div>';
      return;
    }
    list.innerHTML = members.map((m) => `
      <div class="record-card admin-member-card">
        <h3>${escapeHtml(m.name)}</h3>
        <p>الرتبة: <span class="record-value">${escapeHtml(m.rank)}</span></p>
<div class="warning-info">
          <span class="warn-count ${m.warningCount >= m.maxWarnings ? 'warn-max' : ''}">
            التحذيرات: ${m.warningCount} / ${m.maxWarnings}
          </span>
          <span class="warn-status ${m.warningCount >= m.maxWarnings ? 'warn-danger' : (m.warningCount >= m.maxWarnings - 1 ? 'warn-warning' : '')}">
            ${m.warningCount >= m.maxWarnings ? 'جاهز للفصل' : (m.warningCount >= m.maxWarnings - 1 ? 'مهدد بالفصل' : '')}
          </span>
        </div>
        ${m.warnings && m.warnings.length ? `<ul class="warn-list">${m.warnings.map((w) => `<li>${escapeHtml(w.reason)} <button class="mini-btn remove-warn" onclick="removeWarning('${w.id}')">✕ إزالة</button></li>`).join('')}</ul>` : ''}
        <div class="admin-actions">
          <button class="action-btn promote" onclick="promoteMember('${m.id}')">▲ ترقية</button>
          <button class="action-btn demote" onclick="demoteMember('${m.id}')">▼ تنزيل</button>
          <button class="action-btn warn" onclick="addWarning('${m.id}')">⚠ إضافة تحذير</button>
          <button class="action-btn removewarn" onclick="removeLastWarning('${m.id}', '${m.warnings && m.warnings.length ? m.warnings[m.warnings.length - 1].id : ''}')" ${m.warnings && m.warnings.length ? '' : 'disabled'}>✅ إزالة تحذير</button>
          ${m.warningCount >= m.maxWarnings ? '<button class="action-btn dismiss" onclick="dismissMember(\'' + m.id + '\')">🚫 فصل الفرد</button>' : ''}
        </div>
      </div>
    `).join('');
  }

// ---- Log (سجل الحركات) ----
  let currentLogFilter = 'all';
  let allLogs = [];

  // Map a log action string to a sidebar category
  function logCategory(action) {
    const a = action || '';
    if (a.includes('قطاع')) return 'sector';
    if (a.includes('مركبة')) return 'vehicles';
    if (a.includes('مطلوب')) return 'wanted';
    // Everything else (member actions) belongs to admin panel
    return 'admin';
  }

  async function loadLog() {
    const list = document.getElementById('log-list');
    list.innerHTML = '<div class="empty-msg">جارٍ تحميل السجل...</div>';
    try {
      const res = await fetch('/api/log');
      const data = await res.json();
      allLogs = data.logs || [];
      renderLog();
    } catch (err) {
      list.innerHTML = '<div class="empty-msg">تعذر تحميل السجل</div>';
    }
  }

  function renderLog() {
    const list = document.getElementById('log-list');
    if (!allLogs.length) {
      list.innerHTML = '<div class="empty-msg">لا توجد حركات مسجلة بعد</div>';
      return;
    }

    const filtered = currentLogFilter === 'all'
      ? allLogs
      : allLogs.filter((l) => logCategory(l.action) === currentLogFilter);

    if (!filtered.length) {
      list.innerHTML = '<div class="empty-msg">لا توجد حركات في هذا القسم بعد</div>';
      return;
    }

    list.innerHTML = filtered.map((l) => `
      <div class="log-item">
        <span class="log-action">${escapeHtml(l.action)}</span>
        <span class="log-detail">${escapeHtml(l.details || '')}</span>
        <span class="log-target">${escapeHtml(l.target_name || '')}</span>
        <span class="log-by">بواسطة: ${escapeHtml(l.admin_name || l.admin_id || '')}</span>
        <span class="log-time">${new Date(l.createdAt).toLocaleString('ar')}</span>
      </div>
    `).join('');
  }

  // Sidebar filter buttons
  const logSidebarBtns = document.querySelectorAll('.log-sidebar-btn');
  logSidebarBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      logSidebarBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentLogFilter = btn.dataset.logFilter;
      renderLog();
    });
  });

  // ---- Global admin action functions (used by onclick) ----
  window.promoteMember = async function (id) {
    const res = await fetch(`/api/admin/members/${id}/promote`, { method: 'POST' });
    if (res.ok) { loadAdminMembers(); }
    else { const d = await res.json(); alert(d.error || 'فشل الترقية'); }
  };

  window.demoteMember = async function (id) {
    const res = await fetch(`/api/admin/members/${id}/demote`, { method: 'POST' });
    if (res.ok) { loadAdminMembers(); }
    else { const d = await res.json(); alert(d.error || 'فشل التنزيل'); }
  };

  window.addWarning = async function (id) {
    const reason = prompt('سبب التحذير:');
    if (!reason) return;
    const res = await fetch('/api/admin/warnings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: id, reason }),
    });
if (res.ok) {
      const d = await res.json();
      loadAdminMembers();
      loadMembers();
      if (d.removeReady) {
        alert('وصل العضو إلى الحد الأقصى من التحذيرات (3/3). اضغط على زر "فصل الفرد" لفصله من القطاع. 🚫');
      } else if (d.threatened) {
        alert('تنبيه: أصبح العضو "مهدد بالفصل" عند تحذير واحد إضافي. ⚠️');
      }
    }
    else { const d = await res.json(); alert(d.error || 'فشل إضافة التحذير'); }
  };

  window.removeWarning = async function (id) {
    const res = await fetch(`/api/admin/warnings/${id}`, { method: 'DELETE' });
    if (res.ok) { loadAdminMembers(); }
    else { const d = await res.json(); alert(d.error || 'فشل حذف التحذير'); }
  };

// Remove the latest (last) warning of a member
  window.removeLastWarning = async function (memberId, warningId) {
    if (!warningId) {
      alert('لا يوجد تحذيرات لإزالتها لهذا العضو');
      return;
    }
    const res = await fetch(`/api/admin/warnings/${warningId}`, { method: 'DELETE' });
    if (res.ok) { loadAdminMembers(); }
    else { const d = await res.json(); alert(d.error || 'فشل إزالة التحذير'); }
  };

  // Dismiss (فصل) a member - removes them from the sector
  window.dismissMember = async function (id) {
    if (!confirm('هل أنت متأكد أنك تريد فصل هذا الفرد من القطاع؟ سيتم إزالة رتبته من الديسكورد.')) return;
    const res = await fetch(`/api/admin/members/${id}/dismiss`, { method: 'POST' });
    if (res.ok) {
      alert('تم فصل الفرد من القطاع بنجاح 🚫');
      loadAdminMembers();
      loadMembers();
    } else {
      const d = await res.json();
      alert(d.error || 'فشل فصل الفرد');
    }
  };

// ---- Initial load ----
  showPage('home');
  loadSection();
  loadVehicles();
  loadWanted();
  loadMembers();
  loadDutyStatus();
  loadDirectedStatus();
});
