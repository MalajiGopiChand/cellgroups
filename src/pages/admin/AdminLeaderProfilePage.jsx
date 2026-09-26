import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Chip, List, ListItem, ListItemAvatar, Avatar, ListItemText, CircularProgress, IconButton } from '@mui/material';
import { Person as PersonIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { getTuesdayWeekDetails } from '../../utils/dateUtils';

function AdminLeaderProfilePage({ leader, onBack }) {
  const [leaderHistory, setLeaderHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const q = query(collection(db, 'memberAttendance'), where('leaderId', '==', leader.id));
        const snap = await getDocs(q);
        const history = snap.docs.map(d => d.data());
        history.sort((a,b) => new Date(b.date) - new Date(a.date));
        setLeaderHistory(history);
      } catch(e) {
        console.error(e);
      } finally {
        setHistoryLoading(false);
      }
    };
    if (leader) {
      fetchHistory();
    }
  }, [leader]);

  if (!leader) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, animation: 'fadeIn 0.3s' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <IconButton onClick={onBack} sx={{ bgcolor: 'var(--bg-glass-strong)', border: '1px solid var(--border-neutral)' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--primary-forest)' }}>
            {leader.name}'s Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Performance & Attendance Records
          </Typography>
        </Box>
      </Box>

      {historyLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Current Week Graph */}
          <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, border: '1px solid var(--border-light)' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-deep)', mb: 2 }}>
              Current Week Attendance
            </Typography>
            {(() => {
              const { tuesdayWeekStartDate } = getTuesdayWeekDetails();
              const currentWeekRecords = leaderHistory.filter(h => h.tuesdayWeekStartDate === tuesdayWeekStartDate);
              const presentCount = currentWeekRecords.filter(h => h.status === 'present').length;
              const absentCount = currentWeekRecords.filter(h => h.status === 'absent').length;
              
              if (currentWeekRecords.length === 0) {
                return <Typography color="text.secondary">No attendance taken yet this week.</Typography>;
              }

              const data = [
                { name: 'Present', value: presentCount, color: '#10b981' },
                { name: 'Absent', value: absentCount, color: '#ef4444' }
              ];

              return (
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', boxShadow: 'none' }}>
                        <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 800 }}>{presentCount}</Typography>
                        <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>Present this week</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', boxShadow: 'none' }}>
                        <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: 800 }}>{absentCount}</Typography>
                        <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600 }}>Absent this week</Typography>
                      </Paper>
                    </Box>
                  </Grid>
                </Grid>
              );
            })()}
          </Box>

          {/* Stats Summary (All Time) */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-deep)', mb: 2 }}>All-Time Summary</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, bgcolor: '#fff', border: '1px solid var(--border-light)' }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'var(--text-deep)' }}>{leaderHistory.length}</Typography>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Total Records</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#10b981' }}>{leaderHistory.filter(h => h.status === 'present').length}</Typography>
                  <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 600 }}>Total Presents</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#ef4444' }}>{leaderHistory.filter(h => h.status === 'absent').length}</Typography>
                  <Typography variant="subtitle2" sx={{ color: '#ef4444', fontWeight: 600 }}>Total Absents</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Detailed List */}
          <Box>
            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Chip label="All Records" onClick={() => setSelectedStatus(null)} sx={{ fontWeight: 600, bgcolor: !selectedStatus ? 'var(--text-deep)' : 'var(--border-neutral)', color: !selectedStatus ? '#fff' : 'inherit' }} />
              <Chip label="Presents Only" onClick={() => setSelectedStatus('present')} sx={{ fontWeight: 600, bgcolor: selectedStatus === 'present' ? '#10b981' : 'var(--border-neutral)', color: selectedStatus === 'present' ? '#fff' : 'inherit' }} />
              <Chip label="Absents Only" onClick={() => setSelectedStatus('absent')} sx={{ fontWeight: 600, bgcolor: selectedStatus === 'absent' ? '#ef4444' : 'var(--border-neutral)', color: selectedStatus === 'absent' ? '#fff' : 'inherit' }} />
            </Box>

            <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid var(--border-light)' }}>
              <List sx={{ p: 0 }}>
                {leaderHistory
                  .filter(h => !selectedStatus || h.status === selectedStatus)
                  .map((h, i) => (
                  <ListItem key={i} sx={{ borderBottom: '1px solid var(--border-light)', bgcolor: '#fff', '&:last-child': { borderBottom: 'none' } }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: h.status === 'present' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: h.status === 'present' ? '#10b981' : '#ef4444' }}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={<Typography fontWeight={700} color="var(--text-deep)">{h.name || h.studentName || h.memberName || 'Member'}</Typography>}
                      secondary={
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, color: 'text.secondary', fontWeight: 600 }}>
                          {h.date} {h.tuesdayWeekStartDate ? `(Week: ${h.tuesdayWeekStartDate})` : ''}
                        </Typography>
                      }
                    />
                    <Chip size="small" label={h.status === 'present' ? 'Present' : 'Absent'} sx={{ height: 24, fontWeight: 700, bgcolor: h.status === 'present' ? '#10b981' : '#ef4444', color: '#fff' }} />
                  </ListItem>
                ))}
                {leaderHistory.filter(h => !selectedStatus || h.status === selectedStatus).length === 0 && (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4, bgcolor: '#fff' }}>
                    No {selectedStatus || ''} records found.
                  </Typography>
                )}
              </List>
            </Paper>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default AdminLeaderProfilePage;
