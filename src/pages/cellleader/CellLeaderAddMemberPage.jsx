import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fade, TextField, Button } from '@mui/material';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

function CellLeaderAddMemberPage({ user }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMembers = async () => {
    if (!user?.id) return;
    const q = query(collection(db, 'students'), where('cellLeaderId', '==', user.id));
    const snap = await getDocs(q);
    setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(m => m.place === user?.place));
  };

  useEffect(() => {
    fetchMembers();
  }, [user?.id, user?.place]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    await addDoc(collection(db, 'students'), {
      name: fd.get('name'),
      place: user.place,
      cellLeaderName: user.name,
      cellLeaderId: user.id
    });
    await fetchMembers();
    setLoading(false);
    e.target.reset();
  };

  return (
    <Fade in timeout={350}>
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Add Member</Typography>
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#ffffff' }}>
          <form onSubmit={handleSubmit}>
            <TextField name="name" label="Name of Member" fullWidth required sx={{ mb: 2 }} />
            <TextField label="Place" value={user?.place || ''} fullWidth disabled sx={{ mb: 2 }} />
            <TextField label="Cell Leader" value={user?.name || ''} fullWidth disabled sx={{ mb: 2 }} />
            <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Adding...' : 'Add Member'}</Button>
          </form>
        </Paper>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>My Members ({members.length})</Typography>
        {members.map(m => (
          <Paper key={m.id} sx={{ p: 2, mb: 1, bgcolor: '#ffffff' }}>
            <Typography fontWeight={600}>{m.name}</Typography>
            <Typography variant="body2" color="text.secondary">{m.place} • {m.cellLeaderName}</Typography>
          </Paper>
        ))}
      </Box>
    </Fade>
  );
}

export default CellLeaderAddMemberPage;
