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
});
