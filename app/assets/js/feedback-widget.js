/* Reservo demo - widget di feedback (bottone "?" -> Firestore) */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAQNqwqsDX2bwNKjj1zt-PCfHH0R2KNjHM",
  authDomain: "appreservo-92b7c.firebaseapp.com",
  projectId: "appreservo-92b7c",
  storageBucket: "appreservo-92b7c.firebasestorage.app",
  messagingSenderId: "806875101057",
  appId: "1:806875101057:web:45ad76021eadca6c8e9a80",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const MAX_MESSAGE_LENGTH = 2000;
const SUBMIT_COOLDOWN_MS = 30 * 1000;
const FEEDBACK_COOLDOWN_KEY = 'reservo-feedback-last-submit';

const APP_NAME = document.title;

const css = `
  #fw-btn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9998;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: var(--navy, #1B2F6E);
    color: #fff;
    border: none;
    font-size: 18px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(0,0,0,.2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform .15s, background .15s;
    line-height: 1;
    font-family: inherit;
  }
  #fw-btn:hover { background: var(--gold, #C9A227); transform: scale(1.08); }

  #fw-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(27,47,110,.45);
    z-index: 9999;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }
  #fw-backdrop.open { display: flex; }

  #fw-modal {
    background: #fff;
    border-radius: 14px;
    padding: 1.5rem;
    width: 100%;
    max-width: 380px;
    font-family: 'Nunito', system-ui, sans-serif;
    box-shadow: 0 8px 32px rgba(0,0,0,.2);
  }
  #fw-modal h2 { margin: 0 0 4px; font-size: 1.15rem; color: var(--navy, #1B2F6E); }
  #fw-app-label { font-size: .78rem; color: #888; margin: 0 0 1rem; }

  .fw-type-row { display: flex; gap: .5rem; margin-bottom: 1rem; }
  .fw-type-btn {
    flex: 1;
    padding: .5rem;
    border: 2px solid var(--border, #e5e7eb);
    border-radius: 8px;
    background: var(--cream, #F8F7F3);
    cursor: pointer;
    font-size: .82rem;
    font-weight: 700;
    font-family: inherit;
    transition: all .15s;
    color: var(--text-dark, #2A2A2A);
  }
  .fw-type-btn.fw-active {
    border-color: var(--gold, #C9A227);
    background: rgba(201,162,39,.16);
    color: #92740f;
  }

  #fw-message {
    width: 100%;
    box-sizing: border-box;
    padding: .55rem .7rem;
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 8px;
    font-size: .9rem;
    font-family: inherit;
    resize: vertical;
    min-height: 100px;
    outline: none;
    transition: border-color .15s;
  }
  #fw-message:focus { outline: 2px solid var(--gold, #C9A227); border-color: var(--gold, #C9A227); }

  .fw-actions { display: flex; gap: .5rem; margin-top: 1rem; justify-content: flex-end; }
  #fw-cancel, #fw-submit {
    padding: .5rem 1.1rem;
    border-radius: 8px;
    border: 1px solid transparent;
    cursor: pointer;
    font-size: .85rem;
    font-weight: 700;
    font-family: inherit;
  }
  #fw-cancel { background: #fff; color: var(--navy, #1B2F6E); border-color: var(--navy, #1B2F6E); }
  #fw-cancel:hover { background: var(--cream, #F8F7F3); }
  #fw-submit { background: var(--navy, #1B2F6E); color: #fff; }
  #fw-submit:hover { background: var(--navy-light, #2c4490); }
  #fw-submit:disabled { opacity: .5; cursor: not-allowed; }

  #fw-status { margin-top: .7rem; font-size: .82rem; text-align: center; min-height: 18px; }
  .fw-success { color: var(--green, #16a34a); }
  .fw-error { color: var(--red, #dc2626); }
`;

const styleEl = document.createElement('style');
styleEl.textContent = css;
document.head.appendChild(styleEl);

const wrapper = document.createElement('div');
wrapper.innerHTML = `
  <button id="fw-btn" aria-label="Invia un feedback" title="Feedback">?</button>
  <div id="fw-backdrop">
    <div id="fw-modal" role="dialog" aria-modal="true" aria-labelledby="fw-title">
      <h2 id="fw-title">Invia un feedback</h2>
      <p id="fw-app-label">${APP_NAME}</p>
      <div class="fw-type-row">
        <button class="fw-type-btn fw-active" data-type="suggestion">💡 Suggerimento</button>
        <button class="fw-type-btn" data-type="bug">🐛 Problema</button>
      </div>
      <textarea id="fw-message" maxlength="2000" placeholder="Cosa vorresti vedere, o cosa non funziona?"></textarea>
      <div class="fw-actions">
        <button id="fw-cancel">Annulla</button>
        <button id="fw-submit">Invia</button>
      </div>
      <div id="fw-status"></div>
    </div>
  </div>
`;
document.body.appendChild(wrapper);

const backdrop  = document.getElementById('fw-backdrop');
const openBtn   = document.getElementById('fw-btn');
const cancelBtn = document.getElementById('fw-cancel');
const submitBtn = document.getElementById('fw-submit');
const messageEl = document.getElementById('fw-message');
const statusEl  = document.getElementById('fw-status');
const typeBtns  = document.querySelectorAll('.fw-type-btn');

let selectedType = 'suggestion';

function openModal() {
  backdrop.classList.add('open');
  messageEl.focus();
}
function closeModal() {
  backdrop.classList.remove('open');
  statusEl.textContent = '';
  statusEl.className = '';
}

openBtn.addEventListener('click', openModal);
cancelBtn.addEventListener('click', closeModal);
backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

typeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    typeBtns.forEach(b => b.classList.remove('fw-active'));
    btn.classList.add('fw-active');
    selectedType = btn.dataset.type;
  });
});

submitBtn.addEventListener('click', async () => {
  const message = messageEl.value.trim();
  if (!message) {
    statusEl.textContent = 'Scrivi un messaggio.';
    statusEl.className = 'fw-error';
    return;
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    statusEl.textContent = 'Messaggio troppo lungo.';
    statusEl.className = 'fw-error';
    return;
  }

  const lastSubmittedAt = Number(localStorage.getItem(FEEDBACK_COOLDOWN_KEY) || 0);
  const cooldownRemaining = SUBMIT_COOLDOWN_MS - (Date.now() - lastSubmittedAt);
  if (cooldownRemaining > 0) {
    statusEl.textContent = `Attendi ${Math.ceil(cooldownRemaining / 1000)}s prima di inviare di nuovo.`;
    statusEl.className = 'fw-error';
    return;
  }

  submitBtn.disabled = true;
  statusEl.textContent = 'Invio in corso…';
  statusEl.className = '';

  try {
    await addDoc(collection(db, 'feedback'), {
      app: APP_NAME,
      type: selectedType,
      message,
      timestamp: serverTimestamp()
    });
    localStorage.setItem(FEEDBACK_COOLDOWN_KEY, String(Date.now()));
    statusEl.textContent = '✓ Grazie per il feedback!';
    statusEl.className = 'fw-success';
    messageEl.value = '';
    setTimeout(closeModal, 1500);
  } catch (err) {
    statusEl.textContent = 'Invio non riuscito. Riprova.';
    statusEl.className = 'fw-error';
    console.error('Feedback widget error:', err);
  } finally {
    submitBtn.disabled = false;
  }
});
