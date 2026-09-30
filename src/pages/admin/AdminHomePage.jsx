import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Chip, Dialog, DialogTitle, DialogContent, IconButton, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getTuesdayWeekDetails } from '../../utils/dateUtils';
import { Close as CloseIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon } from '@mui/icons-material';
import HeadlessWeekSelector from '../../components/ui/HeadlessWeekSelector';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

function AdminHomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leadersData, setLeadersData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { tuesdayWeekStartDate: currentWeek } = getTuesdayWeekDetails();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  useEffect(() => {
    let unsubAnnouncements, unsubAttendance, unsubLeaders;

    const fetchData = async () => {
      unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snap) => {
        setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const db_ = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return db_ - da;
          }));
      });

      unsubAttendance = onSnapshot(collection(db, 'memberAttendance'), (snap) => {
        setAttendanceRecords(snap.docs.map(d => d.data()));
      });

      unsubLeaders = onSnapshot(collection(db, 'cellleaders'), (snap) => {
        setLeadersData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
    };

    fetchData();

    return () => {
      if (unsubAnnouncements) unsubAnnouncements();
      if (unsubAttendance) unsubAttendance();
      if (unsubLeaders) unsubLeaders();
    };
  }, []);

  const allWeeks = [...new Set([
    ...attendanceRecords.map(h => h.tuesdayWeekStartDate).filter(Boolean),
    currentWeek
  ])].sort((a, b) => new Date(b) - new Date(a));

  const weekRecords = attendanceRecords.filter(h => h.tuesdayWeekStartDate === selectedWeek);

  const graphData = leadersData.map(leader => {
    const leaderRecords = weekRecords.filter(r => r.leaderId === leader.id);
    return {
      name: leader.name || 'Unknown',
      Present: leaderRecords.filter(r => r.status === 'present').length,
      Absent: leaderRecords.filter(r => r.status === 'absent').length,
      Out: leaderRecords.filter(r => r.status === 'out').length,
    };
  }).filter(data => data.Present > 0 || data.Absent > 0 || data.Out > 0);

  const [selectedLeaderForDetails, setSelectedLeaderForDetails] = useState(null);

  const handleBarClick = (data) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      setSelectedLeaderForDetails(data.activePayload[0].payload);
    }
  };

  const closeDetails = () => setSelectedLeaderForDetails(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, animation: 'fadeIn 0.3s' }}>
      
      {/* Attendance Graph Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
            Weekly Group Attendance
          </Typography>
          <HeadlessWeekSelector 
            weeks={allWeeks} 
            selectedWeek={selectedWeek} 
            onSelect={setSelectedWeek} 
            currentWeek={currentWeek} 
          />
        </Box>
        
        <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'var(--bg-glass-strong)', borderRadius: 2, border: '1px solid var(--border-light)' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, textAlign: 'center' }}>
            Click on a bar to view detailed member attendance
          </Typography>
          {graphData.length > 0 ? (
            <Box sx={{ height: 350, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData} margin={{ top: 20, right: 30, left: -20, bottom: 60 }} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={{ stroke: '#e5e7eb' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={{ stroke: '#e5e7eb' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line type="monotone" dataKey="Present" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                  <Line type="monotone" dataKey="Absent" stroke="#ef4444" strokeWidth={3} activeDot={{ r: 8 }} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                  <Line type="monotone" dataKey="Out" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 8 }} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, bgcolor: 'var(--bg-main)', borderRadius: 1, border: '1px dashed var(--border-neutral)' }}>
              <Typography color="text.secondary" variant="body2">No attendance data for this week.</Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Announcements Feed */}
      <Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress sx={{ color: 'var(--color-primary)' }} />
          </Box>
        ) : announcements.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 1 }}>
              Recent Announcements
            </Typography>
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
        ) : (
          <Typography color="text.secondary" sx={{ textAlign: 'center', p: 4 }}>
            No announcements found.
          </Typography>
        )}
      </Box>

      {/* Details Dialog */}
      <Dialog open={Boolean(selectedLeaderForDetails)} onClose={closeDetails} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-deep)' }}>
            {selectedLeaderForDetails?.name}'s Group Attendance
          </Typography>
          <IconButton onClick={closeDetails} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLeaderForDetails && (() => {
            // Find the specific leader's records for the week
            const leaderObj = leadersData.find(l => l.name === selectedLeaderForDetails.name);
            const leaderRecords = leaderObj ? weekRecords.filter(r => r.leaderId === leaderObj.id) : [];
            
            if (leaderRecords.length === 0) {
               return <Typography>No records found.</Typography>;
            }

            return (
              <List>
                {leaderRecords.map((record, index) => (
                  <ListItem key={index} sx={{ bgcolor: 'var(--bg-main)', mb: 1, borderRadius: 1, border: '1px solid var(--border-light)' }}>
                    <ListItemIcon>
                      {record.status === 'present' ? <CheckCircleIcon sx={{ color: '#10b981' }} /> : record.status === 'absent' ? <CancelIcon sx={{ color: '#ef4444' }} /> : <Typography sx={{ color: '#f59e0b', fontWeight: 800, fontSize: '1.2rem', pl: 0.5 }}>O</Typography>}
                    </ListItemIcon>
                    <ListItemText 
                      primary={<Typography sx={{ fontWeight: 700 }}>{record.name || 'Unknown Member'}</Typography>}
                      secondary={record.status === 'present' ? 'Present' : record.status === 'absent' ? 'Absent' : 'Out'}
                      secondaryTypographyProps={{ color: record.status === 'present' ? '#10b981' : record.status === 'absent' ? '#ef4444' : '#f59e0b', fontWeight: 600 }}
                    />
                  </ListItem>
                ))}
              </List>
            );
          })()}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default AdminHomePage;
