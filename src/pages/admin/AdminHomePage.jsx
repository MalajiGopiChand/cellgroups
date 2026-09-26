import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fade, CircularProgress, Chip, Dialog, DialogTitle, DialogContent, IconButton, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { Close as CloseIcon, Person as PersonIcon } from '@mui/icons-material';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Card, CardContent, Grid, Button } from '@mui/material';
import { Assessment as AssessmentIcon } from '@mui/icons-material';
import { getTuesdayWeekDetails } from '../../utils/dateUtils';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import AdminLeaderProfilePage from './AdminLeaderProfilePage';

function AdminHomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [churchStats, setChurchStats] = useState({ present: 0, absent: 0 });

  useEffect(() => {
    let unsubAnnouncements;
    let unsubAttendance;

    const fetchData = async () => {
      unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snap) => {
        setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const db_ = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return db_ - da;
          }));
      });

      const { tuesdayWeekStartDate } = getTuesdayWeekDetails();
      const qAtt = query(collection(db, 'memberAttendance'), where('tuesdayWeekStartDate', '==', tuesdayWeekStartDate));
      unsubAttendance = onSnapshot(qAtt, (snap) => {
        let present = 0;
        let absent = 0;
        snap.forEach(doc => {
          if (doc.data().status === 'present') present++;
          if (doc.data().status === 'absent') absent++;
        });
        setChurchStats({ present, absent });
        setLoading(false);
      });
    };

    fetchData();

    return () => {
      if (unsubAnnouncements) unsubAnnouncements();
      if (unsubAttendance) unsubAttendance();
    };
  }, []);

  const handleOpenProfile = (leader) => {
    setSelectedLeader(leader);
  };

  const handleCloseDialog = () => {
    setSelectedLeader(null);
    setSelectedStatus(null);
    setLeaderHistory([]);
  };

  if (selectedLeader) {
    return <AdminLeaderProfilePage leader={selectedLeader} onBack={() => setSelectedLeader(null)} />;
  }

  return (
    
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                {/* Overall Church Stats (Current Week) */}
        {!loading && (
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'var(--bg-glass-strong)', backdropFilter: 'blur(12px)', borderRadius: 2, border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 3 }}>
              Total Church Attendance (This Week)
            </Typography>
            {(churchStats.present === 0 && churchStats.absent === 0) ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No attendance taken yet this week.</Typography>
            ) : (
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Box sx={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={[
                            { name: 'Present', value: churchStats.present, color: '#10b981' },
                            { name: 'Absent', value: churchStats.absent, color: '#ef4444' }
                          ]} 
                          cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value"
                        >
                          {[
                            { name: 'Present', value: churchStats.present, color: '#10b981' },
                            { name: 'Absent', value: churchStats.absent, color: '#ef4444' }
                          ].map((entry, index) => (
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
                      <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 800 }}>{churchStats.present}</Typography>
                      <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>Total Present</Typography>
                    </Paper>
                    <Paper sx={{ p: 2, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', boxShadow: 'none' }}>
                      <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: 800 }}>{churchStats.absent}</Typography>
                      <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600 }}>Total Absent</Typography>
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            )}
          </Paper>
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


