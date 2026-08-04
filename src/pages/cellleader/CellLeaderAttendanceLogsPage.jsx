import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import { Box, Typography, Paper, Fade, Chip, CircularProgress, Divider, IconButton } from '@mui/material';
import { EventAvailable as EventIcon, ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

function CellLeaderAttendanceLogsPage({ user, onBack }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
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

  const handleToggleStatus = async (recordId, currentArray, studentObj) => {
    try {
      const updatedArray = currentArray.map(a => {
        const match = (a.studentId && studentObj.studentId) 
          ? a.studentId === studentObj.studentId 
          : a.name === studentObj.name;
        
        if (match) {
          return { ...a, status: a.status === 'present' ? 'absent' : 'present' };
        }
        return a;
      });

      await updateDoc(doc(db, 'attendance', recordId), { attendance: updatedArray });
      setAttendanceLogs(prev => prev.map(rec => rec.id === recordId ? { ...rec, attendance: updatedArray } : rec));
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update status.');
    }
  };

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
    
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <PageHeader title={t('logs.title')} onBack={onBack ? onBack : () => navigate('/cellleader/dashboard')} />
          <Chip 
            label={`${filtered.length} Records`} 
            size="small" 
            sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)', fontWeight: 700 }} 
          />
        </Box>

        {/* Sleek Single-Line Filter Card */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 1.5, 
            mb: 2,
            display: 'flex', 
            gap: 1.5, alignItems: 'center',
            bgcolor: 'var(--bg-glass-strong)', 
            backdropFilter: 'blur(12px)',
            borderRadius: 1,
            border: '1px solid var(--border-light)',
            flexWrap: 'wrap'
          }}
        >
          <Typography variant="body2" fontWeight={600} color="var(--text-secondary)">
            {t('logs.selectDate')}:
          </Typography>
          <input 
            type="date" 
            value={filterDate} 
            onChange={(e) => setFilterDate(e.target.value)} 
            style={{ 
              padding: '6px 10px', 
              borderRadius: 1, 
              border: '1px solid var(--border-light)', 
              background: 'var(--surface-white)', 
              color: 'var(--text-primary)', 
              fontFamily: 'inherit', 
              fontWeight: 600,
              outline: 'none',
                minWidth: '100px'
            }} 
          />
        </Paper>

        {/* Attendance Records */}
        {filtered.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filtered.map((rec, i) => {
              const presentCount = rec.attendance?.filter(a => a.status === 'present').length || 0;
              const totalCount = rec.attendance?.length || 0;
              
              const familyStatus = {};
              rec.attendance?.forEach(a => {
                const fid = a.familyId || `single_${a.studentId}`;
                if (!familyStatus[fid]) {
                  familyStatus[fid] = false;
                }
                if (a.status === 'present') {
                  familyStatus[fid] = true;
                }
              });
              let familiesPresent = 0;
              let familiesAbsent = 0;
              Object.values(familyStatus).forEach(isPresent => {
                if (isPresent) familiesPresent++;
                else familiesAbsent++;
              });

              return (
                
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      bgcolor: 'var(--bg-glass-strong)', 
                      backdropFilter: 'blur(12px)',
                      borderRadius: 1,
                      border: '1px solid var(--border-light)',
                      boxShadow: 'var(--shadow-sm)',
                      }}
                  >
                    {/* Log Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <EventIcon />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                            {rec.place} • {user?.name}
                          </Typography>
                          <Typography fontWeight={700} sx={{ color: 'var(--text-primary)', display: 'block' }}>{rec.date}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                        <Chip 
                          size="small" 
                          label={`${presentCount}/${totalCount} Members Present`} 
                          sx={{ bgcolor: presentCount > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: presentCount > 0 ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 700 }} 
                        />
                        {(familiesPresent > 0 || familiesAbsent > 0) && (
                          <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                            {familiesPresent} Families Present • {familiesAbsent} Absent
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1.5, borderColor: 'var(--border-light)' }} />

                    {/* Students List */}
                    {totalCount > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {rec.attendance.map((a, j) => (
                          <Box key={j} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderRadius: 1, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.04)' } }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                              {a.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                size="small" 
                                label={a.status === 'present' ? t('att.presentBtn') : t('att.absentBtn')}
                                sx={{ 
                                  height: 22, 
                                  fontSize: '0.65rem', 
                                  fontWeight: 700, 
                                  textTransform: 'uppercase',
                                  bgcolor: a.status === 'present' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                  color: a.status === 'present' ? 'var(--color-success)' : 'var(--color-error)'
                                }} 
                              />
                              <IconButton
                                size="small"
                                onClick={() => handleToggleStatus(rec.id, rec.attendance, a)}
                                sx={{ color: 'var(--color-primary)', bgcolor: 'rgba(99,102,241,0.05)', '&:hover': { bgcolor: 'rgba(99,102,241,0.1)' } }}
                                title="Toggle Status"
                              >
                                <EditIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'var(--text-tertiary)', textAlign: 'center', py: 2 }}>
                        No attendance data recorded.
                      </Typography>
                    )}
                  </Paper>
                
              );
            })}
          </Box>
        ) : (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--bg-glass-strong)', borderRadius: 1, border: '1px dashed var(--border-light)' }}>
            <Typography sx={{ color: 'var(--text-tertiary)' }}>{t('logs.noLogs')}</Typography>
          </Paper>
        )}

      </Box>
    
  );
}

export default CellLeaderAttendanceLogsPage;
