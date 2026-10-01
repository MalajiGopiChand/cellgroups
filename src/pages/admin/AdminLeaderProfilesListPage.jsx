import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Avatar, CircularProgress, IconButton, Chip } from '@mui/material';
import { Person as PersonIcon, Assessment as AssessmentIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { collection, onSnapshot } from 'firebase/firestore';
import { useHardwareBack } from '../../hooks/useHardwareBack';
import { db } from '../../firebase/config';
import AdminLeaderProfilePage from './AdminLeaderProfilePage';

function AdminLeaderProfilesListPage({ onBack }) {
  const [leadersData, setLeadersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeader, setSelectedLeader] = useState(null);

    useHardwareBack(!!selectedLeader, () => setSelectedLeader(null));

  useEffect(() => {
    const unsubLeaders = onSnapshot(collection(db, 'cellleaders'), (leaderSnap) => {
      const leaders = leaderSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort: Active (approved) first, then alphabetically
      leaders.sort((a, b) => {
        if (a.approved && !b.approved) return -1;
        if (!a.approved && b.approved) return 1;
        return (a.name || '').localeCompare(b.name || '');
      });
      setLeadersData(leaders);
      setLoading(false);
    });
    return () => unsubLeaders();
  }, []);

  const handleExport = () => {
    if (leadersData.length === 0) return;
    const exportData = leadersData.map(l => ({
      Name: l.name || 'Unknown',
      Phone: l.phone || 'N/A',
      Place: l.place || l.cellId || 'N/A',
      Status: l.approved ? 'Approved' : 'Pending'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cell Leaders");
    XLSX.writeFile(wb, `CellLeaders_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

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
                  opacity: leader.approved ? 1 : 0.6,
                  '&:hover': { borderColor: 'var(--primary-forest)', boxShadow: 'var(--shadow-md)', opacity: 1 }
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '16px !important' }}>
                  <Avatar sx={{ bgcolor: leader.approved ? 'var(--light-sage)' : 'var(--border-neutral)', color: leader.approved ? 'var(--primary-forest)' : 'var(--text-secondary)' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700} color="var(--text-deep)">{leader.name}</Typography>
                      {leader.approved ? (
                        <Chip label="Active" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700 }} />
                      ) : (
                        <Chip label="Pending" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: 'var(--border-neutral)', color: 'var(--text-secondary)', fontWeight: 700 }} />
                      )}
                    </Box>
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
