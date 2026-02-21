import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, FormControl, InputLabel, Select, MenuItem, Fade, Collapse } from '@mui/material';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [recipientType, setRecipientType] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [annSnap, leadersSnap] = await Promise.all([
      getDocs(collection(db, 'announcements')),
      getDocs(collection(db, 'cellleaders'))
    ]);
    setAnnouncements(annSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const db_ = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return db_ - da;
      }));
    setLeaders(leadersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await addDoc(collection(db, 'announcements'), {
      title: fd.get('title'),
      message: fd.get('message'),
      recipientType: fd.get('recipientType'),
      cellLeaderId: fd.get('recipientType') === 'specific' ? fd.get('cellLeaderId') : null,
      createdAt: new Date()
    });
    fetchData();
    setShowForm(false);
    e.target.reset();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await updateDoc(doc(db, 'announcements', editing.id), {
      title: fd.get('title'),
      message: fd.get('message')
    });
    fetchData();
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    await deleteDoc(doc(db, 'announcements', id));
    fetchData();
    setEditing(null);
  };

  return (
    <Fade in timeout={350}>
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Announcements</Typography>
        <Button variant="contained" sx={{ mb: 2 }} onClick={() => { setShowForm(true); setEditing(null); }}>Send Announcement</Button>

        {showForm && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: '#ffffff' }}>
            <form onSubmit={handleSend}>
              <TextField name="title" label="Title" fullWidth required sx={{ mb: 2 }} />
              <TextField name="message" label="Message" fullWidth multiline rows={4} required sx={{ mb: 2 }} />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Recipient</InputLabel>
                <Select name="recipientType" label="Recipient" required value={recipientType} onChange={(e) => setRecipientType(e.target.value)}>
                  <MenuItem value="all">All Cell Leaders</MenuItem>
                  <MenuItem value="specific">Specific</MenuItem>
                </Select>
              </FormControl>
              <Collapse in={recipientType === 'specific'}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Cell Leader</InputLabel>
                  <Select name="cellLeaderId" label="Cell Leader" required={recipientType === 'specific'}>
                    <MenuItem value="">Select...</MenuItem>
                    {leaders.filter(l => l.approved).map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Collapse>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button type="submit" variant="contained">Send</Button>
                <Button onClick={() => setShowForm(false)}>Cancel</Button>
              </Box>
            </form>
          </Paper>
        )}

        {announcements.map(a => (
          <Paper key={a.id} sx={{ p: 2, mb: 2, bgcolor: '#ffffff' }}>
            {editing?.id === a.id ? (
              <form onSubmit={handleUpdate}>
                <TextField name="title" label="Title" defaultValue={a.title} fullWidth required sx={{ mb: 2 }} />
                <TextField name="message" label="Message" defaultValue={a.message} fullWidth multiline rows={3} required sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button type="submit" variant="contained" size="small">Save</Button>
                  <Button size="small" onClick={() => setEditing(null)}>Cancel</Button>
                </Box>
              </form>
            ) : (
              <>
                <Typography fontWeight={600}>{a.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{a.message}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {a.createdAt?.toDate ? new Date(a.createdAt.toDate()).toLocaleDateString() : 'N/A'} • To: {a.recipientType === 'all' ? 'All' : leaders.find(l => l.id === a.cellLeaderId)?.name || 'Specific'}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Button size="small" onClick={() => setEditing(a)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(a.id)}>Delete</Button>
                </Box>
              </>
            )}
          </Paper>
        ))}
      </Box>
    </Fade>
  );
}

export default AdminAnnouncementsPage;
