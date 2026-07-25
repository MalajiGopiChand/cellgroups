import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Fade, 
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
} from '@mui/icons-material';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';

function AdminMeetingPlacesPage({ onBack }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'meeting_places'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlaces(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <Fade in timeout={350}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <IconButton 
            onClick={onBack} 
            sx={{ 
              bgcolor: 'transparent', 
              color: 'var(--text-deep)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } 
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
            Cell Group Meeting Places
          </Typography>
        </Box>

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
          {loading ? (
            <Typography sx={{ p: 3, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</Typography>
          ) : places.length === 0 ? (
            <Typography sx={{ p: 4, textAlign: 'center', color: 'var(--text-tertiary)' }}>No meeting places saved yet.</Typography>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 400 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                    <TableCell sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>Cell Leader</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>Meeting Place</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {places.map((row) => (
                    <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 700, color: 'var(--text-deep)' }}>
                        {row.leaderName}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {row.address}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Fade>
  );
}

export default AdminMeetingPlacesPage;
