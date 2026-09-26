import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Avatar, CircularProgress, IconButton } from '@mui/material';
import { Person as PersonIcon, Assessment as AssessmentIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminLeaderProfilePage from './AdminLeaderProfilePage';

function AdminLeaderProfilesListPage({ onBack }) {
  const [leadersData, setLeadersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeader, setSelectedLeader] = useState(null);

  useEffect(() => {
    const unsubLeaders = onSnapshot(collection(db, 'cellleaders'), (leaderSnap) => {
      const leaders = leaderSnap.docs.map(d => ({ id: d.id, name: d.data().name }));
      setLeadersData(leaders);
      setLoading(false);
    });
    return () => unsubLeaders();
  }, []);

  if (selectedLeader) {
    return <AdminLeaderProfilePage leader={selectedLeader} onBack={() => setSelectedLeader(null)} />;
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.3s' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={onBack} sx={{ bgcolor: 'var(--bg-glass-strong)', border: '1px solid var(--border-neutral)' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--primary-forest)' }}>
          Cell Leader Profiles
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : leadersData.length > 0 ? (
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
      ) : (
        <Typography color="text.secondary" sx={{ textAlign: 'center', p: 4 }}>
          No Cell Leaders found.
        </Typography>
      )}
    </Box>
  );
}

export default AdminLeaderProfilesListPage;
