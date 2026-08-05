import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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
const db = getFirestore(app);

const checkRecords = async () => {
  console.log('--- Checking new memberAttendance ---');
  const q1 = query(collection(db, 'memberAttendance'), where('date', '==', '2026-08-04'));
  const snap1 = await getDocs(q1);
  console.log(`Found ${snap1.size} records in memberAttendance for 2026-08-04`);
  
  if (!snap1.empty) {
    console.log(snap1.docs[0].data());
  }

  console.log('--- Checking old attendance array ---');
  const q2 = query(collection(db, 'attendance'), where('date', '==', '2026-08-04'));
  const snap2 = await getDocs(q2);
  console.log(`Found ${snap2.size} records in old attendance for 2026-08-04`);

  if (!snap2.empty) {
    console.log(snap2.docs[0].data());
  }
  
  process.exit(0);
};

checkRecords();
