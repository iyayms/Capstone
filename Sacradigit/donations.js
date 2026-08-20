/* ============================================
   SacraDigit Admin — Donations Scripts
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------
     0. SAMPLE DATA
     "Today" fixed to match the rest of the app.
  ------------------------------------------ */
  const TODAY_ISO = '2026-06-19';
  const TODAY = new Date(TODAY_ISO + 'T00:00:00');

  // "This week" = last 7 days up to and including today
  const WEEK_START = new Date(TODAY);
  WEEK_START.setDate(WEEK_START.getDate() - 6);

  // "This month" = same calendar month as TODAY_ISO
  const MONTH_PREFIX = TODAY_ISO.slice(0, 7); // "2026-06"

  const donations = [
    { donor: 'Santos Family',      amount: 5000,  method: 'Online',  fund: 'Sunday Collection',       date: '2026-06-18', receiptNo: 'OR-2026-0512' },
    { donor: 'Cruz, Jose R.',       amount: 1000,  method: 'Cash',     fund: 'Mass Intention Offering', date: '2026-06-18', receiptNo: 'OR-2026-0511' },
    { donor: 'Reyes Family',        amount: 2500,  method: 'Online',  fund: 'Building Fund',            date: '2026-06-17', receiptNo: 'OR-2026-0510' },
    { donor: 'Garcia, Pedro M.',    amount: 500,   method: 'Cash',     fund: 'Poor Box',                  date: '2026-06-17', receiptNo: 'OR-2026-0509' },
    { donor: 'Anonymous',           amount: 10000, method: 'Check',   fund: 'Building Fund',            date: '2026-06-16', receiptNo: 'OR-2026-0508' },
    { donor: 'Villanueva Family',   amount: 1500,  method: 'Online',  fund: 'Sunday Collection',         date: '2026-06-15', receiptNo: 'OR-2026-0507' },
    { donor: 'Bautista, Carlo M.',  amount: 800,   method: 'Cash',     fund: 'Mass Intention Offering',  date: '2026-06-14', receiptNo: 'OR-2026-0506' },
    { donor: 'Mendoza, Carmen P.',  amount: 3000,  method: 'Online',  fund: 'Youth Ministry',            date: '2026-06-10', receiptNo: 'OR-2026-0505' },
    { donor: 'Fernandez, Luis G.',  amount: 1200,  method: 'Cash',     fund: 'Sunday Collection',         date: '2026-06-08', receiptNo: 'OR-2026-0504' },
    { donor: 'Torres Family',        amount: 2000,  method: 'Check',   fund: 'Building Fund',            date: '2026-06-03', receiptNo: 'OR-2026-0503' },
    { donor: 'Aquino Bakeshop',      amount: 5000,  method: 'Online',  fund: 'Building Fund',            date: '2026-06-02', receiptNo: 'OR-2026-0502' },
    { donor: 'Ramos, Teresa A.',     amount: 700,   method: 'Cash',     fund: 'Poor Box',                  date: '2026-05-29', receiptNo: 'OR-2026-0501' },
  ];

  const tbody          = document.getElementById('donations-tbody');
  const donationsCount  = document.getElementById('donations-count');
  const donationsEmpty   = document.getElementById('donations-empty');
  const paginationBar     = document.getElementById('donations-pagination');

  const searchInput = document.getElementById('search-input');
  const methodFilter  = document.getElementById('method-filter');
  const fundFilter      = document.getElementById('fund-filter');

  const statCardWeek  = document.getElementById('stat-week').closest('.stat-card');
  const statCardMonth = document.getElementById('stat-month').closest('.stat-card');

  const viewModal      = document.getElementById('view-modal');
  const viewDonor        = document.getElementById('view-donor');
  const viewAmount         = document.getElementById('view-amount');
  const viewDetailGrid       = document.getElementById('view-detail-grid');

  const PAGE_SIZE = 6;
  let currentPage = 1;
  let activeDateRange = ''; // '', 'week', 'month' — driven by the clickable stat cards

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatPeso(amount) {
    return '₱' + amount.toLocaleString('en-US');
  }

  function formatShortDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function methodClass(method) {
    return {
      'Cash': 'cash',
      'Online': 'online',
      'Check': 'check',
    }[method] || '';
  }

  function isInWeek(dateIso) {
    const dt = new Date(dateIso + 'T00:00:00');
    return dt >= WEEK_START && dt <= TODAY;
  }

  function isInMonth(dateIso) {
    return dateIso.startsWith(MONTH_PREFIX);
  }

  function matchesFilters(d) {
    const query      = searchInput.value.trim().toLowerCase();
    const methodVal   = methodFilter.value;
    const fundVal       = fundFilter.value;

    const matchesQuery = !query ||
      d.donor.toLowerCase().includes(query) ||
      d.fund.toLowerCase().includes(query);

    const matchesMethod = !methodVal || d.method === methodVal;
    const matchesFund     = !fundVal || d.fund === fundVal;
    const matchesRange     = !activeDateRange ||
      (activeDateRange === 'week' ? isInWeek(d.date) : isInMonth(d.date));

    return matchesQuery && matchesMethod && matchesFund && matchesRange;
  }


  /* ------------------------------------------
     1. STAT BOXES
  ------------------------------------------ */
  function renderStats() {
    const thisWeekDonations  = donations.filter(d => isInWeek(d.date));
    const thisMonthDonations = donations.filter(d => isInMonth(d.date));

    const weekTotal  = thisWeekDonations.reduce((sum, d) => sum + d.amount, 0);
    const monthTotal = thisMonthDonations.reduce((sum, d) => sum + d.amount, 0);

    const uniqueDonors = new Set(
      thisMonthDonations
        .filter(d => d.donor !== 'Anonymous')
        .map(d => d.donor)
    );

    document.getElementById('stat-week').textContent   = formatPeso(weekTotal);
    document.getElementById('stat-month').textContent  = formatPeso(monthTotal);
    document.getElementById('stat-donors').textContent  = uniqueDonors.size;

    updateActiveStatCard();
  }

  /* ------------------------------------------
     1b. STAT CARDS AS QUICK FILTERS
     "Total This Week" and "Total This Month" each
     toggle a date-range filter on the table.
     "Number of Donors" doesn't map to a single-column
     table filter, so it's left informational only.
  ------------------------------------------ */
  const statCardsByRange = [
    { card: statCardWeek,  range: 'week' },
    { card: statCardMonth, range: 'month' },
  ];

  statCardsByRange.forEach(({ card, range }) => {
    card.classList.add('stat-card-clickable');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', (e) => {
      if (e.target.closest('#btn-view-graph')) return;
      activeDateRange = activeDateRange === range ? '' : range;
      currentPage = 1;
      renderTable();
      updateActiveStatCard();
    });
    card.addEventListener('keydown', (e) => {
      if (e.target.closest('#btn-view-graph')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activeDateRange = activeDateRange === range ? '' : range;
        currentPage = 1;
        renderTable();
        updateActiveStatCard();
      }
    });
  });

  function updateActiveStatCard() {
    statCardsByRange.forEach(({ card, range }) => {
      card.classList.toggle('stat-card-active', activeDateRange === range);
    });
  }


  /* ------------------------------------------
     2. RENDER — Recent Donations table (filtered + paginated)
  ------------------------------------------ */
  function renderTable() {
    const sorted = donations.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    const filtered = sorted.filter(matchesFilters);

    donationsCount.textContent = `${filtered.length} donation${filtered.length === 1 ? '' : 's'}`;

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      donationsEmpty.classList.remove('hidden');
      paginationBar.innerHTML = '';
      return;
    }
    donationsEmpty.classList.add('hidden');

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE);

    tbody.innerHTML = pageItems.map(d => {
      const realIdx = donations.indexOf(d);
      return `
      <tr>
        <td class="font-medium text-gray-900">${escapeHtml(d.donor)}</td>
        <td class="donation-amount">${formatPeso(d.amount)}</td>
        <td><span class="payment-tag ${methodClass(d.method)}">${escapeHtml(d.method)}</span></td>
        <td class="text-gray-500">${escapeHtml(d.fund)}</td>
        <td class="text-gray-400">${formatShortDate(d.date)}</td>
        <td class="text-right">
          <div class="row-actions">
            <button type="button" class="row-view" data-index="${realIdx}">View ›</button>
          </div>
        </td>
      </tr>
    `;
    }).join('');

    renderPagination(filtered.length, totalPages, startIdx, pageItems.length);
  }

  function renderPagination(totalItems, totalPages, startIdx, pageCount) {
    if (totalPages <= 1) {
      paginationBar.innerHTML = `
        <span class="pagination-info">Showing ${totalItems} of ${totalItems}</span>
      `;
      return;
    }

    const rangeStart = startIdx + 1;
    const rangeEnd = startIdx + pageCount;

    let pageBtns = '';
    for (let p = 1; p <= totalPages; p++) {
      pageBtns += `<button type="button" class="pagination-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }

    paginationBar.innerHTML = `
      <span class="pagination-info">Showing ${rangeStart}–${rangeEnd} of ${totalItems}</span>
      <div class="pagination-controls">
        <button type="button" class="pagination-btn" id="page-prev" ${currentPage === 1 ? 'disabled' : ''}>‹</button>
        ${pageBtns}
        <button type="button" class="pagination-btn" id="page-next" ${currentPage === totalPages ? 'disabled' : ''}>›</button>
      </div>
    `;
  }

  paginationBar.addEventListener('click', (e) => {
    const prevBtn = e.target.closest('#page-prev');
    const nextBtn = e.target.closest('#page-next');
    const pageBtn  = e.target.closest('.pagination-btn[data-page]');

    if (prevBtn && currentPage > 1) currentPage--;
    if (nextBtn) currentPage++;
    if (pageBtn) currentPage = parseInt(pageBtn.dataset.page, 10);

    if (prevBtn || nextBtn || pageBtn) renderTable();
  });

  [searchInput, methodFilter, fundFilter].forEach(el => {
    const evt = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, () => {
      currentPage = 1;
      renderTable();
    });
  });

  document.getElementById('btn-clear-filters')?.addEventListener('click', () => {
    searchInput.value = '';
    methodFilter.value = '';
    fundFilter.value = '';
    activeDateRange = '';
    currentPage = 1;
    renderTable();
    updateActiveStatCard();
  });

  tbody.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('.row-view');
    if (viewBtn) openViewModal(parseInt(viewBtn.dataset.index, 10));
  });

  renderStats();
  renderTable();


  /* ------------------------------------------
     3. EXPORT REPORT — generate & download CSV
  ------------------------------------------ */
  document.getElementById('btn-export').addEventListener('click', () => {
    const headers = ['Donor', 'Amount (PHP)', 'Payment Method', 'Fund / Purpose', 'Date'];

    const rows = donations
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(d => [
        csvEscape(d.donor),
        d.amount,
        csvEscape(d.method),
        csvEscape(d.fund),
        d.date,
      ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `sacradigit-donations-report-${TODAY_ISO}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Report exported — ${donations.length} donations included.`);
  });

  function csvEscape(value) {
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }


  /* ------------------------------------------
     4. DONATION TRACKER GRAPH (Total This Week)
  ------------------------------------------ */
  const graphModal   = document.getElementById('graph-modal');
  const chartContainer = document.getElementById('donation-chart');

  function renderDonationChart() {
    const today = new Date(TODAY_ISO + 'T00:00:00');
    const days = [];

    // Build the same 7-day window used by the "Total This Week" stat
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const total = donations
        .filter(don => don.date === iso)
        .reduce((sum, don) => sum + don.amount, 0);
      days.push({
        iso,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total,
      });
    }

    const maxTotal = Math.max(...days.map(d => d.total), 1);

    const width = 500;
    const height = 220;
    const chartTop = 20;
    const chartBottom = 190;
    const chartHeight = chartBottom - chartTop;
    const barWidth = 36;
    const gap = (width - barWidth * days.length) / (days.length + 1);

    const bars = days.map((d, i) => {
      const x = gap + i * (barWidth + gap);
      const barHeight = d.total === 0 ? 0 : Math.max(4, (d.total / maxTotal) * chartHeight);
      const y = chartBottom - barHeight;

      return `
        <g class="chart-bar-group">
          <title>${d.dateLabel}: ${formatPeso(d.total)}</title>
          <rect class="chart-bar" x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" />
          ${d.total > 0 ? `<text class="chart-bar-label" x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle">${formatPeso(d.total)}</text>` : ''}
          <text class="chart-axis-label" x="${x + barWidth / 2}" y="${chartBottom + 16}" text-anchor="middle">${d.label}</text>
        </g>
      `;
    }).join('');

    chartContainer.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="220" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="${chartBottom}" x2="${width}" y2="${chartBottom}" stroke="#e5e7eb" stroke-width="1" />
        ${bars}
      </svg>
    `;
  }

  document.getElementById('btn-view-graph').addEventListener('click', (e) => {
    e.stopPropagation();
    renderDonationChart();
    openModal(graphModal);
  });


  /* ------------------------------------------
     4b. VIEW DETAILS MODAL (per-row)
  ------------------------------------------ */
  function openViewModal(idx) {
    const d = donations[idx];
    if (!d) return;

    viewDonor.textContent = d.donor;
    viewAmount.textContent = formatPeso(d.amount);

    viewDetailGrid.innerHTML = `
      <div>
        <p class="so-detail-label">Payment Method</p>
        <p class="so-detail-value"><span class="payment-tag ${methodClass(d.method)}">${escapeHtml(d.method)}</span></p>
      </div>
      <div>
        <p class="so-detail-label">Fund / Purpose</p>
        <p class="so-detail-value">${escapeHtml(d.fund)}</p>
      </div>
      <div>
        <p class="so-detail-label">Date</p>
        <p class="so-detail-value">${formatShortDate(d.date)}</p>
      </div>
      <div>
        <p class="so-detail-label">Official Receipt No.</p>
        <p class="so-detail-value">${escapeHtml(d.receiptNo || '—')}</p>
      </div>
    `;

    openModal(viewModal);
  }


  /* ------------------------------------------
     5. MODAL HELPERS (open/close/escape)
  ------------------------------------------ */
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const overlay = btn.closest('.modal-overlay');
      if (overlay) closeModal(overlay);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(closeModal);
    }
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


  /* ------------------------------------------
     6. TOAST NOTIFICATIONS
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