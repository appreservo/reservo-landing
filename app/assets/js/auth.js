/* Reservo demo - autenticazione reale via Firebase Authentication */
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

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
const db = getFirestore(firebaseApp);

function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

function register(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

function logout() {
  return signOut(auth).then(() => { location.href = 'login.html'; });
}

function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

function createUserProfile(uid, profile) {
  return setDoc(doc(db, 'users', uid), profile);
}

async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

function upsertBusinessDirectory(uid, business) {
  return setDoc(doc(db, 'businesses', uid), { ...business, updatedAt: serverTimestamp() }, { merge: true });
}

async function getBusinessData(uid) {
  const snap = await getDoc(doc(db, 'businessData', uid));
  return snap.exists() ? snap.data() : null;
}

function saveBusinessData(uid, data) {
  return setDoc(doc(db, 'businessData', uid), data);
}

async function listBusinesses() {
  const snap = await getDocs(collection(db, 'businesses'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function requireAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        document.documentElement.classList.remove('auth-pending');
        const profile = await getUserProfile(user.uid).catch(() => null);
        const displayName = (profile && profile.name) || user.email;
        document.querySelectorAll('.js-user-name').forEach(el => { el.textContent = displayName; });
        window.reservoAuth.currentUser = user;
        window.dispatchEvent(new Event('reservo-auth-ready'));
        resolve(user);
      } else {
        location.href = 'login.html';
      }
    });
  });
}

window.reservoAuth = {
  auth, db, login, register, logout, requireAuth, resetPassword,
  createUserProfile, getUserProfile, upsertBusinessDirectory, listBusinesses,
  getBusinessData, saveBusinessData,
  serverTimestamp,
};
export {
  auth, db, login, register, logout, requireAuth, resetPassword,
  createUserProfile, getUserProfile, upsertBusinessDirectory, listBusinesses,
  getBusinessData, saveBusinessData,
  serverTimestamp,
};
