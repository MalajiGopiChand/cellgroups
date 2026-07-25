import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton,
  Button,
  Grid,
  Chip,
  TextField
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Delete as DeleteIcon,
  Person as PersonIcon,
  Event as EventIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useLanguage } from '../../contexts/LanguageContext';
import { downloadAsImage } from '../../utils/downloadImage';

function AdminPrayerRequestsPage({ onBack }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');

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

  const filteredRequests = filterDate 
    ? requests.filter(r => r.date === new Date(filterDate).toLocaleDateString('en-GB').replace(/\//g, '-'))
    : requests;

  return (
    <Box>
      
      {/* Sleek Single-Line Filter Card */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 1.5, 
          mb: 3,
          display: 'flex', 
          gap: 1.5, alignItems: 'center',
          bgcolor: 'var(--bg-glass-strong)', 
          backdropFilter: 'blur(12px)',
          borderRadius: 1,
          border: '1px solid var(--border-light)',
          flexWrap: 'wrap'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" fontWeight={600} color="var(--text-secondary)">
            Date:
          </Typography>
          <TextField
            type="date"
            size="small"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            sx={{ minWidth: 110, flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--surface-white)' } }}
          />
        </Box>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />} 
          onClick={() => downloadAsImage('prayer-requests-list', `Prayer_Requests_${filterDate || 'All'}.png`)}
          sx={{ ml: 'auto', bgcolor: 'var(--primary-forest)', color: '#fff', borderRadius: 1, fontWeight: 700, boxShadow: 'none', '&:hover': { bgcolor: 'var(--primary-forest)', opacity: 0.9 } }}
        >
          Download Image
        </Button>
      </Paper>

      {loading ? (
        <Typography sx={{ p: 3, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading requests...</Typography>
      ) : filteredRequests.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--bg-glass-strong)', borderRadius: 1, border: '1px dashed var(--border-light)' }}>
          <Typography color="var(--text-tertiary)">No prayer requests found for this selection.</Typography>
        </Paper>
      ) : (
        <Box id="prayer-requests-list" sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1 }}>
          <Typography variant="h6" sx={{ display: 'none', mb: 2, color: 'var(--text-primary)', fontWeight: 800 }}>
            Prayer Requests {filterDate && `- ${new Date(filterDate).toLocaleDateString('en-GB').replace(/\//g, '-')}`}
          </Typography>
          {filteredRequests.map((req, index) => (
            <Paper 
              key={req.id} 
              elevation={0}
              sx={{ 
                p: 2.5, 
                bgcolor: 'var(--bg-glass-strong)', 
                backdropFilter: 'blur(12px)',
                borderRadius: 1,
                border: '1px solid var(--border-light)',
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
                      {filteredRequests.length - index}
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
                          sx={{ bgcolor: 'var(--surface-white)', fontWeight: 600, color: 'var(--text-secondary)' }} 
                        />
                        <Chip 
                          size="small" 
                          icon={<EventIcon fontSize="small" />} 
                          label={req.date} 
                          sx={{ bgcolor: 'var(--surface-white)', fontWeight: 600, color: 'var(--text-secondary)' }} 
                        />
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end' }} className="no-print">
                  <Button 
                    variant="outlined" 
                    color="error" 
                    startIcon={<DeleteIcon />} 
                    size="small"
                    onClick={() => handleDelete(req.id)}
                    sx={{ borderRadius: 1, fontWeight: 700 }}
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
  );
}

export default AdminPrayerRequestsPage;
