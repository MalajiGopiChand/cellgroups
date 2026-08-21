import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBxzfHQxiHkDQuBD7jWCeuH9eSyW_U6vFU",
  authDomain: "bethelcellgrp.firebaseapp.com",
  projectId: "bethelcellgrp",
  storageBucket: "bethelcellgrp.firebasestorage.app",
  messagingSenderId: "240487626256",
  appId: "1:240487626256:web:a0d07ebf2efa4951c0bc95",
  measurementId: "G-E5CBC150RC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable true offline mode for PWA
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn('Offline persistence failed: multiple tabs open');
  } else if (err.code == 'unimplemented') {
    console.warn('Offline persistence not supported by browser');
  }
});

export default app;
