// server/firebase.js
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyDCA22ulpTVp9JRhuLDp6kQzlxR-DO7j14',
  authDomain: 'translatorkbci.firebaseapp.com',
  projectId: 'translatorkbci',
  storageBucket: 'translatorkbci.firebasestorage.app',
  messagingSenderId: '458115723561',
  appId: '1:458115723561:web:2e3aaaf877d9071a374738',
  measurementId: 'G-2BSXQTJQN5',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { db };
