import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, IconButton, Grid, Divider, CircularProgress, Card, CardContent, Chip 
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, FamilyRestroom as FamilyIcon, 
  Person as PersonIcon, EventAvailable as EventIcon, 
  VolunteerActivism as PrayerIcon, Star as StarIcon, 
  Phone as PhoneIcon, LocationOn as LocationIcon 
} from '@mui/icons-material';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

function AdminFamilyProfilePage({ family, onBack }) {
  const [loading, setLoading] = useState(true);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [testimonies, setTestimonies] = useState([]);

  useEffect(() => {
    const fetchFamilyData = async () => {
      try {
        const familyNames = new Set(family.members.map(m => m.name.toLowerCase().trim()));
        
        // 1. Fetch Attendance
        const attSnap = await getDocs(collection(db, 'attendance'));
        const fAtt = [];
        attSnap.forEach(docSnap => {
          const data = docSnap.data();
          if (data.attendance) {
            const familyRecords = data.attendance.filter(a => familyNames.has(a.name.toLowerCase().trim()));
            if (familyRecords.length > 0) {
              fAtt.push({ ...data, id: docSnap.id, familyRecords });
            }
          }
        });
        fAtt.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAttendanceLogs(fAtt);

        // 2. Fetch Prayer Requests
        const prQ = query(collection(db, 'prayer_requests'), orderBy('timestamp', 'desc'));
        const prSnap = await getDocs(prQ);
        const fPr = [];
        prSnap.forEach(docSnap => {
          const data = docSnap.data();
          if (familyNames.has((data.personName || '').toLowerCase().trim())) {
            fPr.push({ id: docSnap.id, ...data });
          }
        });
        setPrayerRequests(fPr);

        // 3. Fetch Testimonies / Visitor Records from Reports
        const rQ = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
        const rSnap = await getDocs(rQ);
        const fTestimonies = [];
        rSnap.forEach(docSnap => {
          const data = docSnap.data();
          let isMatch = false;
          let matchType = '';
          if (data.hasTestimony && familyNames.has((data.testimonyName || '').toLowerCase().trim())) {
            isMatch = true;
            matchType = 'Testimony';
          }
          if (data.hasVisitor && familyNames.has((data.visitorName || '').toLowerCase().trim())) {
            isMatch = true;
            matchType = 'Visitor';
          }
          if (isMatch) {
            fTestimonies.push({ id: docSnap.id, matchType, ...data });
          }
        });
        setTestimonies(fTestimonies);

      } catch (err) {
        console.error("Error fetching family profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (family) {
      fetchFamilyData();
    }
  }, [family]);

  if (!family) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>

      <Grid container spacing={3}>
        {/* Family Details Card */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'var(--bg-glass-strong)', borderRadius: 1, border: '1px solid var(--border-light)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <FamilyIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {family.head.name}'s Family Profile
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>{family.members.length} Members</Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {family.members.map(m => (
                <Box key={m.id} sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 1 }}>
                  <Typography sx={{ fontWeight: 700, color: 'var(--text-deep)' }}>{m.name}</Typography>
                  <Chip size="small" label={m.relation || 'Head'} sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(99,102,241,0.1)', color: 'var(--color-primary)' }} />
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--text-secondary)', mb: 2 }}>CELL LEADER ASSIGNMENT</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PersonIcon sx={{ color: 'var(--color-primary)' }} />
                <Typography sx={{ fontWeight: 700 }}>{family.head.cellLeaderName || 'Unknown Leader'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocationIcon sx={{ color: 'var(--color-primary)' }} />
                <Typography sx={{ fontWeight: 700 }}>{family.head.place || 'Unknown Place'}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Dynamic Aggregated Data */}
        <Grid item xs={12} md={7}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Testimonies / Report Matches */}
              {testimonies.length > 0 && (
                <Paper elevation={0} sx={{ p: 3, bgcolor: 'var(--bg-glass-strong)', borderRadius: 1, border: '1px solid var(--border-light)' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <StarIcon /> Testimonies & Reports
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {testimonies.map(t => (
                      <Box key={t.id} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-deep)' }}>{t.meetingDate}</Typography>
                          <Chip size="small" label={t.matchType} sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(16,185,129,0.1)', color: 'var(--color-success)' }} />
                        </Box>
                        {t.matchType === 'Testimony' ? (
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{t.testimonyDetails}" - {t.testimonyName}</Typography>
                        ) : (
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>Visitor: {t.visitorName} (Prayer: {t.visitorPrayer})</Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}

              {/* Prayer Requests */}
              {prayerRequests.length > 0 && (
                <Paper elevation={0} sx={{ p: 3, bgcolor: 'var(--bg-glass-strong)', borderRadius: 1, border: '1px solid var(--border-light)' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PrayerIcon /> Prayer Requests
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {prayerRequests.map(pr => (
                      <Box key={pr.id} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: 'var(--text-deep)' }}>{pr.personName}</Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>{pr.request}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}

              {/* Attendance Timeline */}
              {attendanceLogs.length > 0 ? (
                <Paper elevation={0} sx={{ p: 3, bgcolor: 'var(--bg-glass-strong)', borderRadius: 1, border: '1px solid var(--border-light)' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <EventIcon /> Attendance History
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {attendanceLogs.map(log => (
                      <Box key={log.id} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-deep)', mb: 1 }}>{log.date} ({log.place})</Typography>
                        {log.familyRecords.map((r, i) => (
                          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>{r.name}</Typography>
                            <Chip size="small" label={r.status} sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: r.status === 'present' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: r.status === 'present' ? 'var(--color-success)' : 'var(--color-error)' }} />
                          </Box>
                        ))}
                      </Box>
                    ))}
                  </Box>
                </Paper>
              ) : (
                <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--bg-glass-strong)', borderRadius: 1, border: '1px dashed var(--border-light)' }}>
                  <Typography sx={{ color: 'var(--text-tertiary)' }}>No historical data found for this family yet.</Typography>
                </Paper>
              )}

            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminFamilyProfilePage;
