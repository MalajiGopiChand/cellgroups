import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fade, CircularProgress, Chip } from '@mui/material';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { getTuesdayWeekDetails } from '../../utils/dateUtils';

function AdminHomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    let unsubAnnouncements;
    let unsubLeaders;
    let unsubAttendance;

    const fetchData = async () => {
      unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snap) => {
        setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const db_ = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return db_ - da;
          }));
      }, (error) => {
        console.error('Error fetching announcements:', error);
      });

      unsubLeaders = onSnapshot(collection(db, 'cellleaders'), (leaderSnap) => {
        const leaders = leaderSnap.docs.map(d => ({ id: d.id, name: d.data().name }));
        
        const { tuesdayWeekStartDate } = getTuesdayWeekDetails();
        const qAtt = query(collection(db, 'memberAttendance'), where('tuesdayWeekStartDate', '==', tuesdayWeekStartDate));
        
        unsubAttendance = onSnapshot(qAtt, (attSnap) => {
          const attendance = attSnap.docs.map(d => d.data());
          const data = leaders.map(leader => {
            const leaderAtts = attendance.filter(a => a.leaderId === leader.id);
            const presents = leaderAtts.filter(a => a.status === 'present').length;
            const absents = leaderAtts.filter(a => a.status === 'absent').length;
            return {
              name: leader.name,
              Present: presents,
              Absent: absents
            };
          });
          setChartData(data.filter(d => d.Present > 0 || d.Absent > 0));
          setLoading(false);
        });
      }, (error) => {
        console.error('Error fetching leaders:', error);
      });
    };

    fetchData();

    return () => {
      if (unsubAnnouncements) unsubAnnouncements();
      if (unsubLeaders) unsubLeaders();
      if (unsubAttendance) unsubAttendance();
    };
  }, []);

  return (
    
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>


        {/* Cell Leader Attendance Graph */}
        {!loading && chartData.length > 0 && (
          <Paper sx={{ p: 3, bgcolor: 'var(--bg-glass-strong)', backdropFilter: 'blur(12px)', borderRadius: 1, border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 3 }}>
              Member Attendance (Current Week)
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} allowDecimals={false} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
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
