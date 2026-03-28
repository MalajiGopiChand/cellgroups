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
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 2 }}>
          Announcements
        </Typography>
        {announcements.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {announcements.map(a => (
              <Paper 
                key={a.id} 
                elevation={0}
                sx={{ 
                  p: 3, 
                  bgcolor: 'var(--bg-glass-strong)', 
                  backdropFilter: 'blur(12px)',
                  borderRadius: 4,
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 'var(--shadow-md)', borderColor: 'rgba(99,102,241,0.3)' }
                }}
              >
                {/* Decorative side accent */}
                <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: a.recipientType === 'all' ? 'var(--color-success)' : 'var(--color-primary)' }} />
                <Typography variant="h6" sx={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', mb: 1, lineHeight: 1.3 }}>{a.title}</Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{a.message}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--text-tertiary)', px: 1.5, py: 0.5, bgcolor: 'rgba(148, 163, 184, 0.1)', borderRadius: 999, mt: 2, display: 'inline-block' }}>
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
