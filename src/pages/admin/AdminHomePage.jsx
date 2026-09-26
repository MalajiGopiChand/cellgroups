import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fade, CircularProgress, Chip, Dialog, DialogTitle, DialogContent, IconButton, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { Close as CloseIcon, Person as PersonIcon } from '@mui/icons-material';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Card, CardContent, Grid, Button } from '@mui/material';
import { Assessment as AssessmentIcon } from '@mui/icons-material';
import { getTuesdayWeekDetails } from '../../utils/dateUtils';

function AdminHomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leadersData, setLeadersData] = useState([]);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [leaderHistory, setLeaderHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    let unsubAnnouncements;
    let unsubLeaders;

    const fetchData = async () => {
      unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snap) => {
        setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const db_ = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return db_ - da;
          }));
      });

      unsubLeaders = onSnapshot(collection(db, 'cellleaders'), (leaderSnap) => {
        const leaders = leaderSnap.docs.map(d => ({ id: d.id, name: d.data().name }));
        setLeadersData(leaders);
        setLoading(false);
      });
    };

    fetchData();

    return () => {
      if (unsubAnnouncements) unsubAnnouncements();
      if (unsubLeaders) unsubLeaders();
    };
  }, []);

  const handleOpenProfile = async (leader) => {
    setSelectedLeader(leader);
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

  const handleCloseDialog = () => {
    setSelectedLeader(null);
    setSelectedStatus(null);
    setLeaderHistory([]);
  };

  return (
    
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* Cell Leaders List (Replaces Graph) */}
        {!loading && leadersData.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 2 }}>
              Cell Leader Profiles
            </Typography>
            <Grid container spacing={2}>
              {leadersData.map((leader, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card 
                    onClick={() => handleOpenProfile(leader)}
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
          </Box>
        )}

        {/* Leader Dashboard Dialog */}
        <Dialog open={!!selectedLeader} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2, height: '80vh' } }}>
          {selectedLeader && (
            <>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--primary-forest)' }}>{selectedLeader.name}'s Dashboard</Typography>
                  <Typography variant="body2" color="text.secondary">
                    All-time Performance & Attendance Records
                  </Typography>
                </Box>
                <IconButton onClick={handleCloseDialog} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.05)' }}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers sx={{ p: 0 }}>
                {historyLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
                ) : (
                  <Box sx={{ p: 3, bgcolor: 'var(--bg-main)', minHeight: '100%' }}>
                    
                    {/* Stats Summary */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
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

                    {/* Filters */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                      <Chip label="All Records" onClick={() => setSelectedStatus(null)} sx={{ fontWeight: 600, bgcolor: !selectedStatus ? 'var(--text-deep)' : 'var(--border-neutral)', color: !selectedStatus ? '#fff' : 'inherit' }} />
                      <Chip label="Presents Only" onClick={() => setSelectedStatus('present')} sx={{ fontWeight: 600, bgcolor: selectedStatus === 'present' ? '#10b981' : 'var(--border-neutral)', color: selectedStatus === 'present' ? '#fff' : 'inherit' }} />
                      <Chip label="Absents Only" onClick={() => setSelectedStatus('absent')} sx={{ fontWeight: 600, bgcolor: selectedStatus === 'absent' ? '#ef4444' : 'var(--border-neutral)', color: selectedStatus === 'absent' ? '#fff' : 'inherit' }} />
                    </Box>

                    {/* Detailed List */}
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
                )}
              </DialogContent>
            </>
          )}
        </Dialog>

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
