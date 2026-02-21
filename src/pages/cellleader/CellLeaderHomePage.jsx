import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fade } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

function CellLeaderHomePage({ user }) {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, 'announcements'));
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(a => a.recipientType === 'all' || a.cellLeaderId === user?.id)
        .sort((a, b) => {
          const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const db_ = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return db_ - da;
        }));
    };
    fetch();
  }, [user?.id]);

  return (
    <Fade in timeout={350}>
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Announcements</Typography>
        {announcements.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {announcements.map(a => (
              <Paper key={a.id} sx={{ p: 2, bgcolor: '#ffffff', backdropFilter: 'blur(12px)' }}>
                <Typography variant="subtitle1" fontWeight={600}>{a.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{a.message}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {a.createdAt?.toDate ? new Date(a.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                </Typography>
              </Paper>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">No announcements</Typography>
        )}
      </Box>
    </Fade>
  );
}

export default CellLeaderHomePage;
