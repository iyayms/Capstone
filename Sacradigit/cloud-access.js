/* ============================================
   SacraDigit Admin — Cloud Access Scripts
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------
     0. SAMPLE DATA
     In production these would come from the
     Firebase Admin SDK / monitoring endpoints.
  ------------------------------------------ */

  const services = [
    { name: 'Firestore',  status: 'ok',   label: 'Operational', meta: '42ms avg latency' },
    { name: 'Auth',       status: 'ok',   label: 'Operational', meta: '128 active sessions' },
    { name: 'Storage',    status: 'ok',   label: 'Operational', meta: '6.8 / 10 GB used' },
    { name: 'Hosting',    status: 'ok',   label: 'Operational', meta: '99.98% uptime (30d)' },
    { name: 'Functions',  status: 'warn', label: 'Degraded',    meta: '2 functions slow to respond' },
    { name: 'Backup',     status: 'ok',   label: 'Up to date',  meta: 'Last run 2 hrs ago' },
  ];

  const folders = [
    { name: 'Baptismal Records',    files: 612, size: '2.4 GB' },
    { name: 'Confirmation Records', files: 248, size: '0.9 GB' },
    { name: 'Marriage Records',     files: 184, size: '1.6 GB' },
    { name: 'Death Records',        files: 156, size: '0.8 GB' },
    { name: 'Parish Announcements', files: 64,  size: '0.5 GB' },
    { name: 'Financial Documents',  files: 20,  size: '0.6 GB' },
  ];

  const accessLog = [
    { user: 'Fr. Mark D.',     file: 'Reyes, Ana L. — Marriage Cert.',     action: 'View',     time: '10 min ago' },
    { user: 'Sis. Elena R.',   file: 'Santos, Maria T. — Baptismal Cert.', action: 'Edit',     time: '38 min ago' },
    { user: 'Admin User',      file: 'June 2026 Backup Archive',           action: 'Download', time: '2 hrs ago' },
    { user: 'Fr. Mark D.',     file: 'Garcia, Pedro M. — Death Cert.',     action: 'View',     time: '3 hrs ago' },
    { user: 'Sis. Elena R.',   file: 'Cruz, Jose R. — Confirmation Cert.', action: 'Download', time: '5 hrs ago' },
    { user: 'Admin User',      file: 'Parish Financial Report Q2',         action: 'Edit',     time: 'Yesterday' },
  ];

  const roles = [
    {
      role: 'System Admin',
      permissions: [
        { label: 'Full Access',        granted: true },
        { label: 'Manage Roles',       granted: true },
        { label: 'Delete Records',     granted: true },
        { label: 'Export Data',        granted: true },
      ],
      users: 'Admin User',
    },
    {
      role: 'Parish Priest',
      permissions: [
        { label: 'View Records',       granted: true },
        { label: 'Approve Requests',   granted: true },
        { label: 'Delete Records',     granted: false },
        { label: 'Export Data',        granted: true },
      ],
      users: 'Fr. Mark D.',
    },
    {
      role: 'Records Staff',
      permissions: [
        { label: 'View Records',       granted: true },
        { label: 'Upload Records',     granted: true },
        { label: 'Approve Requests',   granted: false },
        { label: 'Delete Records',     granted: false },
      ],
      users: 'Sis. Elena R.',
    },
    {
      role: 'Volunteer',
      permissions: [
        { label: 'View Records',       granted: true },
        { label: 'Upload Records',     granted: false },
        { label: 'Approve Requests',   granted: false },
        { label: 'Delete Records',     granted: false },
      ],
      users: '3 volunteers',
    },
  ];

  const actionTagClass = {
    'View': 'action-view',
    'Download': 'action-download',
    'Edit': 'action-edit',
  };

  const STORAGE_USED_GB  = 6.8;
  const STORAGE_TOTAL_GB = 10;

  let accessGrants = [
    { user: 'Admin User',    email: 'admin@holycrossparish.org',      role: 'System Admin',  grantedDate: '2025-01-10', lastActive: '10 min ago', status: 'Active' },
    { user: 'Fr. Mark D.',   email: 'frmark@holycrossparish.org',     role: 'Parish Priest', grantedDate: '2025-03-02', lastActive: '38 min ago', status: 'Active' },
    { user: 'Sis. Elena R.', email: 'elena.r@holycrossparish.org',    role: 'Records Staff', grantedDate: '2025-06-18', lastActive: '2 hrs ago',  status: 'Active' },
    { user: 'Grace T.',      email: 'grace.t@volunteers.holycross.org', role: 'Volunteer',   grantedDate: '2026-02-11', lastActive: '1 day ago',  status: 'Active' },
    { user: 'Mico A.',       email: 'mico.a@volunteers.holycross.org',  role: 'Volunteer',   grantedDate: '2026-02-11', lastActive: '3 days ago', status: 'Active' },
    { user: 'Liza P.',       email: 'liza.p@volunteers.holycross.org',  role: 'Volunteer',   grantedDate: '2025-11-05', lastActive: '3 weeks ago', status: 'Revoked' },
  ];

  // Permissions per role, keyed off the same labels used in the
  // Access Roles & Permissions table below.
  const rolePermissions = {};
  roles.forEach(r => { rolePermissions[r.role] = r.permissions; });

  const grantStatusBadgeClass = {
    Active:  'badge-green',
    Revoked: 'badge-gray',
  };

  /* ------------------------------------------
     DOM REFERENCES
     Resolved up front, before any function that
     might use them can possibly run — avoids
     "used before initialization" errors when the
     render functions fire on first paint.
  ------------------------------------------ */
  const statTotalFiles   = document.getElementById('stat-total-files');
  const statStorageUsed  = document.getElementById('stat-storage-used');
  const statStorageSub   = document.getElementById('stat-storage-sub');
  const statTotalGrants  = document.getElementById('stat-total-grants');
  const statActiveGrants = document.getElementById('stat-active-grants');

  const grantsTbody = document.getElementById('grants-tbody');
  const grantsCount = document.getElementById('grants-count');

  const grantViewModal         = document.getElementById('grant-view-modal');
  const grantViewName          = document.getElementById('grant-view-name');
  const grantViewStatusBadge   = document.getElementById('grant-view-status-badge');
  const grantViewDetailGrid    = document.getElementById('grant-view-detail-grid');
  const grantViewPermissions   = document.getElementById('grant-view-permissions');

  const grantRevokeModal = document.getElementById('grant-revoke-modal');
  const grantRevokeName  = document.getElementById('grant-revoke-name');

  const uploadModal        = document.getElementById('upload-modal');
  const dropzone            = document.getElementById('upload-dropzone');
  const fileInput            = document.getElementById('upload-file-input');
  const uploadFilename        = document.getElementById('upload-filename');
  const uploadFolderSelect     = document.getElementById('upload-folder');

  const toast = document.getElementById('toast');

  /* ------------------------------------------
     1. RENDER — Service health grid
  ------------------------------------------ */
  function renderHealth() {
    const grid = document.getElementById('health-grid');
    grid.innerHTML = services.map(s => `
      <div class="health-card">
        <div class="health-icon ${s.status}">
          ${healthIcon(s.status)}
        </div>
        <div class="min-w-0">
          <p class="health-name">${escapeHtml(s.name)}</p>
          <p class="health-status ${s.status}">${escapeHtml(s.label)}</p>
          <p class="health-meta">${escapeHtml(s.meta)}</p>
        </div>
      </div>
    `).join('');
  }

  function healthIcon(status) {
    if (status === 'ok') {
      return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
    }
    if (status === 'warn') {
      return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-8.93 4.93h.01"/></svg>`;
    }
    return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`;
  }

  /* ------------------------------------------
     2. RENDER — Storage folders list
  ------------------------------------------ */
  function renderFolders() {
    const list = document.getElementById('folders-list');
    list.innerHTML = folders.map(f => `
      <li>
        <a href="digital-archives.html" class="folder-row">
          <div class="folder-icon">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 7a2 2 0 012-2h3.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H19a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
          </div>
          <span class="folder-name">${escapeHtml(f.name)}</span>
          <span class="folder-meta">
            <span class="folder-size">${escapeHtml(f.size)}</span>
            ${f.files} files
          </span>
        </a>
      </li>
    `).join('');
  }

  /* ------------------------------------------
     3. RENDER — Recent access log
  ------------------------------------------ */
  function renderAccessLog() {
    const tbody = document.getElementById('access-log-tbody');
    tbody.innerHTML = accessLog.map(a => `
      <tr>
        <td class="font-medium text-gray-900">${escapeHtml(a.user)}</td>
        <td class="text-gray-500">${escapeHtml(a.file)}</td>
        <td><span class="action-tag ${actionTagClass[a.action] || ''}">${escapeHtml(a.action)}</span></td>
        <td class="text-gray-400">${escapeHtml(a.time)}</td>
      </tr>
    `).join('');
  }

  /* ------------------------------------------
     4. RENDER — Access roles & permissions
  ------------------------------------------ */
  function renderRoles() {
    const tbody = document.getElementById('roles-tbody');
    tbody.innerHTML = roles.map(r => `
      <tr>
        <td class="font-semibold text-gray-900">${escapeHtml(r.role)}</td>
        <td>
          ${r.permissions.map(p => `<span class="permission-tag ${p.granted ? 'granted' : ''}">${p.granted ? '✓' : '–'} ${escapeHtml(p.label)}</span>`).join('')}
        </td>
        <td class="assigned-users">${escapeHtml(r.users)}</td>
      </tr>
    `).join('');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }


  /* ------------------------------------------
     4b. STAT BOXES
  ------------------------------------------ */
  function renderStats() {
    const totalFiles = folders.reduce((sum, f) => sum + f.files, 0);

    statTotalFiles.textContent  = totalFiles;
    statStorageUsed.textContent = `${STORAGE_USED_GB} GB`;
    statStorageSub.textContent  = `${Math.round((STORAGE_USED_GB / STORAGE_TOTAL_GB) * 100)}% of ${STORAGE_TOTAL_GB} GB used`;
    statTotalGrants.textContent  = accessGrants.length;
    statActiveGrants.textContent = accessGrants.filter(g => g.status === 'Active').length;

    updateActiveStatCard();
  }

  /* ------------------------------------------
     4c. STAT CARDS AS QUICK FILTERS
     "Access Grants" clears the status filter;
     "Active Grants" jumps straight to active
     users only. Total Files / Storage Used
     aren't filterable dimensions, so they stay
     informational only.
  ------------------------------------------ */
  const statCardTotalGrants  = statTotalGrants.closest('.stat-card');
  const statCardActiveGrants = statActiveGrants.closest('.stat-card');

  let grantStatusFilter = '';

  const statCardsByGrantStatus = [
    { card: statCardTotalGrants,  status: '' },
    { card: statCardActiveGrants, status: 'Active' },
  ];

  statCardsByGrantStatus.forEach(({ card, status }) => {
    card.classList.add('stat-card-clickable');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', () => {
      grantStatusFilter = status;
      renderGrants();
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        grantStatusFilter = status;
        renderGrants();
      }
    });
  });

  function updateActiveStatCard() {
    statCardsByGrantStatus.forEach(({ card, status }) => {
      card.classList.toggle('stat-card-active', grantStatusFilter === status);
    });
  }


  /* ------------------------------------------
     4d. RENDER — User access grants table
  ------------------------------------------ */
  function renderGrants() {
    updateActiveStatCard();

    const filtered = grantStatusFilter
      ? accessGrants.filter(g => g.status === grantStatusFilter)
      : accessGrants;

    grantsCount.textContent = `${filtered.length} of ${accessGrants.length} grant${accessGrants.length === 1 ? '' : 's'}`;

    grantsTbody.innerHTML = filtered.map(g => {
      const realIdx = accessGrants.indexOf(g);
      const actionsHtml = g.status === 'Active'
        ? `<div class="row-actions">
             <button type="button" class="row-view" data-index="${realIdx}">View ›</button>
             <button type="button" class="row-revoke" data-index="${realIdx}">Revoke</button>
           </div>`
        : `<div class="row-actions">
             <button type="button" class="row-view" data-index="${realIdx}">View ›</button>
           </div>`;

      return `
        <tr>
          <td class="font-medium text-gray-900">${escapeHtml(g.user)}</td>
          <td class="text-gray-500">${escapeHtml(g.role)}</td>
          <td class="text-gray-400">${fmtDate(g.grantedDate)}</td>
          <td class="text-gray-400">${escapeHtml(g.lastActive)}</td>
          <td><span class="badge ${grantStatusBadgeClass[g.status] || 'badge-gray'}">${escapeHtml(g.status)}</span></td>
          <td class="text-right">${actionsHtml}</td>
        </tr>
      `;
    }).join('');
  }

  grantsTbody.addEventListener('click', (e) => {
    const viewBtn   = e.target.closest('.row-view');
    const revokeBtn  = e.target.closest('.row-revoke');

    if (viewBtn)   openViewGrantModal(parseInt(viewBtn.dataset.index, 10));
    if (revokeBtn) openRevokeModal(parseInt(revokeBtn.dataset.index, 10));
  });


  renderHealth();
  renderFolders();
  renderAccessLog();
  renderRoles();
  renderStats();
  renderGrants();


  /* ------------------------------------------
     4e. VIEW GRANT DETAILS MODAL
  ------------------------------------------ */
  function openViewGrantModal(idx) {
    const g = accessGrants[idx];

    grantViewName.textContent = g.user;
    grantViewStatusBadge.textContent = g.status;
    grantViewStatusBadge.className = `badge ${grantStatusBadgeClass[g.status] || 'badge-gray'}`;

    grantViewDetailGrid.innerHTML = `
      <div>
        <p class="so-detail-label">Role</p>
        <p class="so-detail-value">${escapeHtml(g.role)}</p>
      </div>
      <div>
        <p class="so-detail-label">Email</p>
        <p class="so-detail-value">${escapeHtml(g.email)}</p>
      </div>
      <div>
        <p class="so-detail-label">Granted</p>
        <p class="so-detail-value">${fmtDate(g.grantedDate)}</p>
      </div>
      <div>
        <p class="so-detail-label">Last Active</p>
        <p class="so-detail-value">${escapeHtml(g.lastActive)}</p>
      </div>
    `;

    const permissions = rolePermissions[g.role] || [];
    grantViewPermissions.innerHTML = permissions
      .map(p => `<span class="permission-tag ${p.granted ? 'granted' : ''}">${p.granted ? '✓' : '–'} ${escapeHtml(p.label)}</span>`)
      .join('') || '<span class="text-xs text-gray-400">No permissions on record.</span>';

    openModal(grantViewModal);
  }


  /* ------------------------------------------
     4f. REVOKE ACCESS CONFIRMATION MODAL
     Revoking access used to have no confirmation
     step at all (there was no revoke action) —
     now it routes through this modal first.
  ------------------------------------------ */
  let revokeTargetIndex = null;

  function openRevokeModal(idx) {
    revokeTargetIndex = idx;
    grantRevokeName.textContent = accessGrants[idx].user;
    openModal(grantRevokeModal);
  }

  document.getElementById('grant-revoke-confirm-submit').addEventListener('click', () => {
    if (revokeTargetIndex === null) return;
    const g = accessGrants[revokeTargetIndex];
    g.status = 'Revoked';

    renderStats();
    renderGrants();
    closeModal(grantRevokeModal);
    showToast(`Access revoked for ${g.user}.`);
    revokeTargetIndex = null;
  });


  /* ------------------------------------------
     5. UPLOAD MODAL
  ------------------------------------------ */

  // Populate destination folder dropdown from the folders dataset
  uploadFolderSelect.innerHTML = folders
    .map(f => `<option value="${escapeHtml(f.name)}">${escapeHtml(f.name)}</option>`)
    .join('');

  document.getElementById('btn-upload').addEventListener('click', () => openModal(uploadModal));

  const allModals = [uploadModal, grantViewModal, grantRevokeModal];

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => allModals.forEach(closeModal));
  });

  allModals.forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) closeModal(m);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') allModals.forEach(closeModal);
  });

  function openModal(modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (modal.classList.contains('hidden')) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      uploadFilename.textContent = `Selected: ${fileInput.files[0].name}`;
      uploadFilename.classList.remove('hidden');
    }
  });

  ['dragover', 'dragenter'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'dragend'].forEach(evt => {
    dropzone.addEventListener(evt, () => dropzone.classList.remove('dragover'));
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      fileInput.files = e.dataTransfer.files;
      uploadFilename.textContent = `Selected: ${e.dataTransfer.files[0].name}`;
      uploadFilename.classList.remove('hidden');
    }
  });

  document.getElementById('upload-submit').addEventListener('click', () => {
    if (!fileInput.files.length) {
      showToast('Please select a file to upload.', true);
      return;
    }

    const folderName = uploadFolderSelect.value;
    const folder = folders.find(f => f.name === folderName);
    if (folder) {
      folder.files += 1;
      renderFolders();
    }

    closeModal(uploadModal);
    showToast(`File uploaded to "${folderName}".`);

    // Reset form
    fileInput.value = '';
    uploadFilename.classList.add('hidden');
  });


  /* ------------------------------------------
     6. TOAST NOTIFICATIONS
  ------------------------------------------ */
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