import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, IconButton, Fade } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

function AdminApprovePage() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, 'cellleaders'));
      setLeaders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetch();
  }, []);

  const handleApprove = async (id) => {
    await updateDoc(doc(db, 'cellleaders', id), { approved: true, approvedAt: new Date() });
    setLeaders(prev => prev.map(l => l.id === id ? { ...l, approved: true } : l));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this Cell Leader? This cannot be undone.')) return;
    await deleteDoc(doc(db, 'cellleaders', id));
    setLeaders(prev => prev.filter(l => l.id !== id));
  };

  const pending = leaders.filter(l => !l.approved);
  const approved = leaders.filter(l => l.approved);

  return (
    <Fade in timeout={350}>
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Approve Cell Leaders</Typography>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Pending ({pending.length})</Typography>
        {pending.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            {pending.map(l => (
              <Paper key={l.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper', boxShadow: 1 }}>
                <Box>
                  <Typography fontWeight={600}>{l.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{l.email} • {l.place} • {l.phone}</Typography>
                </Box>
                <Button variant="contained" color="success" size="small" onClick={() => handleApprove(l.id)}>Approve</Button>
              </Paper>
            ))}
          </Box>
        )}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Approved ({approved.length})</Typography>
        {approved.map(l => (
          <Paper key={l.id} sx={{ p: 2, mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <Box>
              <Typography fontWeight={600}>{l.name}</Typography>
              <Typography variant="body2" color="text.secondary">{l.email} • {l.place}</Typography>
            </Box>
            <IconButton color="error" size="small" onClick={() => handleDelete(l.id)} title="Remove Cell Leader">
              <DeleteIcon />
            </IconButton>
          </Paper>
        ))}
      </Box>
    </Fade>
  );
}

export default AdminApprovePage;
