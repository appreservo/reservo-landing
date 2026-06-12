/* Reservo - pannello admin: approvazione registrazioni gestori */
document.addEventListener('DOMContentLoaded', () => {
  const pendingTable = document.getElementById('pendingTable');
  const businessTable = document.getElementById('businessTable');
  const logoutBtn = document.getElementById('logoutBtn');

  logoutBtn.addEventListener('click', () => window.reservoAuth.logout());

  function renderPending(list) {
    if (!list.length) {
      pendingTable.innerHTML = '<div class="empty-state">Nessuna richiesta in attesa.</div>';
      return;
    }
    pendingTable.innerHTML = `
      <table>
        <thead><tr><th>Attività</th><th>Tipo</th><th>Referente</th><th>Email</th><th></th></tr></thead>
        <tbody>
          ${list.map(u => `
            <tr>
              <td>${u.businessName || '—'}</td>
              <td>${typeLabel(u.businessType)}</td>
              <td>${u.name || '—'}</td>
              <td>${u.email || '—'}</td>
              <td style="white-space:nowrap">
                <button class="btn btn-gold btn-sm" data-approve="${u.id}">Approva</button>
                <button class="btn btn-danger btn-sm" data-reject="${u.id}">Rifiuta</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;

    pendingTable.querySelectorAll('[data-approve]').forEach(btn => btn.addEventListener('click', async () => {
      btn.disabled = true;
      await window.reservoAuth.approveAccount(btn.dataset.approve);
      showToast('Account approvato', 'success');
      refresh();
    }));
    pendingTable.querySelectorAll('[data-reject]').forEach(btn => btn.addEventListener('click', async () => {
      if (!confirm('Rifiutare questa richiesta di registrazione?')) return;
      btn.disabled = true;
      await window.reservoAuth.rejectAccount(btn.dataset.reject);
      showToast('Richiesta rifiutata', 'success');
      refresh();
    }));
  }

  function renderBusinesses(list) {
    if (!list.length) {
      businessTable.innerHTML = '<div class="empty-state">Nessuna attività registrata.</div>';
      return;
    }
    businessTable.innerHTML = `
      <table>
        <thead><tr><th>Attività</th><th>Tipo</th><th>Email</th><th>Stato</th></tr></thead>
        <tbody>
          ${list.map(b => `
            <tr>
              <td>${b.business_name || '—'}</td>
              <td>${typeLabel(b.type)}</td>
              <td>${b.email || '—'}</td>
              <td><span class="badge badge-${b.status === 'rejected' ? 'rejected' : 'confirmed'}">${b.status === 'rejected' ? 'Rifiutata' : 'Attiva'}</span></td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  }

  let growthChart;

  function renderStats(businesses, bookingsCount) {
    const active = businesses.filter(b => !b.status || b.status === 'active').length;
    const pendingCount = businesses.filter(b => b.status === 'pending').length;
    const rejected = businesses.filter(b => b.status === 'rejected').length;
    document.getElementById('statActive').textContent = active;
    document.getElementById('statPendingCount').textContent = pendingCount;
    document.getElementById('statRejected').textContent = rejected;
    document.getElementById('statBookings').textContent = bookingsCount;
  }

  function renderGrowthChart(users) {
    const counts = new Map();
    users.forEach(u => {
      const d = u.createdAt && u.createdAt.toDate ? u.createdAt.toDate() : null;
      if (!d) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const labels = Array.from(counts.keys()).sort();
    const MONTHS = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
    const niceLabels = labels.map(k => { const [y, m] = k.split('-'); return `${MONTHS[parseInt(m, 10) - 1]} ${y}`; });
    const data = labels.map(k => counts.get(k));

    if (growthChart) growthChart.destroy();
    growthChart = new Chart(document.getElementById('growthChart'), {
      type: 'bar',
      data: { labels: niceLabels, datasets: [{ label: 'Nuove attività registrate', data, backgroundColor: '#C9A227' }] },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
    });
  }

  async function refresh() {
    const [pending, businesses, gestori, bookingsCount] = await Promise.all([
      window.reservoAuth.listPendingAccounts(),
      window.reservoAuth.listAllBusinesses(),
      window.reservoAuth.listGestoreUsers().catch(() => []),
      window.reservoAuth.countAllBookings().catch(() => 0),
    ]);
    renderPending(pending);
    renderBusinesses(businesses);
    renderStats(businesses, bookingsCount);
    renderGrowthChart(gestori);
  }

  function start() { refresh().catch(() => {
    pendingTable.innerHTML = '<div class="empty-state">Impossibile caricare le richieste al momento.</div>';
    businessTable.innerHTML = '';
  }); }

  if (window.reservoAuth && window.reservoAuth.currentUser) start();
  else window.addEventListener('reservo-auth-ready', start, { once: true });
});
