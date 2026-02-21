import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, IconButton, Select, MenuItem, FormControl, InputLabel, Fade } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

function AdminMembersPage() {
  const [members, setMembers] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [filterLeader, setFilterLeader] = useState('');
  const [filterPlace, setFilterPlace] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const [membersSnap, leadersSnap] = await Promise.all([
        getDocs(collection(db, 'students')),
        getDocs(collection(db, 'cellleaders'))
      ]);
      setMembers(membersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLeaders(leadersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetch();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member?')) return;
    await deleteDoc(doc(db, 'students', id));
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const places = [...new Set(members.map(m => m.place))].filter(Boolean).sort();
  const filtered = members.filter(m => {
    if (filterLeader && m.cellLeaderId !== filterLeader) return false;
    if (filterPlace && m.place !== filterPlace) return false;
    return true;
  });

  return (
    <Fade in timeout={350}>
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Members Details</Typography>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {filtered.map(m => (
              <Paper key={m.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#ffffff' }}>
                <Box>
                  <Typography fontWeight={600}>{m.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{m.place} • {m.cellLeaderName}</Typography>
                </Box>
                <IconButton color="error" size="small" onClick={() => handleDelete(m.id)} title="Delete">
                  <DeleteIcon />
                </IconButton>
              </Paper>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">No members</Typography>
        )}
      </Box>
    </Fade>
  );
}

export default AdminMembersPage;
