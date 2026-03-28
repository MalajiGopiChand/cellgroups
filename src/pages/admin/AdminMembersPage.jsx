import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Select, MenuItem, FormControl, InputLabel, Fade, Chip, CircularProgress } from '@mui/material';
import { DeleteOutline as DeleteIcon, FilterList as FilterIcon, PersonOutline as PersonIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

function AdminMembersPage({ onBack }) {
  const [members, setMembers] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [filterLeader, setFilterLeader] = useState('');
  const [filterPlace, setFilterPlace] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [membersSnap, leadersSnap] = await Promise.all([
          getDocs(collection(db, 'students')),
          getDocs(collection(db, 'cellleaders'))
        ]);
        setMembers(membersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLeaders(leadersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member?')) return;
    try {
      await deleteDoc(doc(db, 'students', id));
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const places = [...new Set(members.map(m => m.place))].filter(Boolean).sort();
  const filtered = members.filter(m => {
    if (filterLeader && m.cellLeaderId !== filterLeader) return false;
    if (filterPlace && m.place !== filterPlace) return false;
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
        
        {/* Header & Stats */}
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
              Cell Members
            </Typography>
          </Box>
          <Chip 
            label={`${filtered.length} Total`} 
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

        {/* Members List */}
        {filtered.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {filtered.map((m, idx) => (
              <Fade in timeout={300 + (idx * 50)} key={m.id}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    bgcolor: 'var(--bg-glass-strong)', 
                    backdropFilter: 'blur(12px)',
                    borderRadius: 4,
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 'var(--shadow-md)', borderColor: 'rgba(99,102,241,0.4)' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                      <PersonIcon />
                    </Box>
                    <Box>
                      <Typography fontWeight={700} sx={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>{m.name}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                        <Chip size="small" label={`By: ${m.cellLeaderName}`} sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'rgba(99,102,241,0.08)', color: 'var(--color-primary)', fontWeight: 600 }} />
                        <Chip size="small" label={m.place} sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'var(--bg-main)' }} />
                      </Box>
                    </Box>
                  </Box>
                  <IconButton 
                    color="error" 
                    size="small" 
                    onClick={() => handleDelete(m.id)} 
                    title="Delete Member"
                    sx={{ opacity: 0.6, '&:hover': { opacity: 1, bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              </Fade>
            ))}
          </Box>
        ) : (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--bg-glass-strong)', borderRadius: 4, border: '1px dashed var(--border-light)' }}>
            <Typography sx={{ color: 'var(--text-tertiary)' }}>No members found matching these filters.</Typography>
          </Paper>
        )}

      </Box>
    </Fade>
  );
}

export default AdminMembersPage;
