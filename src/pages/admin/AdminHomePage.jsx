import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Chip } from '@mui/material';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';

function AdminHomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubAnnouncements;

    const fetchData = async () => {
      unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snap) => {
        setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const db_ = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return db_ - da;
          }));
        setLoading(false);
      });
    };

    fetchData();

    return () => {
      if (unsubAnnouncements) unsubAnnouncements();
    };
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Announcements Feed */}
      <Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress sx={{ color: 'var(--color-primary)' }} />
          </Box>
        ) : announcements.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 1 }}>
              Recent Announcements
            </Typography>
            {announcements.map((a, index) => (
              <Paper
                key={index}
                sx={{
                  p: 3,
                  bgcolor: 'var(--bg-glass-strong)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 1,
                  transition: 'all 0.2s',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: 'var(--shadow-md)',
                    borderColor: 'rgba(99, 102, 241, 0.3)'
                  }
                }}
              >
                {a.recipientType === 'all' && (
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #6366f1, #10b981)' }} />
                )}
                <Typography variant="h6" sx={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', mb: 1, lineHeight: 1.3 }}>
                  {a.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {a.message}
                </Typography>
                <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    size="small"
                    label={a.createdAt?.toDate ? new Date(a.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Just now'}
                    sx={{ height: 22, fontSize: '0.65rem', fontWeight: 600, bgcolor: 'var(--bg-main)' }}
                  />
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary" sx={{ textAlign: 'center', p: 4 }}>
            No announcements found.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default AdminHomePage;
