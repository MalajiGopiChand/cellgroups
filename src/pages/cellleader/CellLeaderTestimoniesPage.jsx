import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Divider, Avatar } from '@mui/material';
import { Star as StarIcon, FormatQuote as QuoteIcon } from '@mui/icons-material';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

function CellLeaderTestimoniesPage({ onBack }) {
  const [testimonies, setTestimonies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonies = async () => {
      try {
        const q = query(
          collection(db, 'reports'),
          where('hasTestimony', '==', true)
        );
        const snap = await getDocs(q);
        
        const data = snap.docs.map(doc => {
          const docData = doc.data();
          let dateObj = null;
          let dateStr = 'Unknown Date';
          if (docData.timestamp && docData.timestamp.toDate) {
            dateObj = docData.timestamp.toDate();
            dateStr = dateObj.toLocaleDateString('en-GB').replace(/\//g, '-');
          }
          return {
            id: doc.id,
            dateObj,
            dateStr,
            testimonyName: docData.testimonyName,
            testimonyDetails: docData.testimonyDetails,
            leaderName: docData.leaderName
          };
        });

        // Sort manually by date descending (newest on top) 
        // since we queried with where clause and might not have composite index
        data.sort((a, b) => {
          const timeA = a.dateObj ? a.dateObj.getTime() : 0;
          const timeB = b.dateObj ? b.dateObj.getTime() : 0;
          return timeB - timeA;
        });

        setTestimonies(data);
      } catch (err) {
        console.error('Error fetching testimonies:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTestimonies();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: 'var(--primary-forest)' }} />
      </Box>
    );
  }

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
          border: '1px solid var(--border-light)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'var(--primary-forest)', color: '#fff' }}>
            <StarIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" className="font-playfair" sx={{ fontWeight: 800, color: 'var(--text-deep)' }}>
              Testimonies Archive
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              A collection of all shared testimonies from Cell Leader reports.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {testimonies.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--bg-glass-strong)', borderRadius: 1, border: '1px dashed var(--border-light)' }}>
          <Typography sx={{ color: 'var(--text-tertiary)' }}>No testimonies found.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {testimonies.map((t) => (
            <Paper 
              key={t.id}
              elevation={0}
              sx={{ 
                p: 3, 
                bgcolor: 'var(--surface-white)', 
                borderRadius: 1,
                border: '1px solid var(--border-neutral)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {t.testimonyName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Reported by {t.leaderName}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'var(--text-supporting)', fontWeight: 700, bgcolor: 'var(--bg-page)', px: 1.5, py: 0.5, borderRadius: 1 }}>
                  {t.dateStr}
                </Typography>
              </Box>
              
              <Divider sx={{ borderColor: 'rgba(0,0,0,0.04)' }} />
              
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <QuoteIcon sx={{ color: 'var(--primary-forest)', opacity: 0.2, fontSize: 32, transform: 'scaleX(-1)' }} />
                <Typography variant="body1" sx={{ color: 'var(--text-deep)', fontStyle: 'italic', lineHeight: 1.7, pt: 0.5 }}>
                  {t.testimonyDetails}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default CellLeaderTestimoniesPage;
