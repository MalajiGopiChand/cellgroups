import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fade, Button, IconButton, Chip, CircularProgress } from '@mui/material';
import { ArrowBack as ArrowBackIcon, PersonOutline as PersonIcon } from '@mui/icons-material';
import { collection, getDocs, doc, setDoc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

function AdminLeaderAttendancePage({ onBack }) {
  const [leaders, setLeaders] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const q = query(collection(db, 'cellleaders'), where('approved', '==', true));
        const snap = await getDocs(q);
        setLeaders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Error fetching leaders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const ref = doc(db, 'leader_attendance', `admin_leaders_${selectedDate}`);
        const snap = await getDoc(ref);
        setAttendance(snap.exists() ? (snap.data().attendance || []) : []);
      } catch (error) {
        console.error('Error fetching leader attendance:', error);
      }
    };
    fetchAttendance();
  }, [selectedDate]);

  const handleMark = async (leaderId, leaderName, leaderPlace, status) => {
    const current = attendance.find(a => a.leaderId === leaderId);
    let newAttendance;
    if (current) {
      newAttendance = attendance.map(a => a.leaderId === leaderId ? { ...a, leaderId, name: leaderName, place: leaderPlace, status } : a);
    } else {
      newAttendance = [...attendance, { leaderId, name: leaderName, place: leaderPlace, status }];
    }
    setAttendance(newAttendance);
    await setDoc(doc(db, 'leader_attendance', `admin_leaders_${selectedDate}`), {
      date: selectedDate,
      attendance: newAttendance,
      updatedAt: new Date()
    }, { merge: true });
  };

  const getButtonStyles = (isSelected, type) => {
    const colorSuccess = 'var(--color-success)';
    const colorError = 'var(--color-error)';
    const baseColor = type === 'present' ? colorSuccess : colorError;
    const hoverBg = type === 'present' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)';
    const activeBg = type === 'present' ? 'var(--color-success)' : 'var(--color-error)';
    
    return {
      fontWeight: 600,
      textTransform: 'none',
      borderRadius: 2,
      padding: '4px 12px',
      minWidth: '75px',
      fontSize: '0.875rem',
      bgcolor: isSelected ? activeBg : 'transparent',
      color: isSelected ? '#fff' : 'var(--text-secondary)',
      border: isSelected ? '1px solid transparent' : '1px solid var(--border-light)',
      boxShadow: isSelected ? `0 4px 12px ${type === 'present' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` : 'none',
      '&:hover': { 
        bgcolor: isSelected ? (type === 'present' ? '#059669' : '#dc2626') : hoverBg, 
        color: isSelected ? '#fff' : baseColor 
      }
    };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </Box>
    );
  }

  return (
    <Fade in timeout={350}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {onBack && (
            <IconButton 
              onClick={onBack} 
              sx={{ 
                bgcolor: 'var(--bg-glass-strong)', 
                border: '1px solid var(--border-light)', 
                boxShadow: 'var(--shadow-sm)',
                '&:hover': { bgcolor: 'var(--bg-surface)' } 
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>Take Leader Attendance</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ mr: 1.5, fontWeight: 700, color: 'var(--text-secondary)' }}>Date:</Typography>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', fontFamily: 'inherit', fontWeight: 600 }} 
          />
        </Box>

        {leaders.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                bgcolor: 'var(--bg-glass-strong)',
                backdropFilter: 'blur(12px)',
                boxShadow: 'var(--shadow-sm)', 
                border: '1px solid var(--border-light)',
                borderRadius: 4
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--color-primary)', mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon sx={{ fontSize: 18 }} />
                All Active Cell Leaders ({leaders.length})
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {leaders.map(leader => {
                  const lRec = attendance.find(a => a.leaderId === leader.id);
                  const lStatus = lRec?.status || null;

                  return (
                    <Box 
                      key={leader.id} 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1,
                        borderBottom: '1px solid var(--border-light)',
                        '&:last-child': { borderBottom: 'none', pb: 0 }
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography fontWeight={700} sx={{ color: 'var(--text-primary)' }}>
                          {leader.name}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={leader.place} 
                          sx={{ 
                            height: 18, 
                            fontSize: '0.65rem', 
                            fontWeight: 700,
                            bgcolor: 'rgba(99,102,241,0.08)',
                            color: 'var(--color-primary)'
                          }} 
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          size="small" 
                          onClick={() => handleMark(leader.id, leader.name, leader.place, 'present')}
                          sx={getButtonStyles(lStatus === 'present', 'present')}
                        >
                          Present
                        </Button>
                        <Button 
                          size="small" 
                          onClick={() => handleMark(leader.id, leader.name, leader.place, 'absent')}
                          sx={getButtonStyles(lStatus === 'absent', 'absent')}
                        >
                          Absent
                        </Button>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Box>
        ) : (
          <Typography color="text.secondary">No active cell leaders found.</Typography>
        )}
      </Box>
    </Fade>
  );
}

export default AdminLeaderAttendancePage;
