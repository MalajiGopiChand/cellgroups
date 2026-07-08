import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export function useBirthdays(user, isAdmin) {
  const [members, setMembers] = useState([]);
  const [todayList, setTodayList] = useState([]);
  const [upcomingList, setUpcomingList] = useState([]);
  const [beforeTuesdayList, setBeforeTuesdayList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        let q;
        if (isAdmin) {
          q = collection(db, 'students');
        } else if (user?.id) {
          q = query(collection(db, 'students'), where('cellLeaderId', '==', user.id));
        } else {
          setLoading(false);
          return;
        }

        const snap = await getDocs(q);
        const mems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const filtered = isAdmin ? mems : mems.filter(m => m.place === user?.place);
        setMembers(filtered);
      } catch (error) {
        console.error("Error fetching members for birthdays:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [user, isAdmin]);

  useEffect(() => {
    if (members.length === 0) return;

    const todayListTemp = [];
    const upcomingListTemp = [];
    const beforeTuesdayTemp = [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate current week's Sunday and Saturday
    const thisSunday = new Date(today);
    const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
    thisSunday.setDate(today.getDate() - dayOfWeek);
    thisSunday.setHours(0, 0, 0, 0);

    const thisSaturday = new Date(thisSunday);
    thisSaturday.setDate(thisSunday.getDate() + 6);
    thisSaturday.setHours(23, 59, 59, 999);

    members.forEach(member => {
      if (!member.dob) return;
      const parts = member.dob.split('-');
      if (parts.length !== 3) return;
      
      const bMonth = parseInt(parts[1], 10);
      const bDay = parseInt(parts[2], 10);
      
      let bdayThisYear = new Date(now.getFullYear(), bMonth - 1, bDay);
      let nextBday = new Date(bdayThisYear);
      if (nextBday < today) {
        nextBday.setFullYear(now.getFullYear() + 1);
      }
      
      let prevBday = new Date(nextBday);
      prevBday.setFullYear(nextBday.getFullYear() - 1);
      
      const diffDaysNext = Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24));
      const bdayItem = { ...member, diffDays: diffDaysNext, nextBday, bMonth, bDay };
      
      // Today list
      if (diffDaysNext === 0) {
        todayListTemp.push(bdayItem);
      } else if (diffDaysNext > 0 && diffDaysNext <= 10) {
        upcomingListTemp.push(bdayItem);
      }

      // This week list (for notification bar)
      let bdayToConsider = null;
      if (prevBday >= thisSunday && prevBday <= thisSaturday) {
        bdayToConsider = prevBday;
      } else if (nextBday >= thisSunday && nextBday <= thisSaturday) {
        bdayToConsider = nextBday;
      }

      if (bdayToConsider) {
        const diffFromToday = Math.ceil((bdayToConsider - today) / (1000 * 60 * 60 * 24));
        beforeTuesdayTemp.push({ ...member, diffDays: diffFromToday, bMonth, bDay });
      }
    });

    upcomingListTemp.sort((a, b) => a.diffDays - b.diffDays);
    beforeTuesdayTemp.sort((a, b) => a.diffDays - b.diffDays);

    setTodayList(todayListTemp);
    setUpcomingList(upcomingListTemp);
    setBeforeTuesdayList(beforeTuesdayTemp);
  }, [members]);

  return { loading, todayList, upcomingList, beforeTuesdayList };
}
