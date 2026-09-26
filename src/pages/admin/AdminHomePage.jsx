import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Chip, Grid, Card, CardContent, Avatar } from '@mui/material';
import { Person as PersonIcon, Assessment as AssessmentIcon } from '@mui/icons-material';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminLeaderProfilePage from './AdminLeaderProfilePage';

function AdminHomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [leadersData, setLeadersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeader, setSelectedLeader] = useState(null);

  useEffect(() => {
    let unsubAnnouncements;
    let unsubLeaders;

    const fetchData = async () => {
      unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snap) => {
        setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const db_ = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return db_ - da;
          }));
      });

      unsubLeaders = onSnapshot(collection(db, 'cellleaders'), (leaderSnap) => {
        const leaders = leaderSnap.docs.map(d => ({ id: d.id, name: d.data().name }));
        setLeadersData(leaders);
        setLoading(false);
      });
    };

    fetchData();

    return () => {
      if (unsubAnnouncements) unsubAnnouncements();
      if (unsubLeaders) unsubLeaders();
    };
  }, []);

  if (selectedLeader) {
    return <AdminLeaderProfilePage leader={selectedLeader} onBack={() => setSelectedLeader(null)} />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Cell Leaders List */}
      {!loading && leadersData.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 3 }}>
            Cell Leader Profiles
          </Typography>
          <Grid container spacing={2}>
            {leadersData.map((leader, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card 
                  onClick={() => setSelectedLeader(leader)}
                  sx={{ 
                    cursor: 'pointer', borderRadius: 2, border: '1px solid var(--border-neutral)', 
                    bgcolor: 'var(--bg-glass-strong)', transition: 'all 0.2s',
                    '&:hover': { borderColor: 'var(--primary-forest)', boxShadow: 'var(--shadow-md)' }
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '16px !important' }}>
                    <Avatar sx={{ bgcolor: 'var(--light-sage)', color: 'var(--primary-forest)' }}>
                      <PersonIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700} color="var(--text-deep)">{leader.name}</Typography>
                      <Typography variant="caption" color="text.secondary">View Performance Dashboard</Typography>
                    </Box>
                    <AssessmentIcon sx={{ color: 'var(--text-secondary)' }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Announcements Feed */}
      <Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress sx={{ color: 'var(--color-primary)' }} />
          </Box>
        ) : announcements.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
        ) : null}
      </Box>
    </Box>
  );
}

export default AdminHomePage;
