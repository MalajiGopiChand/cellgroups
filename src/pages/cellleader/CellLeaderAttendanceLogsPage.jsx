import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fade, Chip, CircularProgress, Divider, IconButton, TextField } from '@mui/material';
import { EventAvailable as EventIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';

function CellLeaderAttendanceLogsPage({ user, onBack }) {
  const navigate = useNavigate();
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [filterDate, setFilterDate] = useState(getLocalDate());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user?.id) return;
      try {
        const q = query(collection(db, 'attendance'), where('cellLeaderId', '==', user.id));
        const snap = await getDocs(q);
        
        const logs = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(rec => rec.attendance && rec.attendance.length > 0);
          
        // Sort by date descending
        logs.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAttendanceLogs(logs);
      } catch (error) {
        console.error('Error fetching attendance logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [user?.id]);

  const filtered = attendanceLogs.filter(a => {
    if (a.date !== filterDate) return false;
    return true;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </Box>
    );
  }

  return (
    <Fade in timeout={400}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton 
              onClick={onBack ? onBack : () => navigate('/cellleader/dashboard')} 
              sx={{ 
                bgcolor: 'var(--bg-glass-strong)', 
                border: '1px solid var(--border-light)', 
                boxShadow: 'var(--shadow-sm)' 
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
              Attendance Logs
            </Typography>
          </Box>
          <Chip 
            label={`${filtered.length} Logs`} 
            size="small" 
            sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)', fontWeight: 700 }} 
          />
        </Box>

        {/* Filters */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 2, 
            display: 'flex', 
            gap: 2, 
            bgcolor: 'var(--bg-glass-strong)', 
            backdropFilter: 'blur(12px)',
            borderRadius: 3,
            border: '1px solid var(--border-light)'
          }}
        >
          <TextField
            size="small"
            type="date"
            label="Filter by Date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ flexGrow: 1 }}
          />
        </Paper>

        {/* Attendance Records */}
        {filtered.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filtered.map((rec, i) => {
              const presentCount = rec.attendance?.filter(a => a.status === 'present').length || 0;
              const totalCount = rec.attendance?.length || 0;

              return (
                <Fade in timeout={300 + (i * 100)} key={rec.id || i}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      bgcolor: 'var(--bg-glass-strong)', 
                      backdropFilter: 'blur(12px)',
                      borderRadius: 4,
                      border: '1px solid var(--border-light)',
                      boxShadow: 'var(--shadow-sm)',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Log Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <EventIcon />
                        </Box>
                        <Box>
                          <Typography fontWeight={700} sx={{ color: 'var(--text-primary)' }}>{rec.date}</Typography>
                        </Box>
                      </Box>
                      <Chip 
                        size="small" 
                        label={`${presentCount}/${totalCount} Present`} 
                        sx={{ bgcolor: presentCount > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: presentCount > 0 ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 700 }} 
                      />
                    </Box>

                    <Divider sx={{ my: 1.5, borderColor: 'var(--border-light)' }} />

                    {/* Students List */}
                    {totalCount > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {rec.attendance.map((a, j) => (
                          <Box key={j} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderRadius: 2, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.04)' } }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                              {a.name}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={a.status} 
                              sx={{ 
                                height: 22, 
                                fontSize: '0.65rem', 
                                fontWeight: 700, 
                                textTransform: 'uppercase',
                                bgcolor: a.status === 'present' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: a.status === 'present' ? 'var(--color-success)' : 'var(--color-error)'
                              }} 
                            />
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'var(--text-tertiary)', textAlign: 'center', py: 2 }}>
                        No attendance data recorded.
                      </Typography>
                    )}
                  </Paper>
                </Fade>
              );
            })}
          </Box>
        ) : (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--bg-glass-strong)', borderRadius: 4, border: '1px dashed var(--border-light)' }}>
            <Typography sx={{ color: 'var(--text-tertiary)' }}>No attendance logs found for this date.</Typography>
          </Paper>
        )}

      </Box>
    </Fade>
  );
}

export default CellLeaderAttendanceLogsPage;
