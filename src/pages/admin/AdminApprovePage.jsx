import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, IconButton, Fade, Chip, CircularProgress } from '@mui/material';
import { DeleteOutline as DeleteIcon, ThumbUpOutlined as ApproveIcon, PersonOutline as PersonIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

function AdminApprovePage({ onBack }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(collection(db, 'cellleaders'));
        setLeaders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Error fetching leaders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleApprove = async (id) => {
    try {
      await updateDoc(doc(db, 'cellleaders', id), { approved: true, approvedAt: new Date() });
      setLeaders(prev => prev.map(l => l.id === id ? { ...l, approved: true } : l));
    } catch (error) {
      console.error('Error approving leader:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this Cell Leader and ALL their associated data (members, attendance, alerts)? This cannot be undone.')) return;
    try {
      // 1. Delete Cell Leader profile
      await deleteDoc(doc(db, 'cellleaders', id));
      
      // 2. Cascade Delete: Students
      const qStudents = query(collection(db, 'students'), where('cellLeaderId', '==', id));
      const snapStudents = await getDocs(qStudents);
      const deleteStudents = snapStudents.docs.map(d => deleteDoc(d.ref));
      
      // 3. Cascade Delete: Attendance logs
      const qAttendance = query(collection(db, 'attendance'), where('cellLeaderId', '==', id));
      const snapAttendance = await getDocs(qAttendance);
      const deleteAttendance = snapAttendance.docs.map(d => deleteDoc(d.ref));
      
      // 4. Cascade Delete: Announcements specifically for them
      const qAnnouncements = query(collection(db, 'announcements'), where('cellLeaderId', '==', id));
      const snapAnnouncements = await getDocs(qAnnouncements);
      const deleteAnnouncements = snapAnnouncements.docs.map(d => deleteDoc(d.ref));
      
      // Execute all cleans concurrently
      await Promise.all([...deleteStudents, ...deleteAttendance, ...deleteAnnouncements]);

      setLeaders(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      console.error('Error deleting leader and nested data:', error);
    }
  };

  const pending = leaders.filter(l => !l.approved);
  const approved = leaders.filter(l => l.approved);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </Box>
    );
  }

  return (
    <Fade in timeout={400}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Pending Section */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            {onBack && (
              <IconButton 
                onClick={onBack} 
                sx={{ 
                  bgcolor: 'var(--bg-glass-strong)', 
                  border: '1px solid var(--border-light)', 
                  boxShadow: 'var(--shadow-sm)' 
                }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
              Pending Approvals
            </Typography>
            <Chip 
              label={pending.length} 
              size="small" 
              sx={{ 
                bgcolor: pending.length > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(148, 163, 184, 0.1)', 
                color: pending.length > 0 ? 'error.main' : 'var(--text-secondary)',
                fontWeight: 700 
              }} 
            />
          </Box>
          
          {pending.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {pending.map((l, idx) => (
                <Fade in timeout={300 + (idx * 100)} key={l.id}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between', 
                      alignItems: { xs: 'flex-start', sm: 'center' }, 
                      gap: 2,
                      bgcolor: 'var(--bg-glass-strong)', 
                      backdropFilter: 'blur(12px)',
                      borderRadius: 4,
                      border: '1px solid var(--border-light)',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.2s ease',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 'var(--shadow-md)', borderColor: 'rgba(239, 68, 68, 0.4)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'error.main' }}>
                        <PersonIcon />
                      </Box>
                      <Box>
                        <Typography fontWeight={700} sx={{ color: 'var(--text-primary)' }}>{l.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 0.5 }}>{l.email}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip size="small" label={l.place} sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'var(--bg-main)' }} />
                          <Chip size="small" label={l.phone} sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'var(--bg-main)' }} />
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                      <Button 
                        variant="contained" 
                        fullWidth={false}
                        startIcon={<ApproveIcon />}
                        onClick={() => handleApprove(l.id)}
                        sx={{ 
                          bgcolor: 'var(--color-success)', 
                          borderRadius: 3, 
                          textTransform: 'none', 
                          fontWeight: 600,
                          flexGrow: { xs: 1, sm: 0 },
                          boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                          '&:hover': { bgcolor: '#059669', boxShadow: '0 6px 16px rgba(16,185,129,0.4)' }
                        }}
                      >
                        Approve
                      </Button>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(l.id)} 
                        sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 3, '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                </Fade>
              ))}
            </Box>
          ) : (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--bg-glass-strong)', borderRadius: 4, border: '1px dashed var(--border-light)' }}>
              <Typography sx={{ color: 'var(--text-tertiary)' }}>No new leaders pending approval.</Typography>
            </Paper>
          )}
        </Box>

        {/* Approved Section */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
              Active Leaders
            </Typography>
            <Chip 
              label={approved.length} 
              size="small" 
              sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', fontWeight: 700 }} 
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {approved.map((l, idx) => (
              <Fade in timeout={400 + (idx * 50)} key={l.id}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    bgcolor: 'var(--bg-glass-strong)', 
                    backdropFilter: 'blur(12px)',
                    borderRadius: 3, 
                    border: '1px solid var(--border-light)',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'rgba(16, 185, 129, 0.4)', bgcolor: 'var(--bg-surface)' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
                      <PersonIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography fontWeight={600} sx={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>{l.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>{l.place} • {l.phone}</Typography>
                    </Box>
                  </Box>
                  <IconButton 
                    color="error" 
                    size="small" 
                    onClick={() => handleDelete(l.id)} 
                    title="Remove Leader"
                    sx={{ opacity: 0.6, '&:hover': { opacity: 1, bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              </Fade>
            ))}
            
            {approved.length === 0 && (
              <Typography variant="body2" sx={{ color: 'var(--text-tertiary)', pl: 1 }}>No active leaders found.</Typography>
            )}
          </Box>
        </Box>

      </Box>
    </Fade>
  );
}

export default AdminApprovePage;
