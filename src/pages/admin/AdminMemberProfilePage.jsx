import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, IconButton, Grid, Chip } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Person as PersonIcon, Event as EventIcon, BarChart as BarChartIcon } from '@mui/icons-material';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function AdminMemberProfilePage({ member, onBack }) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!member) return;

    // Fetch member attendance
    const qAtt = query(
      collection(db, 'memberAttendance'),
      where('memberId', '==', member.id)
    );

    const unsub = onSnapshot(qAtt, (snap) => {
      const records = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort descending by date string
      records.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAttendance(records);
      setLoading(false);
    });

    return () => unsub();
  }, [member]);

  // Aggregate weekly data for the graph (last 12 weeks for example)
  const getWeeklyGraphData = () => {
    // Group by tuesdayWeekStartDate
    const grouped = {};
    attendance.forEach(r => {
      const week = r.tuesdayWeekStartDate || r.date; // fallback to date if week not set
      if (!grouped[week]) grouped[week] = { week, present: 0, absent: 0 };
      if (r.status === 'present') grouped[week].present++;
      else grouped[week].absent++;
    });

    return Object.values(grouped).sort((a, b) => new Date(a.week) - new Date(b.week)).slice(-12);
  };

  const graphData = getWeeklyGraphData();

  const totalPresent = attendance.filter(a => a.status === 'present').length;
  const totalAbsent = attendance.filter(a => a.status === 'absent').length;

  return (
    <Box sx={{ animation: 'fadeIn 0.3s' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={onBack} sx={{ bgcolor: 'var(--bg-glass-strong)', border: '1px solid var(--border-neutral)' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--primary-forest)' }}>
          Member Profile
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {/* Info Card */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'var(--bg-glass-strong)', borderRadius: 1, border: '1px solid var(--border-light)', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <PersonIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                    {member.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                    {member.relation || 'Member'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Cell Leader:</Typography>
                  <Typography variant="body2" fontWeight={700}>{member.cellLeaderName || 'Unassigned'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Place:</Typography>
                  <Typography variant="body2" fontWeight={700}>{member.place || 'Unknown'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Total Present:</Typography>
                  <Typography variant="body2" fontWeight={700} color="success.main">{totalPresent}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Total Absent:</Typography>
                  <Typography variant="body2" fontWeight={700} color="error.main">{totalAbsent}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Graph Card */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'var(--bg-glass-strong)', borderRadius: 1, border: '1px solid var(--border-light)' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <BarChartIcon /> Weekly Attendance
              </Typography>
              
              {graphData.length > 0 ? (
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                      <YAxis allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                      <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} stackId="a" />
                      <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', p: 4 }}>
                  No weekly data to display.
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Calendar / Records List */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'var(--bg-glass-strong)', borderRadius: 1, border: '1px solid var(--border-light)' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <EventIcon /> Attendance Calendar Records
              </Typography>

              {attendance.length > 0 ? (
                <Grid container spacing={2}>
                  {attendance.map((rec) => (
                    <Grid item xs={6} sm={4} md={3} key={rec.id}>
                      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, border: '1px solid var(--border-light)', boxShadow: 'none' }}>
                        <Typography variant="body2" fontWeight={700}>
                          {new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={rec.status.toUpperCase()} 
                          sx={{ 
                            bgcolor: rec.status === 'present' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            color: rec.status === 'present' ? '#10b981' : '#ef4444',
                            fontWeight: 800,
                            fontSize: '0.7rem'
                          }} 
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', p: 4 }}>
                  No attendance records found for {member.name}.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default AdminMemberProfilePage;
