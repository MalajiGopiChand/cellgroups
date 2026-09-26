import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Chip, Avatar, CircularProgress, IconButton, FormControl, InputLabel, Select, MenuItem, Divider } from '@mui/material';
import { Person as PersonIcon, ArrowBack as ArrowBackIcon, Event as EventIcon, BarChart as BarChartIcon, LocationOn as LocationIcon, Star as StarIcon } from '@mui/icons-material';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { getTuesdayWeekDetails } from '../../utils/dateUtils';
import AdminMemberProfilePage from './AdminMemberProfilePage';

function AdminLeaderProfilePage({ leader, onBack }) {
  const [leaderOwnHistory, setLeaderOwnHistory] = useState([]);
  const [groupHistory, setGroupHistory] = useState([]);
  const [reports, setReports] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  
  const { tuesdayWeekStartDate: currentWeek } = getTuesdayWeekDetails();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  useEffect(() => {
    if (!leader) return;

    let unsubOwn, unsubGroup, unsubMembers, unsubReports;

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

      // Reports from this leader
      const qReports = query(collection(db, 'reports'), where('leaderName', '==', leader.name));
      unsubReports = onSnapshot(qReports, (snap) => {
        setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
      if (unsubReports) unsubReports();
    };
  }, [leader]);

  if (!leader) return null;

  if (selectedMember) {
    return <AdminMemberProfilePage member={selectedMember} onBack={() => setSelectedMember(null)} />;
  }

  // Get unique weeks from groupHistory + leaderOwnHistory for the dropdown
  const allWeeks = [...new Set([
    ...groupHistory.map(h => h.tuesdayWeekStartDate).filter(Boolean),
    ...leaderOwnHistory.map(h => h.tuesdayWeekStartDate).filter(Boolean),
    ...reports.map(r => r.meetingDate).filter(Boolean),
    currentWeek
  ])].sort((a, b) => new Date(b) - new Date(a)); // Sort descending

  // Data for the selected week
  const weekGroupRecords = groupHistory.filter(h => h.tuesdayWeekStartDate === selectedWeek);
  const weekLeaderRecords = leaderOwnHistory.filter(h => h.tuesdayWeekStartDate === selectedWeek);
  const weekReports = reports.filter(r => r.meetingDate === selectedWeek);

  // Derived stats
  const presentCount = weekGroupRecords.filter(h => h.status === 'present').length;
  const absentCount = weekGroupRecords.filter(h => h.status === 'absent').length;
  const pieData = [
    { name: 'Present', value: presentCount, color: '#10b981' },
    { name: 'Absent', value: absentCount, color: '#ef4444' }
  ];

  // Try to find the meeting place for this week
  let meetingPlace = 'Unknown / Not Held';
  if (weekGroupRecords.length > 0 && weekGroupRecords[0].place) {
    meetingPlace = weekGroupRecords[0].place;
  } else if (weekLeaderRecords.length > 0 && weekLeaderRecords[0].place) {
    meetingPlace = weekLeaderRecords[0].place;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, animation: 'fadeIn 0.3s' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={onBack} sx={{ bgcolor: 'var(--bg-glass-strong)', border: '1px solid var(--border-neutral)' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--primary-forest)', lineHeight: 1.2 }}>
              {leader.name}'s Dashboard
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
              Comprehensive Weekly Overview
            </Typography>
          </Box>
        </Box>
        
        {/* Week Selector */}
        <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'var(--surface-white)', borderRadius: 1 }}>
          <InputLabel>Select Week</InputLabel>
          <Select
            value={selectedWeek}
            label="Select Week"
            onChange={(e) => setSelectedWeek(e.target.value)}
          >
            {allWeeks.map(week => (
              <MenuItem key={week} value={week}>
                Week of {new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {week === currentWeek ? ' (Current)' : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          
          <Grid container spacing={3}>
            {/* Leader's Own Attendance */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, border: '1px solid var(--border-light)', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-deep)', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon /> Leader's Attendance
                </Typography>
                
                {weekLeaderRecords.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {weekLeaderRecords.map((rec, i) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'var(--bg-main)', borderRadius: 1, border: '1px solid var(--border-light)' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Admin Marked</Typography>
                        </Box>
                        <Chip 
                          label={rec.status === 'present' ? 'Present' : 'Absent'} 
                          sx={{ 
                            fontWeight: 800, 
                            bgcolor: rec.status === 'present' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
                            color: rec.status === 'present' ? '#10b981' : '#ef4444' 
                          }} 
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'var(--bg-main)', border: '1px dashed var(--border-neutral)', boxShadow: 'none' }}>
                    <Typography color="text.secondary" variant="body2">
                      No personal attendance taken by Admin for this week.
                    </Typography>
                  </Paper>
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-deep)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon /> Meeting Place
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'var(--bg-main)', borderRadius: 1, border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 1.5, boxShadow: 'none' }}>
                  <Avatar sx={{ bgcolor: 'var(--primary-forest)', width: 32, height: 32 }}>
                    <LocationIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-deep)' }}>
                    {meetingPlace}
                  </Typography>
                </Paper>
              </Paper>
            </Grid>

            {/* Weekly Group Performance */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, border: '1px solid var(--border-light)', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-deep)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BarChartIcon /> Group Attendance Report
                </Typography>
                
                {weekGroupRecords.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                    <Typography color="text.secondary">No member attendance recorded for this week.</Typography>
                  </Box>
                ) : (
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                              {pieData.map((entry, index) => (
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
                          <Typography variant="h4" sx={{ color: '#10b981', fontWeight: 800 }}>{presentCount}</Typography>
                          <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>Members Present</Typography>
                        </Paper>
                        <Paper sx={{ p: 2, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', boxShadow: 'none' }}>
                          <Typography variant="h4" sx={{ color: '#ef4444', fontWeight: 800 }}>{absentCount}</Typography>
                          <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600 }}>Members Absent</Typography>
                        </Paper>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Members List with their Weekly Status */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, border: '1px solid var(--border-light)', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-deep)', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon /> Member Status
                    </Typography>
                    <Typography variant="caption" color="text.secondary">For selected week. Click a member for history</Typography>
                  </Box>
                  <Chip size="small" label={`${members.length} Total`} sx={{ fontWeight: 700 }} />
                </Box>

                {members.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {members.map(m => {
                      // Find their record for this week
                      const rec = weekGroupRecords.find(r => r.memberId === m.id || r.name.toLowerCase() === m.name.toLowerCase());
                      const status = rec ? rec.status : 'unrecorded';
                      
                      return (
                        <Paper 
                          key={m.id}
                          onClick={() => setSelectedMember(m)}
                          sx={{ 
                            p: 1.5, 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center', 
                            bgcolor: 'var(--bg-main)', 
                            borderRadius: 1, 
                            border: '1px solid var(--border-light)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'var(--primary-forest)',
                              bgcolor: '#fff',
                              boxShadow: 'var(--shadow-sm)',
                              transform: 'translateY(-1px)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(99,102,241,0.1)', color: 'var(--color-primary)' }}>
                              <PersonIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--text-deep)' }}>
                                {m.name}
                              </Typography>
                              {rec && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{rec.date}</Typography>}
                            </Box>
                          </Box>
                          
                          {status === 'present' && <Chip size="small" label="Present" sx={{ height: 22, fontWeight: 700, bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981' }} />}
                          {status === 'absent' && <Chip size="small" label="Absent" sx={{ height: 22, fontWeight: 700, bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444' }} />}
                          {status === 'unrecorded' && <Chip size="small" label="No Record" sx={{ height: 22, fontWeight: 600, bgcolor: 'var(--border-neutral)', color: 'var(--text-secondary)' }} />}
                        </Paper>
                      );
                    })}
                  </Box>
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>No members assigned to this leader yet.</Typography>
                )}
              </Paper>
            </Grid>

            {/* Reports and Testimonies for the Week */}
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, border: '1px solid var(--border-light)', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-deep)', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon /> Weekly Activity Report
                </Typography>
                
                {weekReports.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {weekReports.map(report => (
                      <Paper key={report.id} sx={{ p: 2, bgcolor: 'var(--bg-main)', border: '1px solid var(--border-light)', boxShadow: 'none' }}>
                        
                        {report.hasTestimony && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ color: 'var(--primary-forest)', fontWeight: 800 }}>Testimony</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{report.testimonyName}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>"{report.testimonyDetails}"</Typography>
                          </Box>
                        )}
                        
                        {report.hasVisitor && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ color: 'var(--primary-forest)', fontWeight: 800 }}>New Visitor</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{report.visitorName}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>Prayer: {report.visitorPrayer}</Typography>
                          </Box>
                        )}

                        {report.hasDiscussion && (
                          <Box>
                            <Typography variant="subtitle2" sx={{ color: 'var(--primary-forest)', fontWeight: 800 }}>Discussion</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{report.discussionTopic}</Typography>
                            <Typography variant="body2" color="text.secondary">"{report.discussionDetails}"</Typography>
                          </Box>
                        )}

                        {!report.hasTestimony && !report.hasVisitor && !report.hasDiscussion && (
                          <Typography variant="body2" color="text.secondary">Report submitted, but no special activities recorded.</Typography>
                        )}
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--bg-main)', border: '1px dashed var(--border-neutral)', boxShadow: 'none' }}>
                    <Typography color="text.secondary" variant="body2">
                      No activity reports or testimonies submitted for this week.
                    </Typography>
                  </Paper>
                )}
              </Paper>
            </Grid>
          </Grid>

        </Box>
      )}
    </Box>
  );
}

export default AdminLeaderProfilePage;
