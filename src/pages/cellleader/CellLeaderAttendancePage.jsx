import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fade, Button, IconButton } from '@mui/material';
import { collection, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function CellLeaderAttendancePage({ user, onBack }) {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetch = async () => {
      if (!user?.id) return;
      const q = query(collection(db, 'students'), where('cellLeaderId', '==', user.id));
      const snap = await getDocs(q);
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(m => m.place === user?.place));
    };
    fetch();
  }, [user?.id, user?.place]);

  useEffect(() => {
    const fetch = async () => {
      if (!user?.id) return;
      const ref = doc(db, 'attendance', `${user.id}_${user.place}_${selectedDate}`);
      const snap = await getDoc(ref);
      setAttendance(snap.exists() ? (snap.data().attendance || []) : []);
    };
    fetch();
  }, [user?.id, user?.place, selectedDate]);

  const handleMark = async (member, status) => {
    const memberId = member.id || member.name;
    const memberName = member.name;
    const current = attendance.find(a => a.studentId === memberId || a.name === memberName);
    let newAttendance;
    if (current) {
      newAttendance = attendance.map(a => (a.studentId === memberId || a.name === memberName) ? { ...a, studentId: memberId, name: memberName, status } : a);
    } else {
      newAttendance = [...attendance, { studentId: memberId, name: memberName, status }];
    }
    setAttendance(newAttendance);
    await setDoc(doc(db, 'attendance', `${user.id}_${user.place}_${selectedDate}`), {
      cellLeaderId: user.id,
      place: user.place,
      date: selectedDate,
      attendance: newAttendance,
      updatedAt: new Date()
    }, { merge: true });
  };

  return (
    <Fade in timeout={350}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <IconButton 
            onClick={onBack ? onBack : () => navigate('/cellleader/dashboard')} 
            sx={{ 
              bgcolor: 'var(--bg-glass-strong)', 
              border: '1px solid var(--border-light)', 
              boxShadow: 'var(--shadow-sm)',
              '&:hover': { bgcolor: 'var(--bg-surface)' } 
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>Take Attendance</Typography>
        </Box>
        <Typography variant="body2" color="var(--text-secondary)" sx={{ mb: 3, fontWeight: 600 }}>{user?.name} • {user?.place}</Typography>
        
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ mr: 1.5, fontWeight: 700, color: 'var(--text-secondary)' }}>Date:</Typography>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', fontFamily: 'inherit', fontWeight: 600 }} />
        </Box>
        {members.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {members.map(member => {
              const rec = attendance.find(a => a.studentId === (member.id || member.name) || a.name === member.name);
              const status = rec?.status || null;
              return (
                <Paper 
                  key={member.id} 
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    bgcolor: 'var(--bg-glass-strong)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: 'var(--shadow-sm)', 
                    border: '1px solid var(--border-light)',
                    borderRadius: 3,
                    mb: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 'var(--shadow-md)', borderColor: 'rgba(99,102,241,0.2)' }
                  }}
                >
                  <Typography fontWeight={700} sx={{ color: 'var(--text-primary)' }}>{member.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      size="small" 
                      onClick={() => handleMark(member, 'present')}
                      sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        bgcolor: status === 'present' ? 'var(--color-success)' : 'transparent',
                        color: status === 'present' ? '#fff' : 'var(--text-secondary)',
                        border: status === 'present' ? '1px solid transparent' : '1px solid var(--border-light)',
                        boxShadow: status === 'present' ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
                        '&:hover': { bgcolor: status === 'present' ? '#059669' : 'rgba(16,185,129,0.1)', color: status === 'present' ? '#fff' : 'var(--color-success)' }
                      }}
                    >
                      Present
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => handleMark(member, 'absent')}
                      sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        bgcolor: status === 'absent' ? 'var(--color-error)' : 'transparent',
                        color: status === 'absent' ? '#fff' : 'var(--text-secondary)',
                        border: status === 'absent' ? '1px solid transparent' : '1px solid var(--border-light)',
                        boxShadow: status === 'absent' ? '0 4px 12px rgba(239,68,68,0.3)' : 'none',
                        '&:hover': { bgcolor: status === 'absent' ? '#dc2626' : 'rgba(239,68,68,0.1)', color: status === 'absent' ? '#fff' : 'var(--color-error)' }
                      }}
                    >
                      Absent
                    </Button>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        ) : (
          <Typography color="text.secondary">Add members first</Typography>
        )}
      </Box>
    </Fade>
  );
}

export default CellLeaderAttendancePage;
