import React, { useState, useEffect } from 'react';
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
import { 
  ArrowBack as ArrowBackIcon, 
  Person as PersonIcon, 
  LocationOn as LocationIcon 
} from '@mui/icons-material';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

function CellLeaderMeetingPlacePage({ user, onBack }) {
  const getUpcomingTuesday = () => {
    const d = new Date();
    const day = d.getDay();
    const daysUntilTuesday = (2 - day + 7) % 7;
    d.setDate(d.getDate() + daysUntilTuesday);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [selectedDate, setSelectedDate] = useState(getUpcomingTuesday());
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [meetingPlace, setMeetingPlace] = useState('');
  
  useEffect(() => {
    const fetchPlace = async () => {
      setFetching(true);
      setMeetingPlace('');
      try {
        const docRef = doc(db, 'meeting_places', `${user.id}_${selectedDate}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMeetingPlace(docSnap.data().address);
        }
      } catch (err) {
        console.error("Error fetching meeting place:", err);
      } finally {
        setFetching(false);
      }
    };
    if (user?.id) fetchPlace();
  }, [user?.id, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    const fd = new FormData(e.target);
    const address = fd.get('meetingPlace').trim();

    if (!address) {
      alert("Meeting Place is required.");
      setLoading(false);
      return;
    }

    try {
      await setDoc(doc(db, 'meeting_places', `${user.id}_${selectedDate}`), {
        leaderId: user.id,
        leaderName: user.name,
        address: address,
        date: selectedDate,
        timestamp: new Date()
      });
      setSuccessMsg('Meeting place saved successfully.');
    } catch (err) {
      console.error('Error saving meeting place:', err);
      alert('Failed to save meeting place. Please try again.');
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

          {fetching ? (
            <Typography>Loading...</Typography>
          ) : (
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField 
                  label="Cell Leader Name" 
                  value={user.name}
                  fullWidth 
                  disabled
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: 'var(--text-tertiary)' }} /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--bg-surface)' } }} 
                />
                <TextField 
                  label="Date (Tuesdays Only)"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    const selectedDateObj = new Date(e.target.value);
                    if (selectedDateObj.getDay() !== 2) {
                      alert("Please select a Tuesday for the meeting.");
                      return;
                    }
                    setSelectedDate(e.target.value);
                  }}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: getLocalDate() }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--bg-surface)' } }} 
                />
              </Box>
              
              <TextField 
                name="meetingPlace" 
                label="Meeting Place" 
                fullWidth 
                required 
                multiline
                rows={3}
                value={meetingPlace}
                onChange={(e) => setMeetingPlace(e.target.value)}
                placeholder="House No.14,&#10;ABC Colony,&#10;Hyderabad."
                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}><LocationIcon sx={{ color: 'var(--color-primary)' }} /></InputAdornment> }}
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
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </form>
          )}
        </Paper>
      </Box>
    
  );
}

export default CellLeaderMeetingPlacePage;
