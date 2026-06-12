/* Reservo - area cliente: ricerca attività + elenco prenotazioni (placeholder) */
document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('businessList');
  const searchInput = document.getElementById('searchInput');
  const logoutBtn = document.getElementById('logoutBtn');

  logoutBtn.addEventListener('click', () => {
    window.reservoAuth.logout();
  });

  let businesses = [];

  function render(filter) {
    const term = (filter || '').trim().toLowerCase();
    const filtered = !term ? businesses : businesses.filter(b => {
      return [b.business_name, typeLabel(b.type), b.address, b.description]
        .filter(Boolean)
        .some(v => v.toLowerCase().includes(term));
    });

    if (!filtered.length) {
      listEl.innerHTML = '<div class="empty-state">Nessuna attività trovata.</div>';
      return;
    }

    listEl.innerHTML = filtered.map(b => `
      <div class="card">
        <div class="card-header">
          <h3>${b.business_name || 'Attività'}</h3>
          <span class="badge badge-navy">${typeLabel(b.type)}</span>
        </div>
        ${b.address ? `<p class="text-mid small mb-3">${b.address}</p>` : ''}
        ${b.description ? `<p class="small">${b.description}</p>` : ''}
      </div>
    `).join('');
  }

  searchInput.addEventListener('input', () => render(searchInput.value));

  window.reservoAuth.listBusinesses().then(list => {
    businesses = list;
    render('');
  }).catch(() => {
    listEl.innerHTML = '<div class="empty-state">Impossibile caricare le attività al momento.</div>';
  });

  // ---------- le mie prenotazioni ----------
  const myBookingsEl = document.getElementById('myBookings');

  function renderBookings(list) {
    if (!list.length) {
      myBookingsEl.innerHTML = '<div class="empty-state">Non hai ancora effettuato prenotazioni.</div>';
      return;
    }
    const sorted = list.slice().sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    myBookingsEl.innerHTML = sorted.map(b => `
      <div class="card">
        <div class="card-header">
          <h3>${b.businessName || 'Attività'}</h3>
          <span class="badge badge-${b.status}">${statusLabel(b.status)}</span>
        </div>
        <p class="small">${fmtDateLong(b.date)} — ore ${b.time}</p>
        <p class="text-mid small">${b.service_name || ''} · ${b.party_size} ${b.party_size === 1 ? 'persona' : 'persone'}</p>
        ${b.reference ? `<p class="text-mid small">${b.reference}</p>` : ''}
        ${(b.status === 'pending' || b.status === 'confirmed') ? `<button class="btn btn-outline btn-sm" data-cancel="${b.id}">Annulla prenotazione</button>` : ''}
      </div>
    `).join('');

    myBookingsEl.querySelectorAll('[data-cancel]').forEach(btn => btn.addEventListener('click', async () => {
      btn.disabled = true;
      await window.reservoAuth.updateBookingStatus(btn.dataset.cancel, 'cancelled');
      loadBookings();
    }));
  }

  function loadBookings() {
    window.reservoAuth.whoAmI().then(user => {
      if (!user) return;
      window.reservoAuth.getCustomerBookings(user.uid).then(renderBookings).catch(() => {
        myBookingsEl.innerHTML = '<div class="empty-state">Impossibile caricare le prenotazioni al momento.</div>';
      });
    });
  }

  loadBookings();
});
