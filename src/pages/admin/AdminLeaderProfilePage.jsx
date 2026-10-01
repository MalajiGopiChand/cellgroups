import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Chip, Avatar, CircularProgress, Divider, Button } from '@mui/material';
import { Person as PersonIcon, ArrowBack as ArrowBackIcon, Event as EventIcon, BarChart as BarChartIcon, LocationOn as LocationIcon, Star as StarIcon } from '@mui/icons-material';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { Download as DownloadIcon } from '@mui/icons-material';
import { getTuesdayWeekDetails } from '../../utils/dateUtils';
import AdminMemberProfilePage from './AdminMemberProfilePage';
import AnimatedButton from '../../components/ui/AnimatedButton';
import SplitText from '../../components/ui/SplitText';
import HeadlessWeekSelector from '../../components/ui/HeadlessWeekSelector';

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
      const qOwn = query(collection(db, 'leaderAttendance'), where('leaderId', '==', leader.id));
      unsubOwn = onSnapshot(qOwn, (snap) => {
        const history = snap.docs.map(d => d.data());
        history.sort((a,b) => new Date(b.date) - new Date(a.date));
        setLeaderOwnHistory(history);
      });

      const qGroup = query(collection(db, 'memberAttendance'), where('leaderId', '==', leader.id));
      unsubGroup = onSnapshot(qGroup, (snap) => {
        const history = snap.docs.map(d => d.data());
        history.sort((a,b) => new Date(b.date) - new Date(a.date));
        setGroupHistory(history);
      });

      const qReports = query(collection(db, 'reports'), where('leaderName', '==', leader.name));
      unsubReports = onSnapshot(qReports, (snap) => {
        setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });

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

  const allWeeks = [...new Set([
    ...groupHistory.map(h => h.tuesdayWeekStartDate).filter(Boolean),
    ...leaderOwnHistory.map(h => h.tuesdayWeekStartDate).filter(Boolean),
    ...reports.map(r => r.meetingDate).filter(Boolean),
    currentWeek
  ])].sort((a, b) => new Date(b) - new Date(a));

  const weekGroupRecords = groupHistory.filter(h => h.tuesdayWeekStartDate === selectedWeek);
  const weekLeaderRecords = leaderOwnHistory.filter(h => h.tuesdayWeekStartDate === selectedWeek);
  const weekReports = reports.filter(r => r.meetingDate === selectedWeek);

  const presentCount = weekGroupRecords.filter(h => h.status === 'present').length;
  const absentCount = weekGroupRecords.filter(h => h.status === 'absent').length;
  const pieData = [
    { name: 'Present', value: presentCount, color: '#10b981' },
    { name: 'Absent', value: absentCount, color: '#ef4444' }
  ];

  let meetingPlace = 'Unknown / Not Held';
  if (weekGroupRecords.length > 0 && weekGroupRecords[0].place) {
    meetingPlace = weekGroupRecords[0].place;
  } else if (weekLeaderRecords.length > 0 && weekLeaderRecords[0].place) {
    meetingPlace = weekLeaderRecords[0].place;
  }


  // Group members by family
  const familyGroups = {};
  members.forEach(m => {
    const fid = m.familyId || `single_${m.id}`;
    if (!familyGroups[fid]) familyGroups[fid] = [];
    familyGroups[fid].push(m);
  });

  const families = Object.values(familyGroups).map(group => {
    const head = group.find(m => m.isHead) || group[0];
    return {
      head,
      members: group,
      familyId: head.familyId || `single_${head.id}`,
    };
  });

  const handleExport = () => {
    if (members.length === 0) {
      alert("No members found for this leader.");
      return;
    }
    const exportData = members.map(m => ({
      'Family Group': m.familyId ? m.familyId : `Single_${m.id}`,
      Name: m.name || 'Unknown',
      Relation: m.relation || (m.isHead ? 'Head' : 'Member'),
      Phone: m.phone || 'N/A',
      Place: m.place || leader.place || 'N/A',
      'Leader Name': leader.name || 'Unknown'
    }));
    
    exportData.sort((a, b) => a['Family Group'].localeCompare(b['Family Group']));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    const fileName = (leader.name || 'Leader').replace(/\s+/g, '_') + '_Members_Export.xlsx';
    XLSX.writeFile(wb, fileName);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 }, animation: 'fadeIn 0.3s', pb: 4 }}>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        justifyContent: 'space-between', 
        gap: 2 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AnimatedButton 
            onClick={onBack} 
            sx={{ 
              minWidth: 'auto', 
              p: 1, 
              bgcolor: 'var(--surface-white)', 
              color: 'var(--text-deep)', 
              border: '1px solid var(--border-neutral)' 
            }}
          >
            <ArrowBackIcon />
          </AnimatedButton>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--primary-forest)', lineHeight: 1.2 }}>
              <SplitText text={`${leader.name}'s Dashboard`} delay={0.1} />
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
              Weekly Overview
            </Typography>
          </Box>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />} 
          onClick={handleExport}
          sx={{ bgcolor: 'var(--primary-forest)', '&:hover': { bgcolor: '#059669' }, borderRadius: 1 }}
        >
          Export Members
        </Button>
        
        {/* New HeadlessUI Menu Integration */}
        <Box sx={{ alignSelf: { xs: 'stretch', sm: 'center' }, display: 'flex', justifyContent: 'flex-end' }}>
          <HeadlessWeekSelector 
            weeks={allWeeks} 
            selectedWeek={selectedWeek} 
            onSelect={setSelectedWeek} 
            currentWeek={currentWeek} 
          />
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 4 } }}>
          
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#fff', borderRadius: 2, border: '1px solid var(--border-light)', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--text-deep)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon fontSize="small" sx={{ color: 'var(--primary-forest)' }} /> Leader's Attendance
                </Typography>
                
                {weekLeaderRecords.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {weekLeaderRecords.map((rec, i) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: 'var(--bg-main)', borderRadius: 1, border: '1px solid var(--border-light)' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Admin Marked</Typography>
                        </Box>
                        <Chip 
                          size="small"
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
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'var(--bg-main)', border: '1px dashed var(--border-neutral)', boxShadow: 'none' }}>
                    <Typography color="text.secondary" variant="body2">
                      No admin attendance this week.
                    </Typography>
                  </Paper>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--text-deep)', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon fontSize="small" sx={{ color: 'var(--primary-forest)' }} /> Meeting Place
                </Typography>
                <Paper sx={{ p: 1.5, bgcolor: 'var(--bg-main)', borderRadius: 1, border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 1.5, boxShadow: 'none' }}>
                  <Avatar sx={{ bgcolor: 'var(--primary-forest)', width: 28, height: 28 }}>
                    <LocationIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-deep)' }}>
                    {meetingPlace}
                  </Typography>
                </Paper>
              </Paper>
            </Grid>

            
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#fff', borderRadius: 2, border: '1px solid var(--border-light)', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--text-deep)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BarChartIcon fontSize="small" sx={{ color: 'var(--primary-forest)' }} /> Group Attendance Report
                </Typography>
                
                {weekGroupRecords.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 150, bgcolor: 'var(--bg-main)', borderRadius: 1, border: '1px dashed var(--border-neutral)' }}>
                    <Typography color="text.secondary" variant="body2">No member attendance recorded.</Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ height: { xs: 160, sm: 200 } }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
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
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'row', sm: 'column' }, gap: 1.5 }}>
                        <Paper sx={{ flex: 1, p: 1.5, bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', boxShadow: 'none', transition: 'all 0.2s', '&:hover': { transform: 'scale(1.02)' } }}>
                          <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 800 }}>{presentCount}</Typography>
                          <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>Present</Typography>
                        </Paper>
                        <Paper sx={{ flex: 1, p: 1.5, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', boxShadow: 'none', transition: 'all 0.2s', '&:hover': { transform: 'scale(1.02)' } }}>
                          <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: 800 }}>{absentCount}</Typography>
                          <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600 }}>Absent</Typography>
                        </Paper>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 2, sm: 3 }}>
            
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#fff', borderRadius: 2, border: '1px solid var(--border-light)', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ pr: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--text-deep)', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" sx={{ color: 'var(--primary-forest)' }} /> Member Status
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Tap member for history</Typography>
                  </Box>
                  <Chip size="small" label={`${members.length} Total`} sx={{ fontWeight: 700, flexShrink: 0, bgcolor: 'var(--bg-glass-strong)' }} />
                </Box>

                {families.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {families.map(family => (
                      <Box key={family.familyId}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', mb: 1, display: 'block', pl: 1 }}>
                          {family.head.name} Family
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {family.members.map(m => {
                            const rec = weekGroupRecords.find(r => r.memberId === m.id || (r.name && m.name && r.name.toLowerCase() === m.name.toLowerCase()));
                            const status = rec ? rec.status : 'unrecorded';
                            
                            return (
                              <Paper 
                                key={m.id}
                                onClick={() => setSelectedMember(m)}
                                sx={{ 
                                  p: 1.25, 
                                  display: 'flex', 
                                  justifyContent: 'space-between',
                                  alignItems: 'center', 
                                  bgcolor: 'var(--bg-main)', 
                                  borderRadius: 1, 
                                  border: '1px solid var(--border-light)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    transform: 'translateX(4px)',
                                    borderColor: 'var(--primary-forest)',
                                    bgcolor: 'var(--surface-white)'
                                  },
                                  '&:active': { bgcolor: 'var(--border-neutral)' }
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                                  <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(99,102,241,0.1)', color: 'var(--color-primary)' }}>
                                    <PersonIcon sx={{ fontSize: 16 }} />
                                  </Avatar>
                                  <Box sx={{ minWidth: 0, pr: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-deep)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {m.name}
                                    </Typography>
                                  </Box>
                                </Box>
                                
                                {status === 'present' && <Chip size="small" label="Present" sx={{ flexShrink: 0, height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981' }} />}
                                {status === 'absent' && <Chip size="small" label="Absent" sx={{ flexShrink: 0, height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444' }} />}
                                {status === 'out' && <Chip size="small" label="Out" sx={{ flexShrink: 0, height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b' }} />}
                                {status === 'unrecorded' && <Chip size="small" label="No Record" sx={{ flexShrink: 0, height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: 'var(--border-neutral)', color: 'var(--text-secondary)' }} />}
                              </Paper>
                            );
                          })}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center', p: 3 }}>No members assigned.</Typography>
                )}
              </Paper>
            </Grid>

            
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#fff', borderRadius: 2, border: '1px solid var(--border-light)', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--text-deep)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon fontSize="small" sx={{ color: 'var(--primary-forest)' }} /> Weekly Activity Report
                </Typography>
                
                {weekReports.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {weekReports.map(report => (
                      <Paper key={report.id} sx={{ p: 1.5, bgcolor: 'var(--bg-main)', border: '1px solid var(--border-light)', boxShadow: 'none' }}>
                        
                        {report.hasTestimony && (
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="caption" sx={{ color: 'var(--primary-forest)', fontWeight: 800, textTransform: 'uppercase' }}>Testimony</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{report.testimonyName}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.8rem' }}>"{report.testimonyDetails}"</Typography>
                          </Box>
                        )}
                        
                        {report.hasVisitor && (
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="caption" sx={{ color: 'var(--primary-forest)', fontWeight: 800, textTransform: 'uppercase' }}>New Visitor</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{report.visitorName}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.8rem' }}>Prayer: {report.visitorPrayer}</Typography>
                          </Box>
                        )}

                        {report.hasDiscussion && (
                          <Box>
                            <Typography variant="caption" sx={{ color: 'var(--primary-forest)', fontWeight: 800, textTransform: 'uppercase' }}>Discussion</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{report.discussionTopic}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>"{report.discussionDetails}"</Typography>
                          </Box>
                        )}

                        {!report.hasTestimony && !report.hasVisitor && !report.hasDiscussion && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>Report submitted, but no special activities recorded.</Typography>
                        )}
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'var(--bg-main)', border: '1px dashed var(--border-neutral)', boxShadow: 'none' }}>
                    <Typography color="text.secondary" variant="body2">
                      No activity reports submitted this week.
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
