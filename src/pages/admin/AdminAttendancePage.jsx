import { useState, useEffect } from 'react';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, Fade } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

function AdminAttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [filterLeader, setFilterLeader] = useState('');
  const [filterPlace, setFilterPlace] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const [attSnap, leadersSnap] = await Promise.all([
        getDocs(collection(db, 'attendance')),
        getDocs(collection(db, 'cellleaders'))
      ]);
      setAttendance(attSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLeaders(leadersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetch();
  }, []);

  const places = [...new Set(attendance.map(a => a.place))].filter(Boolean).sort();
  const filtered = attendance.filter(a => {
    if (filterLeader && a.cellLeaderId !== filterLeader) return false;
    if (filterPlace && a.place !== filterPlace) return false;
    return true;
  });

  return (
    <Fade in timeout={350}>
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Attendance Details</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Cell Leader</InputLabel>
            <Select value={filterLeader} label="Cell Leader" onChange={(e) => setFilterLeader(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {leaders.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Place</InputLabel>
            <Select value={filterPlace} label="Place" onChange={(e) => setFilterPlace(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {places.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        {filtered.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filtered.map((rec, i) => (
              <Paper key={i} sx={{ p: 2, bgcolor: '#ffffff' }}>
                <Typography fontWeight={600}>{rec.date} - {rec.place}</Typography>
                {rec.attendance?.length > 0 ? (
                  <Box sx={{ mt: 1 }}>
                    {rec.attendance.map((a, j) => (
                      <Box key={j} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                        <Typography variant="body2">{a.name}</Typography>
                        <Typography variant="body2" color={a.status === 'present' ? 'success.main' : 'error.main'}>{a.status}</Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">No attendance</Typography>
                )}
              </Paper>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">No records</Typography>
        )}
      </Box>
    </Fade>
  );
}

export default AdminAttendancePage;
