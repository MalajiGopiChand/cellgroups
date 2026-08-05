import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, IconButton, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, FilterList as FilterIcon, Download as DownloadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { downloadAsImage } from '../../utils/downloadImage';

function AdminMeetingPlacesPage({ onBack }) {
  const [places, setPlaces] = useState([]);
  const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [filterDate, setFilterDate] = useState(getLocalDate());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'meeting_places'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => {
        const docData = doc.data();
        let dateStr = docData.date || '';
        if (!dateStr && docData.timestamp && docData.timestamp.toDate) {
           dateStr = docData.timestamp.toDate().toLocaleDateString('en-GB').replace(/\//g, '-');
        }
        return { id: doc.id, dateStr, ...docData };
      });
      setPlaces(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this meeting place?")) {
      try {
        await deleteDoc(doc(db, 'meeting_places', id));
      } catch (err) {
        console.error("Error deleting meeting place:", err);
        alert("Failed to delete. Please check permissions.");
      }
    }
  };

  const filteredPlaces = filterDate
    ? places.filter(p => p.date === filterDate)
    : places;

  return (
    <Box>
      
      {/* Sleek Single-Line Filter Card */}
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
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />} 
          onClick={() => downloadAsImage('meeting-places-table', `Meeting_Places_${filterDate || 'All'}.png`)}
          sx={{ ml: 'auto', bgcolor: 'var(--primary-forest)', color: '#fff', borderRadius: 1, fontWeight: 700, boxShadow: 'none', '&:hover': { bgcolor: 'var(--primary-forest)', opacity: 0.9 } }}
        >
          Download Image
        </Button>
      </Paper>

      <Paper 
        elevation={0}
        sx={{ 
          bgcolor: 'var(--bg-glass-strong)', 
          backdropFilter: 'blur(12px)',
          borderRadius: 1,
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          }}
      >
        {loading ? (
          <Typography sx={{ p: 3, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</Typography>
        ) : filteredPlaces.length === 0 ? (
          <Typography sx={{ p: 4, textAlign: 'center', color: 'var(--text-tertiary)' }}>No meeting places found for this selection.</Typography>
        ) : (
          <Box id="meeting-places-table" sx={{ p: 1 }}>
            <Typography variant="h6" sx={{ display: 'none', mb: 2, color: 'var(--text-primary)', fontWeight: 800, pl: 2, pt: 1 }}>
              Meeting Places {filterDate && `- ${new Date(filterDate).toLocaleDateString('en-GB').replace(/\//g, '-')}`}
            </Typography>
            <TableContainer>
              <Table sx={{ minWidth: 400 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                    <TableCell sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>Cell Leader</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>Meeting Place</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>Last Updated</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPlaces.map((row) => (
                    <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 700, color: 'var(--text-deep)' }}>
                        {row.leaderName}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {row.address}
                      </TableCell>
                      <TableCell sx={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {row.dateStr || 'Unknown'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleDelete(row.id)} sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }} title="Delete Location">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default AdminMeetingPlacesPage;
