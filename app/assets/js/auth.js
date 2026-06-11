/* Reservo demo - autenticazione reale via Firebase Authentication */
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAQNqwqsDX2bwNKjj1zt-PCfHH0R2KNjHM",
  authDomain: "appreservo-92b7c.firebaseapp.com",
  projectId: "appreservo-92b7c",
  storageBucket: "appreservo-92b7c.firebasestorage.app",
  messagingSenderId: "806875101057",
  appId: "1:806875101057:web:45ad76021eadca6c8e9a80",
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

function logout() {
  return signOut(auth).then(() => { location.href = 'login.html'; });
}

function requireAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        document.documentElement.classList.remove('auth-pending');
        resolve(user);
      } else {
        location.href = 'login.html';
      }
    });
  });
}

window.reservoAuth = { auth, login, logout, requireAuth };
export { auth, login, logout, requireAuth };
