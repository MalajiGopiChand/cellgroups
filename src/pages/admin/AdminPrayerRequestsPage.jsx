import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Fade, 
  IconButton,
  Button,
  Grid,
  Chip
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Delete as DeleteIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

function AdminPrayerRequestsPage({ onBack }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'prayer_requests'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this prayer request?")) {
      try {
        await deleteDoc(doc(db, 'prayer_requests', id));
      } catch (error) {
        console.error("Error deleting prayer request: ", error);
        alert("Failed to delete the request.");
      }
    }
  };

  return (
    <Fade in timeout={350}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <IconButton 
            onClick={onBack} 
            sx={{ 
              bgcolor: 'transparent', 
              color: 'var(--text-deep)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } 
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
            Prayer Requests
          </Typography>
        </Box>

        {loading ? (
          <Typography sx={{ p: 3, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading requests...</Typography>
        ) : requests.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--bg-glass-strong)', borderRadius: 3, border: '1px dashed var(--border-light)' }}>
            <Typography color="var(--text-tertiary)">No prayer requests found.</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {requests.map((req, index) => (
              <Paper 
                key={req.id} 
                elevation={0}
                sx={{ 
                  p: 2.5, 
                  bgcolor: 'var(--bg-glass-strong)', 
                  backdropFilter: 'blur(12px)',
                  borderRadius: 3,
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid item xs={12} sm={10}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Box sx={{ 
                        minWidth: 32, 
                        height: 32, 
                        borderRadius: '50%', 
                        bgcolor: 'var(--surface-sage)', 
                        color: 'var(--primary-forest)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}>
                        {requests.length - index}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                           {req.personName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 1, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                          "{req.description}"
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                          <Chip 
                            size="small" 
                            icon={<PersonIcon fontSize="small" />} 
                            label={`Submitted By: ${req.submittedBy}`} 
                            sx={{ bgcolor: 'var(--bg-surface)', fontWeight: 600, color: 'var(--text-secondary)' }} 
                          />
                          <Chip 
                            size="small" 
                            icon={<EventIcon fontSize="small" />} 
                            label={req.date} 
                            sx={{ bgcolor: 'var(--bg-surface)', fontWeight: 600, color: 'var(--text-secondary)' }} 
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      startIcon={<DeleteIcon />} 
                      size="small"
                      onClick={() => handleDelete(req.id)}
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                      Delete
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Fade>
  );
}

export default AdminPrayerRequestsPage;
