import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Chip, Avatar, CircularProgress, IconButton } from '@mui/material';
import { Person as PersonIcon, ArrowBack as ArrowBackIcon, Event as EventIcon, BarChart as BarChartIcon } from '@mui/icons-material';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { getTuesdayWeekDetails } from '../../utils/dateUtils';
import AdminMemberProfilePage from './AdminMemberProfilePage';

function AdminLeaderProfilePage({ leader, onBack }) {
  const [leaderOwnHistory, setLeaderOwnHistory] = useState([]);
  const [groupHistory, setGroupHistory] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    if (!leader) return;

    let unsubOwn, unsubGroup, unsubMembers;

    const fetchData = async () => {
      // Leader's own attendance
      const qOwn = query(collection(db, 'leaderAttendance'), where('leaderId', '==', leader.id));
      unsubOwn = onSnapshot(qOwn, (snap) => {
        const history = snap.docs.map(d => d.data());
        history.sort((a,b) => new Date(b.date) - new Date(a.date));
        setLeaderOwnHistory(history);
      });

      // Group's member attendance
      const qGroup = query(collection(db, 'memberAttendance'), where('leaderId', '==', leader.id));
      unsubGroup = onSnapshot(qGroup, (snap) => {
        const history = snap.docs.map(d => d.data());
        history.sort((a,b) => new Date(b.date) - new Date(a.date));
        setGroupHistory(history);
      });

      // Members under this leader
      const qMembers = query(collection(db, 'students'), where('cellLeaderId', '==', leader.id));
      unsubMembers = onSnapshot(qMembers, (snap) => {
        setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
    };

    fetchData();

    return () => {
      if (unsubOwn) unsubOwn();
      if (unsubGroup) unsubGroup();
      if (unsubMembers) unsubMembers();
    };
  }, [leader]);

  if (!leader) return null;

  if (selectedMember) {
    return <AdminMemberProfilePage member={selectedMember} onBack={() => setSelectedMember(null)} />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, animation: 'fadeIn 0.3s' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <IconButton onClick={onBack} sx={{ bgcolor: 'var(--bg-glass-strong)', border: '1px solid var(--border-neutral)' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--primary-forest)', lineHeight: 1.2 }}>
            {leader.name}'s Profile
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
            Cell Leader Dashboard
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          
          <Grid container spacing={3}>
            {/* Leader's Own Attendance */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, border: '1px solid var(--border-light)', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-deep)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon /> Leader's Attendance
                </Typography>
                
                {leaderOwnHistory.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {leaderOwnHistory.slice(0, 5).map((rec, i) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: 'var(--bg-main)', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {new Date(rec.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={rec.status === 'present' ? 'Present' : 'Absent'} 
                          sx={{ 
                            height: 20, fontSize: '0.65rem', fontWeight: 700, 
                            bgcolor: rec.status === 'present' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
                            color: rec.status === 'present' ? '#10b981' : '#ef4444' 
                          }} 
                        />
                      </Box>
                    ))}
                    {leaderOwnHistory.length > 5 && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', mt: 1 }}>
                        Showing last 5 records
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
                    No personal attendance taken by Admin yet.
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Current Week Group Performance */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, border: '1px solid var(--border-light)', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-deep)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BarChartIcon /> Group Performance (Current Week)
                </Typography>
                {(() => {
                  const { tuesdayWeekStartDate } = getTuesdayWeekDetails();
                  const currentWeekRecords = groupHistory.filter(h => h.tuesdayWeekStartDate === tuesdayWeekStartDate);
                  const presentCount = currentWeekRecords.filter(h => h.status === 'present').length;
                  const absentCount = currentWeekRecords.filter(h => h.status === 'absent').length;
                  
                  if (currentWeekRecords.length === 0) {
                    return <Typography color="text.secondary" sx={{ p: 3 }}>No member attendance taken yet this week.</Typography>;
                  }

                  const data = [
                    { name: 'Present', value: presentCount, color: '#10b981' },
                    { name: 'Absent', value: absentCount, color: '#ef4444' }
                  ];

                  return (
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ height: 180 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
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
                            <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>Members Present</Typography>
                          </Paper>
                          <Paper sx={{ p: 2, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', boxShadow: 'none' }}>
                            <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: 800 }}>{absentCount}</Typography>
                            <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600 }}>Members Absent</Typography>
                          </Paper>
                        </Box>
                      </Grid>
                    </Grid>
                  );
                })()}
              </Paper>
            </Grid>
          </Grid>

          {/* Members List */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-deep)' }}>
                Assigned Members ({members.length})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click a member to view their individual report
              </Typography>
            </Box>

            {members.length > 0 ? (
              <Grid container spacing={2}>
                {members.map(m => (
                  <Grid item xs={12} sm={6} md={4} key={m.id}>
                    <Paper 
                      onClick={() => setSelectedMember(m)}
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        bgcolor: 'var(--bg-glass-strong)', 
                        borderRadius: 1, 
                        border: '1px solid var(--border-light)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'var(--primary-forest)',
                          boxShadow: 'var(--shadow-sm)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: 'var(--color-primary)' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--text-deep)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {m.place || 'Unknown Location'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--bg-glass-strong)', border: '1px dashed var(--border-light)' }}>
                <Typography color="text.secondary">No members assigned to this leader yet.</Typography>
              </Paper>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default AdminLeaderProfilePage;
