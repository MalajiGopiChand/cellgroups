import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fade, CircularProgress, Chip } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

function AdminHomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(collection(db, 'announcements'));
        setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const db_ = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return db_ - da;
          }));
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <Fade in timeout={400}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>


        {/* Announcements Feed */}
        <Box>


          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress sx={{ color: 'var(--color-primary)' }} />
            </Box>
          ) : announcements.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {announcements.map((a, index) => (
                <Fade in timeout={400 + (index * 100)} key={a.id}>
                  <Paper
                    sx={{
                      p: 3,
                      bgcolor: 'var(--bg-glass-strong)',
                      backdropFilter: 'blur(12px)',
                      boxShadow: 'var(--shadow-sm)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 4,
                      transition: 'all 0.2s',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-2px)',
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
                </Fade>
              ))}
            </Box>
          ) : null}
        </Box>
      </Box>
    </Fade>
  );
}

export default AdminHomePage;
