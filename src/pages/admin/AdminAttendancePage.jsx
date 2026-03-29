import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, Fade, Chip, CircularProgress, Divider, IconButton } from '@mui/material';
import { EventAvailable as EventIcon, FilterList as FilterIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

function AdminAttendancePage({ onBack }) {
  const [attendance, setAttendance] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [filterLeader, setFilterLeader] = useState('');
  const [filterPlace, setFilterPlace] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [attSnap, leadersSnap, studentsSnap] = await Promise.all([
          getDocs(collection(db, 'attendance')),
          getDocs(collection(db, 'cellleaders')),
          getDocs(collection(db, 'students'))
        ]);
        
        // Dynamically track all valid members to filter out any "orphaned" attendance records
        const validStudentIds = new Set(studentsSnap.docs.map(d => d.id));
        const validStudentNames = new Set(studentsSnap.docs.map(d => d.data().name));
        const validLeaderIds = new Set(leadersSnap.docs.map(d => d.id));
        
        const cleanedAttendance = attSnap.docs
          .map(d => {
            const data = d.data();
            // Strictly check ID if available to prevent name collision bugs
            const filteredArr = (data.attendance || []).filter(a => {
              if (a.studentId && a.studentId.length > 15) return validStudentIds.has(a.studentId);
              return validStudentNames.has(a.name);
            });
            return { id: d.id, ...data, attendance: filteredArr };
          })
          // Completely hide attendance logs if the Cell Leader is deleted OR the roster is entirely empty
          .filter(rec => validLeaderIds.has(rec.cellLeaderId) && rec.attendance.length > 0);
        
        setAttendance(cleanedAttendance);
        setLeaders(leadersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Error fetching attendance logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const places = [...new Set(attendance.map(a => a.place))].filter(Boolean).sort();
  const filtered = attendance.filter(a => {
    if (filterLeader && a.cellLeaderId !== filterLeader) return false;
    if (filterPlace && a.place !== filterPlace) return false;
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
            flexWrap: 'wrap', 
            bgcolor: 'var(--bg-glass-strong)', 
            backdropFilter: 'blur(12px)',
            borderRadius: 3,
            border: '1px solid var(--border-light)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', mr: 1 }}>
            <FilterIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" fontWeight={600}>Filters</Typography>
          </Box>
          <FormControl size="small" sx={{ flexGrow: 1, minWidth: 160 }}>
            <InputLabel>Cell Leader</InputLabel>
            <Select 
              value={filterLeader} 
              label="Cell Leader" 
              onChange={(e) => setFilterLeader(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value=""><em>All Leaders</em></MenuItem>
              {leaders.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ flexGrow: 1, minWidth: 160 }}>
            <InputLabel>Place</InputLabel>
            <Select 
              value={filterPlace} 
              label="Place" 
              onChange={(e) => setFilterPlace(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value=""><em>All Places</em></MenuItem>
              {places.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
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
                      transition: 'all 0.2s ease',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 'var(--shadow-md)', borderColor: 'rgba(99,102,241,0.2)' },
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
                          <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                            {rec.place} • By Leader
                          </Typography>
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
            <Typography sx={{ color: 'var(--text-tertiary)' }}>No attendance logs found matching filters.</Typography>
          </Paper>
        )}

      </Box>
    </Fade>
  );
}

export default AdminAttendancePage;
