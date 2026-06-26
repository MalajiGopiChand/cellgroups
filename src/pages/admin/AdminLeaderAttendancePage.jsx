import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Box, Typography, Paper, Fade, Button, IconButton, Chip, CircularProgress, Snackbar, Alert } from '@mui/material';
import { ArrowBack as ArrowBackIcon, PersonOutline as PersonIcon } from '@mui/icons-material';
import { collection, getDocs, doc, setDoc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

function AdminLeaderAttendancePage({ onBack }) {
  const [leaders, setLeaders] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [loading, setLoading] = useState(true);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const printRef = useRef(null);

  const handleDownload = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, { backgroundColor: '#ffffff', scale: 2 });
      const data = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = data;
      link.download = `Leader_Attendance_${selectedDate}.png`;
      link.click();
    } catch (e) {
      console.error('Failed to generate image:', e);
    }
  };

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
      setAttendance([]); // Clear data instantly when date changes
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
    // Auto-save instantly so data is not lost if date changes
    await setDoc(doc(db, 'leader_attendance', `admin_leaders_${selectedDate}`), {
      date: selectedDate,
      attendance: newAttendance,
      updatedAt: new Date()
    }, { merge: true });
  };

  const handleSave = async () => {
    if (attendance.length > 0) {
      await setDoc(doc(db, 'leader_attendance', `admin_leaders_${selectedDate}`), {
        date: selectedDate,
        attendance: attendance,
        updatedAt: new Date()
      }, { merge: true });
      setShowSnackbar(true);
    }
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
          <Button 
            variant="contained" 
            size="small" 
            onClick={handleDownload}
            sx={{ ml: 2, bgcolor: 'var(--color-primary)', borderRadius: 2, fontWeight: 700 }}
          >
            Download IMG
          </Button>
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

            {/* Submit Button */}
            {attendance.length > 0 && (
              <Button 
                variant="contained"
                fullWidth
                onClick={handleSave}
                sx={{ mt: 1, py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', bgcolor: 'var(--color-success)', '&:hover': { bgcolor: '#059669' } }}
              >
                Save Attendance
              </Button>
            )}
          </Box>
        ) : (
          <Typography color="text.secondary">No active cell leaders found.</Typography>
        )}

        {/* Hidden Printable Area */}
        <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
          <div ref={printRef} style={{ width: 800, padding: '30px', background: '#fff', color: '#000', fontFamily: 'sans-serif' }}>
            <h2 style={{ color: '#6366f1', marginBottom: '20px' }}>Bethel Leader Attendance - {selectedDate}</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px' }}>Name</th>
                  <th style={{ padding: '12px 16px' }}>Place</th>
                  <th style={{ padding: '12px 16px' }}>Phone Number</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map(leader => {
                  const lRec = attendance.find(a => a.leaderId === leader.id);
                  const lStatus = lRec?.status || 'Not Marked';
                  const statusColor = lStatus === 'present' ? '#10b981' : (lStatus === 'absent' ? '#ef4444' : '#6b7280');
                  
                  return (
                    <tr key={leader.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{leader.name}</td>
                      <td style={{ padding: '12px 16px' }}>{leader.place}</td>
                      <td style={{ padding: '12px 16px' }}>{leader.phone || 'N/A'}</td>
                      <td style={{ padding: '12px 16px', color: statusColor, fontWeight: 'bold', textTransform: 'capitalize' }}>{lStatus}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <Snackbar 
          open={showSnackbar} 
          autoHideDuration={3000} 
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setShowSnackbar(false)} severity="success" sx={{ width: '100%', fontWeight: 700, borderRadius: 2 }}>
            Attendance saved successfully for {selectedDate}!
          </Alert>
        </Snackbar>

      </Box>
    </Fade>
  );
}

export default AdminLeaderAttendancePage;
