import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, FormControl, InputLabel, Select, MenuItem, Fade, Collapse, CircularProgress, IconButton } from '@mui/material';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { AddAlert as AddAlertIcon, Send as SendIcon, CheckCircle as CheckIcon, DeleteOutline as DeleteIcon, EditOutlined as EditIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

function AdminAnnouncementsPage({ onBack }) {
  const [announcements, setAnnouncements] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [recipientType, setRecipientType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
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
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
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
    if (!window.confirm('Delete this announcement?')) return;
    await deleteDoc(doc(db, 'announcements', id));
    fetchData();
    setEditing(null);
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
        
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
              Announcements & Alerts
            </Typography>
          </Box>
          {!showForm && (
            <Button 
              variant="contained" 
              onClick={() => { setShowForm(true); setEditing(null); }}
              startIcon={<AddAlertIcon />}
              sx={{ 
                bgcolor: 'var(--color-primary)', 
                borderRadius: 999,
                boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                textTransform: 'none',
                fontWeight: 600,
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(99,102,241,0.4)' }
              }}
            >
              New Alert
            </Button>
          )}
        </Box>

        {/* Compose Form */}
        <Collapse in={showForm}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              bgcolor: 'var(--bg-glass-strong)', 
              backdropFilter: 'blur(12px)',
              borderRadius: 4,
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddAlertIcon sx={{ color: 'var(--color-primary)' }} />
              Compose Announcement
            </Typography>
            <form onSubmit={handleSend}>
              <TextField 
                name="title" 
                label="Alert Title" 
                fullWidth 
                required 
                sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 3 } }} 
              />
              <TextField 
                name="message" 
                label="Message Details" 
                fullWidth 
                multiline 
                rows={4} 
                required 
                sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 3 } }} 
              />
              <FormControl fullWidth sx={{ mb: 2.5 }}>
                <InputLabel>Recipient</InputLabel>
                <Select 
                  name="recipientType" 
                  label="Recipient" 
                  required 
                  value={recipientType} 
                  onChange={(e) => setRecipientType(e.target.value)}
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="all">All Cell Leaders</MenuItem>
                  <MenuItem value="specific">Specific Cell Leader</MenuItem>
                </Select>
              </FormControl>
              <Collapse in={recipientType === 'specific'}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Select Cell Leader</InputLabel>
                  <Select 
                    name="cellLeaderId" 
                    label="Select Cell Leader" 
                    required={recipientType === 'specific'}
                    sx={{ borderRadius: 3 }}
                  >
                    <MenuItem value=""><em>Select...</em></MenuItem>
                    {leaders.filter(l => l.approved).map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Collapse>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  onClick={() => setShowForm(false)}
                  sx={{ borderRadius: 999, px: 3, fontWeight: 600, color: 'var(--text-secondary)' }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained"
                  endIcon={<SendIcon />}
                  sx={{ borderRadius: 999, px: 4, fontWeight: 600, bgcolor: 'var(--color-primary)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
                >
                  Send Alert
                </Button>
              </Box>
            </form>
          </Paper>
        </Collapse>

        {/* History List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {announcements.map((a, idx) => (
            <Fade in timeout={300 + (idx * 50)} key={a.id}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  bgcolor: 'var(--bg-glass-strong)', 
                  backdropFilter: 'blur(12px)',
                  borderRadius: 4,
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 'var(--shadow-md)', borderColor: 'rgba(99,102,241,0.3)' }
                }}
              >
                {/* Decorative side accent */}
                <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: 'var(--color-primary)' }} />
                
                {editing?.id === a.id ? (
                  <form onSubmit={handleUpdate}>
                    <TextField name="title" label="Update Title" defaultValue={a.title} fullWidth required sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <TextField name="message" label="Update Message" defaultValue={a.message} fullWidth multiline rows={3} required sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button size="small" onClick={() => setEditing(null)} sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Cancel</Button>
                      <Button type="submit" variant="contained" size="small" startIcon={<CheckIcon />} sx={{ bgcolor: 'var(--color-success)', borderRadius: 2, fontWeight: 600 }}>Save Changes</Button>
                    </Box>
                  </form>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ pr: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--text-primary)', mb: 0.5, lineHeight: 1.2 }}>{a.title}</Typography>
                        <Typography sx={{ color: 'var(--text-secondary)', mb: 2, whiteSpace: 'pre-wrap' }}>{a.message}</Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--text-tertiary)', px: 1.5, py: 0.5, bgcolor: 'rgba(148, 163, 184, 0.1)', borderRadius: 999 }}>
                            {a.createdAt?.toDate ? new Date(a.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: a.recipientType === 'all' ? 'var(--color-success)' : 'var(--color-primary)', px: 1.5, py: 0.5, bgcolor: a.recipientType === 'all' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)', borderRadius: 999 }}>
                            To: {a.recipientType === 'all' ? 'All Leaders' : leaders.find(l => l.id === a.cellLeaderId)?.name || 'Specific Leader'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setEditing(a)} sx={{ bgcolor: 'rgba(148, 163, 184, 0.1)', color: 'var(--color-primary)', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(a.id)} sx={{ bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </>
                )}
              </Paper>
            </Fade>
          ))}
          {announcements.length === 0 && !showForm && (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--bg-glass-strong)', borderRadius: 4, border: '1px dashed var(--border-light)' }}>
              <Typography sx={{ color: 'var(--text-tertiary)' }}>No announcements sent yet.</Typography>
            </Paper>
          )}
        </Box>

      </Box>
    </Fade>
  );
}

export default AdminAnnouncementsPage;
