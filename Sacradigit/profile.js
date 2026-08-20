/* ============================================
   SacraDigit Admin — My Profile Scripts
   Runs after dashboard.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------
     0. SAMPLE ADMIN ACCOUNT DATA
  ------------------------------------------ */
  const STORED_PASSWORD = 'admin123'; // demo-only "current" password

  const notifTypes = [
    { id: 'record-requests', label: 'New Record Requests', desc: 'A parishioner submits a certificate request.', icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`, enabled: true },
    { id: 'schedule-offers', label: 'New Schedule / Service Offers', desc: 'A parishioner requests a sacrament or blessing.', icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`, enabled: true },
    { id: 'facility-booking', label: 'New Facility Bookings', desc: 'A parishioner books a parish facility.', icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`, enabled: true },
    { id: 'donations', label: 'New Donations', desc: 'An online donation is received.', icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m9-8a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`, enabled: false },
    { id: 'mass-intentions', label: 'New Mass Intentions', desc: 'A parishioner submits a mass intention.', icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 7h6m-6 4h6m-6 4h4M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`, enabled: false },
    { id: 'storage', label: 'Low Cloud Storage Warnings', desc: 'Archive storage is nearing its quota.', icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 15a4 4 0 004 4h9a5 5 0 001-9.9 5.5 5.5 0 00-10.6-1.4A4.5 4.5 0 003 15z"/></svg>`, enabled: true },
    { id: 'weekly-summary', label: 'Weekly Summary Email', desc: 'A digest of parish activity every Monday.', icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`, enabled: true },
  ];

  const activityLog = [
    { type: 'Login',  title: 'Logged in',                                    meta: 'Chrome on Windows · IP 203.177.42.18', date: '2026-06-19 08:02 AM' },
    { type: 'Action', title: 'Approved Record Request — Reyes, Carmen',       meta: 'Record Requests',                       date: '2026-06-19 09:14 AM' },
    { type: 'Action', title: 'Approved Baptism — Santos Family',              meta: 'Schedule Offers',                       date: '2026-06-19 09:45 AM' },
    { type: 'Action', title: 'Rejected Business Dedication — Torres, Manuel', meta: 'Schedule Offers',                       date: '2026-06-18 03:20 PM' },
    { type: 'Login',  title: 'Logged in',                                    meta: 'Chrome on Windows · IP 203.177.42.18', date: '2026-06-18 07:51 AM' },
    { type: 'Action', title: 'Updated Special Schedule — Holy Week 2026',     meta: 'Special Schedules',                     date: '2026-06-17 11:05 AM' },
    { type: 'Action', title: 'Uploaded 3 files to Digital Archives',          meta: 'Digital Archives',                      date: '2026-06-17 10:40 AM' },
    { type: 'Login',  title: 'Logged in',                                    meta: 'Safari on macOS · IP 112.198.90.4',    date: '2026-06-17 07:45 AM' },
    { type: 'Action', title: 'Confirmed Facility Booking — Youth Ministry',   meta: 'Facility Booking',                      date: '2026-06-16 02:12 PM' },
    { type: 'Login',  title: 'Logged in',                                    meta: 'Chrome on Windows · IP 203.177.42.18', date: '2026-06-16 07:38 AM' },
  ];


  /* ------------------------------------------
     1. DOM REFERENCES
  ------------------------------------------ */
  const avatarLg          = document.getElementById('avatar-lg');
  const sidebarInitials     = document.getElementById('sidebar-avatar-initials');
  const headerName            = document.getElementById('header-name');
  const headerEmail             = document.getElementById('header-email');
  const sidebarAdminName          = document.getElementById('sidebar-admin-name');

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function setFieldError(input, message) {
    input.classList.add('has-error');
    let msg = input.parentElement.querySelector('.form-error-msg');
    if (!msg) {
      msg = document.createElement('p');
      msg.className = 'form-error-msg';
      input.insertAdjacentElement('afterend', msg);
    }
    msg.textContent = message;
  }

  function clearFieldError(input) {
    input.classList.remove('has-error');
    const msg = input.parentElement.querySelector('.form-error-msg');
    if (msg) msg.remove();
  }

  function initialsFrom(name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }


  /* ------------------------------------------
     2. TABS
  ------------------------------------------ */
  const tabs   = document.querySelectorAll('.profile-tab');
  const panels = document.querySelectorAll('.profile-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
    });
  });


  /* ------------------------------------------
     3. CHANGE PHOTO
  ------------------------------------------ */
  const photoInput = document.getElementById('photo-input');

  document.getElementById('btn-change-photo').addEventListener('click', () => photoInput.click());

  photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image file.', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      avatarLg.style.backgroundImage = `url(${e.target.result})`;
      avatarLg.textContent = '';
      showToast('Profile photo updated.');
    };
    reader.readAsDataURL(file);
  });


  /* ------------------------------------------
     4. PROFILE INFO — save / reset
  ------------------------------------------ */
  const pfName       = document.getElementById('pf-name');
  const pfEmail        = document.getElementById('pf-email');
  const pfPhone          = document.getElementById('pf-phone');
  const pfDepartment        = document.getElementById('pf-department');
  const pfBio                  = document.getElementById('pf-bio');

  const defaults = {
    name: pfName.value, email: pfEmail.value, phone: pfPhone.value,
    department: pfDepartment.value, bio: pfBio.value,
  };

  [pfName, pfEmail, pfPhone, pfDepartment].forEach(input => {
    input.addEventListener('input', () => clearFieldError(input));
  });

  document.getElementById('pf-save').addEventListener('click', () => {
    let hasError = false;

    clearFieldError(pfName);
    if (!pfName.value.trim()) { setFieldError(pfName, 'Full name is required.'); hasError = true; }

    clearFieldError(pfEmail);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pfEmail.value.trim()) {
      setFieldError(pfEmail, 'Email address is required.');
      hasError = true;
    } else if (!emailPattern.test(pfEmail.value.trim())) {
      setFieldError(pfEmail, 'Enter a valid email address.');
      hasError = true;
    }

    if (hasError) {
      showToast('Please fix the highlighted fields.', true);
      return;
    }

    headerName.textContent = pfName.value.trim();
    headerEmail.textContent = pfEmail.value.trim();
    sidebarAdminName.textContent = pfName.value.trim();

    const initials = initialsFrom(pfName.value.trim());
    sidebarInitials.textContent = initials;
    if (!avatarLg.style.backgroundImage) avatarLg.textContent = initials;

    showToast('Profile information saved.');
  });

  document.getElementById('pf-reset').addEventListener('click', () => {
    pfName.value = defaults.name;
    pfEmail.value = defaults.email;
    pfPhone.value = defaults.phone;
    pfDepartment.value = defaults.department;
    pfBio.value = defaults.bio;
    [pfName, pfEmail, pfPhone, pfDepartment].forEach(clearFieldError);
    showToast('Changes discarded.');
  });


  /* ------------------------------------------
     5. SECURITY — password strength + change
  ------------------------------------------ */
  const pwCurrent      = document.getElementById('pw-current');
  const pwNew            = document.getElementById('pw-new');
  const pwConfirm           = document.getElementById('pw-confirm');
  const pwStrengthFill        = document.getElementById('pw-strength-fill');
  const pwStrengthLabel          = document.getElementById('pw-strength-label');

  [pwCurrent, pwNew, pwConfirm].forEach(input => {
    input.addEventListener('input', () => clearFieldError(input));
  });

  function passwordStrength(pw) {
    if (!pw) return { level: '', label: 'Password strength', pct: 0 };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { level: 'weak', label: 'Weak password', pct: 30 };
    if (score <= 3) return { level: 'fair', label: 'Fair password', pct: 65 };
    return { level: 'strong', label: 'Strong password', pct: 100 };
  }

  pwNew.addEventListener('input', () => {
    const s = passwordStrength(pwNew.value);
    pwStrengthFill.className = `pw-strength-fill ${s.level}`;
    pwStrengthFill.style.width = `${s.pct}%`;
    pwStrengthLabel.className = `pw-strength-label ${s.level}`;
    pwStrengthLabel.textContent = s.label;
  });

  document.getElementById('pw-submit').addEventListener('click', () => {
    let hasError = false;
    [pwCurrent, pwNew, pwConfirm].forEach(clearFieldError);

    if (!pwCurrent.value) {
      setFieldError(pwCurrent, 'Enter your current password.');
      hasError = true;
    } else if (pwCurrent.value !== STORED_PASSWORD) {
      setFieldError(pwCurrent, 'Current password is incorrect.');
      hasError = true;
    }

    if (!pwNew.value) {
      setFieldError(pwNew, 'Enter a new password.');
      hasError = true;
    } else if (pwNew.value.length < 8) {
      setFieldError(pwNew, 'New password must be at least 8 characters.');
      hasError = true;
    } else if (pwNew.value === pwCurrent.value) {
      setFieldError(pwNew, 'New password must be different from the current one.');
      hasError = true;
    }

    if (!pwConfirm.value) {
      setFieldError(pwConfirm, 'Please confirm your new password.');
      hasError = true;
    } else if (pwConfirm.value !== pwNew.value) {
      setFieldError(pwConfirm, 'Passwords do not match.');
      hasError = true;
    }

    if (hasError) {
      showToast('Please fix the highlighted fields.', true);
      return;
    }

    pwCurrent.value = '';
    pwNew.value = '';
    pwConfirm.value = '';
    pwStrengthFill.className = 'pw-strength-fill';
    pwStrengthFill.style.width = '0%';
    pwStrengthLabel.className = 'pw-strength-label';
    pwStrengthLabel.textContent = 'Password strength';

    showToast('Your password has been updated.');
  });


  /* ------------------------------------------
     6. TWO-FACTOR AUTHENTICATION TOGGLE
  ------------------------------------------ */
  const twofaToggle = document.getElementById('twofa-toggle');
  const twofaStatus = document.getElementById('twofa-status');

  twofaToggle.addEventListener('change', () => {
    if (twofaToggle.checked) {
      twofaStatus.textContent = 'On';
      twofaStatus.className = 'twofa-status on';
      showToast('Two-factor authentication enabled.');
    } else {
      twofaStatus.textContent = 'Off';
      twofaStatus.className = 'twofa-status off';
      showToast('Two-factor authentication disabled.');
    }
  });


  /* ------------------------------------------
     7. NOTIFICATION PREFERENCES
  ------------------------------------------ */
  const notifList = document.getElementById('notif-list');

  notifList.innerHTML = notifTypes.map(n => `
    <div class="notif-row">
      <div class="flex items-center gap-3 min-w-0">
        <div class="notif-row-icon">${n.icon}</div>
        <div class="min-w-0">
          <p class="notif-row-title">${escapeHtml(n.label)}</p>
          <p class="notif-row-desc">${escapeHtml(n.desc)}</p>
        </div>
      </div>
      <label class="toggle-switch shrink-0" aria-label="Toggle ${escapeHtml(n.label)}">
        <input type="checkbox" data-id="${n.id}" ${n.enabled ? 'checked' : ''} />
        <span class="toggle-slider"></span>
      </label>
    </div>
  `).join('');

  notifList.addEventListener('change', (e) => {
    const input = e.target.closest('input[type="checkbox"]');
    if (!input) return;
    const notif = notifTypes.find(n => n.id === input.dataset.id);
    if (!notif) return;
    notif.enabled = input.checked;
    showToast(`${notif.label} notifications ${input.checked ? 'enabled' : 'disabled'}.`);
  });


  /* ------------------------------------------
     8. ACTIVITY LOG
  ------------------------------------------ */
  const activityList    = document.getElementById('activity-list');
  const activityFilter    = document.getElementById('activity-filter');

  function activityIcon(type) {
    if (type === 'Login') {
      return { bg: 'rgba(139,143,199,0.16)', color: '#5b5fa8', svg: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M11 16l-4-4m0 0l4-4m-4 4h11m0-9h1a2 2 0 012 2v10a2 2 0 01-2 2h-1"/></svg>` };
    }
    return { bg: 'rgba(201,168,76,0.18)', color: '#9c7d2e', svg: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 13l4 4L19 7"/></svg>` };
  }

  function renderActivity() {
    const filterVal = activityFilter.value;
    const filtered = filterVal ? activityLog.filter(a => a.type === filterVal) : activityLog;

    activityList.innerHTML = filtered.map(a => {
      const icon = activityIcon(a.type);
      return `
        <div class="activity-item">
          <div class="activity-icon" style="background-color:${icon.bg};color:${icon.color};">${icon.svg}</div>
          <div class="activity-body">
            <p class="activity-title">${escapeHtml(a.title)}</p>
            <p class="activity-meta">${escapeHtml(a.meta)} · ${escapeHtml(a.date)}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  activityFilter.addEventListener('change', renderActivity);
  renderActivity();

  document.getElementById('btn-export-activity').addEventListener('click', () => {
    const rows = [['Type', 'Title', 'Detail', 'Date'], ...activityLog.map(a => [a.type, a.title, a.meta, a.date])];
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activity-log.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Activity log exported.');
  });


  /* ------------------------------------------
     9. TOAST
  ------------------------------------------ */
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message, isError = false) {
    clearTimeout(toastTimer);
    toast.querySelector('.toast-message').textContent = message;
    toast.style.backgroundColor = isError ? '#b91c1c' : '#1e2a4a';
    toast.classList.remove('hidden');
    requestAnimationFrame(() => toast.classList.add('show'));
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 200);
    }, 3000);
  }

});