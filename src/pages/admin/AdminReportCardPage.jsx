import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Fade, IconButton,
  Grid, Card, CardContent, Divider, Chip
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, Event as EventIcon,
  Group as GroupIcon, PersonAdd as PersonAddIcon,
  MenuBook as BookIcon, Forum as ForumIcon,
  Star as StarIcon, Person as PersonIcon
} from '@mui/icons-material';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';

function AdminReportCardPage({ onBack }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <Fade in timeout={350}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <IconButton onClick={onBack} sx={{ bgcolor: 'transparent', color: 'var(--text-deep)', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
            Report Cards
          </Typography>
        </Box>

        {loading ? (
          <Typography sx={{ p: 3, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading reports...</Typography>
        ) : reports.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--bg-glass-strong)', borderRadius: 3, border: '1px dashed var(--border-light)' }}>
            <Typography color="var(--text-tertiary)">No reports submitted yet.</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {reports.map((report) => (
              <Card key={report.id} sx={{ borderRadius: 3, border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', bgcolor: 'var(--surface-white)' }}>
                <CardContent sx={{ p: 3 }}>
                  
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon /> {report.leaderName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Submitted a Report Card
                      </Typography>
                    </Box>
                    <Chip size="small" icon={<EventIcon fontSize="small"/>} label={`Meeting: ${report.meetingDate}`} sx={{ fontWeight: 700, bgcolor: 'var(--surface-sage)', color: 'var(--primary-forest)' }} />
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={3}>
                    {/* Attendance */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--text-deep)', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <GroupIcon fontSize="small" color="primary" /> Attendance
                      </Typography>
                      <Typography variant="body2"><strong>Present:</strong> {report.presentFamilies} Families</Typography>
                      <Typography variant="body2"><strong>Absent:</strong> {report.absentFamilies} Families</Typography>
                    </Grid>

                    {/* Visitor */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--text-deep)', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <PersonAddIcon fontSize="small" color="primary" /> New Visitor
                      </Typography>
                      {report.hasVisitor ? (
                        <>
                          <Typography variant="body2"><strong>Name:</strong> {report.visitorName}</Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}><strong>Prayer:</strong> {report.visitorPrayer}</Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No New Visitor</Typography>
                      )}
                    </Grid>

                    {/* Message */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--text-deep)', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <BookIcon fontSize="small" color="primary" /> Message Shared
                      </Typography>
                      <Typography variant="body2"><strong>Title:</strong> {report.messageTitle}</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap', bgcolor: 'rgba(0,0,0,0.02)', p: 1.5, borderRadius: 2 }}>{report.messageDescription}</Typography>
                    </Grid>

                    {/* Discussion */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--text-deep)', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <ForumIcon fontSize="small" color="primary" /> Discussion
                      </Typography>
                      {report.hasDiscussion ? (
                        <>
                          <Typography variant="body2"><strong>Topic:</strong> {report.discussionTopic}</Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}><strong>Details:</strong> {report.discussionDetails}</Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No Discussion Conducted</Typography>
                      )}
                    </Grid>

                    {/* Testimony */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--text-deep)', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <StarIcon fontSize="small" color="primary" /> Testimony
                      </Typography>
                      {report.hasTestimony ? (
                        <>
                          <Typography variant="body2"><strong>Name:</strong> {report.testimonyName}</Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}><strong>Details:</strong> {report.testimonyDetails}</Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No Testimony Shared</Typography>
                      )}
                    </Grid>
                  </Grid>

                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Fade>
  );
}

export default AdminReportCardPage;
