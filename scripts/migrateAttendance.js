import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';

// Note: Ensure this matches the exact config from your app
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

// Simple week details calculation
const getTuesdayWeekDetails = (dateString) => {
  const dateObj = dateString ? new Date(dateString) : new Date();
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  
  let prevTuesday = new Date(dateObj);
  const dayOfWeek = prevTuesday.getDay();
  const diff = dayOfWeek >= 2 ? dayOfWeek - 2 : dayOfWeek + 5;
  prevTuesday.setDate(prevTuesday.getDate() - diff);
  
  const tuesdayWeekStartDate = `${prevTuesday.getFullYear()}-${String(prevTuesday.getMonth() + 1).padStart(2, '0')}-${String(prevTuesday.getDate()).padStart(2, '0')}`;
  
  const startOfYear = new Date(year, 0, 1);
  const diffTime = prevTuesday - startOfYear;
  const weekNumber = Math.ceil((diffTime / (1000 * 60 * 60 * 24) + startOfYear.getDay() + 1) / 7);

  return { tuesdayWeekStartDate, weekNumber, month, year };
};

const migrateData = async () => {
  console.log('Starting Migration...');

  try {
    // 1. Fetch old Member Attendance (attendance collection)
    console.log('Fetching old member attendance...');
    const attSnap = await getDocs(collection(db, 'attendance'));
    let memberCount = 0;

    for (const d of attSnap.docs) {
      const data = d.data();
      const date = data.date;
      const leaderId = data.cellLeaderId;
      const place = data.place || '';
      const attendanceArr = data.attendance || [];

      const { tuesdayWeekStartDate, weekNumber, month, year } = getTuesdayWeekDetails(date);

      for (const record of attendanceArr) {
        // Doc ID format: {leaderId}_{memberId}_{date}
        const memberId = record.studentId || record.id || `unknown_${Math.random()}`;
        const docId = `${leaderId}_${memberId}_${date}`;

        const newRecord = {
          attendanceId: docId,
          leaderId: leaderId,
          leaderName: data.leaderName || 'Unknown', 
          cellId: place,
          memberId: memberId,
          memberName: record.name,
          status: record.status,
          date: date,
          tuesdayWeekStartDate,
          weekNumber,
          month,
          year,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await setDoc(doc(db, 'memberAttendance', docId), newRecord, { merge: true });
        memberCount++;
      }
    }
    console.log(`Migrated ${memberCount} member attendance records.`);

    // 2. Fetch old Leader Attendance (leader_attendance collection)
    console.log('Fetching old leader attendance...');
    const leaderAttSnap = await getDocs(collection(db, 'leader_attendance'));
    let leaderCount = 0;

    for (const d of leaderAttSnap.docs) {
      const data = d.data();
      const date = data.date;
      const attendanceArr = data.attendance || [];
      
      if (!date) continue;

      const { tuesdayWeekStartDate, weekNumber, month, year } = getTuesdayWeekDetails(date);

      for (const record of attendanceArr) {
        const leaderId = record.leaderId;
        const docId = `${leaderId}_${date}`;

        const newRecord = {
          attendanceId: docId,
          leaderId: leaderId,
          leaderName: record.name,
          place: record.place,
          status: record.status,
          date: date,
          tuesdayWeekStartDate,
          weekNumber,
          month,
          year,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await setDoc(doc(db, 'leaderAttendance', docId), newRecord, { merge: true });
        leaderCount++;
      }
    }
    console.log(`Migrated ${leaderCount} leader attendance records.`);

    console.log('Migration Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateData();
