import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Fade, 
  TextField, 
  Button, 
  IconButton,
  InputAdornment,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Person as PersonIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useLanguage } from '../../contexts/LanguageContext';

function CellLeaderPrayerRequestsPage({ user, onBack }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    const fd = new FormData(e.target);
    const personName = fd.get('personName').trim();
    const description = fd.get('description').trim();

    if (!personName || !description) {
      alert("Both fields are required.");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'prayer_requests'), {
        personName,
        description,
        submittedBy: user.name,
        leaderId: user.id,
        date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        timestamp: new Date()
      });
      setSuccessMsg('Prayer request submitted successfully.');
      e.target.reset();
    } catch (err) {
      console.error('Error adding prayer request:', err);
      alert('Failed to submit prayer request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    
      <Box>
        
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 3, 
            bgcolor: 'var(--bg-glass-strong)', 
            backdropFilter: 'blur(12px)',
            borderRadius: 1,
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {successMsg && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 1 }}>
              {successMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField 
              name="personName" 
              label={t('prayer.personName')} 
              fullWidth 
              required 
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: 'var(--color-primary)' }} /></InputAdornment> }}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--bg-surface)' } }} 
            />
            
            <TextField 
              name="description" 
              label={t('prayer.desc')} 
              fullWidth 
              required 
              multiline
              rows={4}
              InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}><DescriptionIcon sx={{ color: 'var(--color-primary)' }} /></InputAdornment> }}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--bg-surface)' } }} 
            />
            
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              disabled={loading}
              sx={{ 
                bgcolor: 'var(--color-primary)', 
                color: '#fff',
                borderRadius: 199, 
                py: 1.5,
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                '&:hover': {
                  bgcolor: 'var(--color-primary-dark)',
                  boxShadow: '0 6px 16px rgba(99,102,241,0.4)',
                }
              }}
            >
              {loading ? 'Submitting...' : t('gen.submit')}
            </Button>
          </form>
        </Paper>
      </Box>
    
  );
}

export default CellLeaderPrayerRequestsPage;
