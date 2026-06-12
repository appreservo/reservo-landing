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

  async function refresh() {
    const [pending, businesses] = await Promise.all([
      window.reservoAuth.listPendingAccounts(),
      window.reservoAuth.listAllBusinesses(),
    ]);
    renderPending(pending);
    renderBusinesses(businesses);
  }

  function start() { refresh().catch(() => {
    pendingTable.innerHTML = '<div class="empty-state">Impossibile caricare le richieste al momento.</div>';
    businessTable.innerHTML = '';
  }); }

  if (window.reservoAuth && window.reservoAuth.currentUser) start();
  else window.addEventListener('reservo-auth-ready', start, { once: true });
});
