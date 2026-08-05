import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, Fade, Chip, CircularProgress, Divider, IconButton, TextField, Button } from '@mui/material';
import { EventAvailable as EventIcon, FilterList as FilterIcon, ArrowBack as ArrowBackIcon, Download as DownloadIcon } from '@mui/icons-material';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { DeleteOutline as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';

function AdminAttendancePage({ onBack }) {
  const [attendance, setAttendance] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [filterLeader, setFilterLeader] = useState('');
  const [filterPlace, setFilterPlace] = useState('');
  const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [filterDate, setFilterDate] = useState(getLocalDate());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [attSnap, leadersSnap] = await Promise.all([
          getDocs(collection(db, 'memberAttendance')),
          getDocs(collection(db, 'cellleaders'))
        ]);
        
        const leadersData = leadersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Group by leader and date
        const grouped = {};
        
        attSnap.docs.forEach(d => {
          const data = d.data();
          const key = `${data.leaderId}_${data.date}`;
          if (!grouped[key]) {
            grouped[key] = {
              id: key,
              date: data.date,
              cellLeaderId: data.leaderId,
              place: data.cellId,
              attendance: []
            };
          }
          grouped[key].attendance.push({
            id: d.id,
            studentId: data.memberId,
            name: data.memberName,
            status: data.status
          });
        });

        const logs = Object.values(grouped);
        logs.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setAttendance(logs);
        setLeaders(leadersData);
      } catch (error) {
        console.error('Error fetching attendance logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleToggleStatus = async (recordId, currentArray, studentObj) => {
    try {
      const newStatus = studentObj.status === 'present' ? 'absent' : 'present';
      await updateDoc(doc(db, 'memberAttendance', studentObj.id), { status: newStatus });

      const updatedArray = currentArray.map(a => {
        if (a.id === studentObj.id) {
          return { ...a, status: newStatus };
        }
        return a;
      });

      setAttendance(prev => prev.map(rec => rec.id === recordId ? { ...rec, attendance: updatedArray } : rec));
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update status.');
    }
  };

  const places = [...new Set(attendance.map(a => a.place))].filter(Boolean).sort();
  const filtered = attendance.filter(a => {
    if (filterLeader && a.cellLeaderId !== filterLeader) return false;
    if (filterPlace && a.place !== filterPlace) return false;
    if (filterDate && a.date !== filterDate) return false;
    return true;
  });

  const handleExport = () => {
    const exportData = [];
    filtered.forEach(rec => {
      const leaderObj = leaders.find(l => l.id === rec.cellLeaderId);
      const leaderName = leaderObj ? leaderObj.name : 'Unknown Leader';
      
      rec.attendance.forEach(a => {
        exportData.push({
          Date: rec.date,
          'Cell Leader': leaderName,
          Place: rec.place,
          'Member Name': a.name,
          Status: a.status.toUpperCase()
        });
      });
    });

    if (exportData.length === 0) {
      alert("No data to export.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Attendance_Export_${new Date().getTime()}.xlsx`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </Box>
    );
  }

  return (
    
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Sleek Single-Line Filter Card */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 1.5, 
            display: 'flex', 
            gap: 1.5, alignItems: 'center',
            bgcolor: 'var(--bg-glass-strong)', 
            backdropFilter: 'blur(12px)',
            borderRadius: 1,
            border: '1px solid var(--border-light)',
            flexWrap: 'wrap',
            mb: 1
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
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexGrow: 1 }}>
            <FormControl size="small" sx={{ minWidth: 110, flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--surface-white)' } }}>
              <InputLabel>Cell Leader</InputLabel>
              <Select 
                value={filterLeader} 
                label="Cell Leader" 
                onChange={(e) => setFilterLeader(e.target.value)}
              >
                <MenuItem value=""><em>All Leaders</em></MenuItem>
                {leaders.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 110, flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--surface-white)' } }}>
              <InputLabel>Place</InputLabel>
              <Select 
                value={filterPlace} 
                label="Place" 
                onChange={(e) => setFilterPlace(e.target.value)}
              >
                <MenuItem value=""><em>All Places</em></MenuItem>
                {places.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />} 
            onClick={handleExport}
            sx={{ bgcolor: 'var(--primary-forest)', '&:hover': { bgcolor: '#059669' }, borderRadius: 1 }}
          >
            Export Excel
          </Button>
        </Paper>

        {/* Attendance Records */}
        {filtered.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filtered.map((rec, i) => {
              const presentCount = rec.attendance?.filter(a => a.status === 'present').length || 0;
              const totalCount = rec.attendance?.length || 0;
              
              const leaderObj = leaders.find(l => l.id === rec.cellLeaderId);
              const leaderName = leaderObj ? leaderObj.name : 'Unknown Leader';

              return (
                  <Paper 
                    key={rec.id}
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      bgcolor: 'var(--bg-glass-strong)', 
                      backdropFilter: 'blur(12px)',
                      borderRadius: 1,
                      border: '1px solid var(--border-light)',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.2s ease',
                      '&:hover': { boxShadow: 'var(--shadow-md)', borderColor: 'rgba(99,102,241,0.2)' },
                      }}
                  >
                    {/* Log Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <EventIcon />
                        </Box>
                        <Box>
                          <Typography fontWeight={700} sx={{ color: 'var(--text-primary)' }}>{rec.date}</Typography>
                          <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                            {rec.place} • By {leaderName}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                        <Chip 
                          size="small" 
                          label={`${presentCount}/${totalCount} Members Present`} 
                          sx={{ bgcolor: presentCount > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: presentCount > 0 ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 700 }} 
                        />
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
            <Typography sx={{ color: 'var(--text-tertiary)' }}>No attendance logs found matching filters.</Typography>
          </Paper>
        )}

      </Box>
    
  );
}

export default AdminAttendancePage;
