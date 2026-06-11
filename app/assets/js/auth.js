/* Reservo demo - autenticazione (solo demo, credenziali in chiaro lato client) */
const AUTH_KEY = 'reservo_demo_auth';
const DEMO_CREDENTIALS = { email: 'info@damario.it', password: 'demo123' };

function isLoggedIn() {
  return localStorage.getItem(AUTH_KEY) === '1';
}

function login(email, password) {
  const ok = email.trim().toLowerCase() === DEMO_CREDENTIALS.email
    && password === DEMO_CREDENTIALS.password;
  if (ok) localStorage.setItem(AUTH_KEY, '1');
  return ok;
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  location.href = 'login.html';
}

function requireAuth() {
  if (!isLoggedIn()) location.href = 'login.html';
}
