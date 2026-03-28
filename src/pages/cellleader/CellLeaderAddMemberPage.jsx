import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fade, TextField, Button, IconButton, Avatar, InputAdornment, Chip } from '@mui/material';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ArrowBack as ArrowBackIcon, Person as PersonIcon, LocationOn as LocationIcon, Group as GroupIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function CellLeaderAddMemberPage({ user, onBack }) {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMembers = async () => {
    if (!user?.id) return;
    const q = query(collection(db, 'students'), where('cellLeaderId', '==', user.id));
    const snap = await getDocs(q);
    setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(m => m.place === user?.place));
  };

  useEffect(() => {
    fetchMembers();
  }, [user?.id, user?.place]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    await addDoc(collection(db, 'students'), {
      name: fd.get('name'),
      place: user.place,
      cellLeaderName: user.name,
      cellLeaderId: user.id
    });
    await fetchMembers();
    setLoading(false);
    e.target.reset();
  };

  return (
    <Fade in timeout={350}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <IconButton 
            onClick={onBack ? onBack : () => navigate('/cellleader/dashboard')} 
            sx={{ 
              bgcolor: 'var(--bg-glass-strong)', 
              border: '1px solid var(--border-light)', 
              boxShadow: 'var(--shadow-sm)',
              '&:hover': { bgcolor: 'var(--bg-surface)' } 
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
            Add Member
          </Typography>
        </Box>
        <Paper 
          elevation={0}
          sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: 'var(--bg-glass-strong)', 
            backdropFilter: 'blur(12px)',
            borderRadius: 3,
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <form onSubmit={handleSubmit}>
            <TextField 
              name="name" label="Name of Member" fullWidth required 
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: 'var(--color-primary)' }} /></InputAdornment> }}
              sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'var(--bg-surface)' } }} 
            />
            <TextField 
              label="Place" value={user?.place || ''} fullWidth disabled 
              InputProps={{ startAdornment: <InputAdornment position="start"><LocationIcon sx={{ color: 'var(--text-tertiary)' }} /></InputAdornment> }}
              sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'var(--bg-surface)' } }} 
            />
            <TextField 
              label="Cell Leader" value={user?.name || ''} fullWidth disabled 
              InputProps={{ startAdornment: <InputAdornment position="start"><GroupIcon sx={{ color: 'var(--text-tertiary)' }} /></InputAdornment> }}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'var(--bg-surface)' } }} 
            />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              disabled={loading}
              sx={{ 
                bgcolor: 'var(--color-primary)', 
                color: '#fff',
                borderRadius: 999, 
                py: 1.5,
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                '&:hover': {
                  bgcolor: 'var(--color-primary-dark)',
                  boxShadow: '0 6px 16px rgba(99,102,241,0.4)',
                }
              }}
            >
              {loading ? 'Adding...' : 'Add Member'}
            </Button>
          </form>
        </Paper>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, mb: 1, px: 1 }}>
          My Members ({members.length})
        </Typography>
        <Paper 
          elevation={0}
          sx={{ 
            bgcolor: 'var(--bg-glass-strong)', 
            backdropFilter: 'blur(12px)',
            borderRadius: 3,
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden'
          }}
        >
          {members.map((m, index) => (
            <Box 
              key={m.id} 
              sx={{ 
                p: 2, 
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderBottom: index < members.length - 1 ? '1px solid var(--border-light)' : 'none',
                bgcolor: 'transparent'
              }}
            >
            <Avatar sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: 'var(--color-primary)', fontWeight: 700, width: 48, height: 48 }}>
              {m.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <LocationIcon sx={{ fontSize: 14, color: 'var(--text-tertiary)' }} /> {m.place}
              </Typography>
            </Box>
              <Chip size="small" label="Active" sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', fontWeight: 700, borderRadius: 2 }} />
            </Box>
          ))}
          {members.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="var(--text-tertiary)">No members found. Add one above.</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Fade>
  );
}

export default CellLeaderAddMemberPage;
