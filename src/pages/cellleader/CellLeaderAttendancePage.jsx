import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fade, Button } from '@mui/material';
import { collection, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

function CellLeaderAttendancePage({ user }) {
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
        <Typography variant="h6" sx={{ mb: 2 }}>Take Attendance</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{user?.name} • {user?.place}</Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ mr: 1 }}>Date:</Typography>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '2px solid #e2e8f0', background: '#ffffff', color: '#1e293b' }} />
        </Box>
        {members.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {members.map(member => {
              const rec = attendance.find(a => a.studentId === (member.id || member.name) || a.name === member.name);
              const status = rec?.status || null;
              return (
                <Paper key={member.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#ffffff', boxShadow: 1, border: '1px solid #e2e8f0' }}>
                  <Typography fontWeight={600}>{member.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant={status === 'present' ? 'contained' : 'outlined'} color="success" onClick={() => handleMark(member, 'present')}>Present</Button>
                    <Button size="small" variant={status === 'absent' ? 'contained' : 'outlined'} color="error" onClick={() => handleMark(member, 'absent')}>Absent</Button>
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
