import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fade } from '@mui/material';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useLanguage } from '../../contexts/LanguageContext';

function CellLeaderHomePage({ user }) {
  const { language } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'announcements'), (snap) => {
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(a => a.recipientType === 'all' || a.cellLeaderId === user?.id)
        .sort((a, b) => {
          const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const db_ = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return db_ - da;
        }));
    });
    return () => unsubscribe();
  }, [user?.id]);

  return (
    null
  );
}

export default CellLeaderHomePage;
