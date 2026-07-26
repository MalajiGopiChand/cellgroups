import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Chip,
  TextField
} from '@mui/material';
import { Person as PersonIcon, Event as EventIcon } from '@mui/icons-material';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getISOWeekString, parseDDMMYYYY } from '../../utils/dateUtils';

function CellLeaderViewPrayerRequestsPage({ user, onBack }) {
  const [requests, setRequests] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [filterWeek, setFilterWeek] = useState(() => getISOWeekString(new Date()));

  useEffect(() => {
    const q = query(collection(db, 'prayer_requests'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
      setFetchLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredRequests = filterWeek 
    ? requests.filter(r => {
        if (!r.date) return false;
        const reqDateObj = parseDDMMYYYY(r.date);
        return getISOWeekString(reqDateObj) === filterWeek;
      })
    : requests;

  return (
    <Box>
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
            Week:
          </Typography>
          <TextField
            type="week"
            size="small"
            value={filterWeek}
            onChange={(e) => setFilterWeek(e.target.value)}
            sx={{ minWidth: 160, flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--surface-white)' } }}
          />
        </Box>
      </Paper>

      {fetchLoading ? (
        <Typography sx={{ p: 3, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading requests...</Typography>
      ) : filteredRequests.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--bg-glass-strong)', borderRadius: 1, border: '1px dashed var(--border-light)' }}>
          <Typography color="var(--text-tertiary)">No prayer requests found for this week.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1 }}>
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
                <Grid item xs={12}>
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
              </Grid>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default CellLeaderViewPrayerRequestsPage;
