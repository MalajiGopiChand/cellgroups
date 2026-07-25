import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Fade, TextField, Button, IconButton,
  Grid, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
  InputAdornment, Alert, Divider
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, Event as EventIcon,
  Group as GroupIcon, PersonAdd as PersonAddIcon,
  MenuBook as BookIcon, Forum as ForumIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useLanguage } from '../../contexts/LanguageContext';

function CellLeaderReportCardPage({ user, onBack }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Date State
  const todayStr = new Date().toISOString().split('T')[0];
  const [meetingDate, setMeetingDate] = useState(todayStr);

  // Toggles
  const [hasVisitor, setHasVisitor] = useState('no');
  const [hasDiscussion, setHasDiscussion] = useState('no');
  const [hasTestimony, setHasTestimony] = useState('no');

  // Check if report exists for selected date
  useEffect(() => {
    const checkReport = async () => {
      if (!user?.id || !meetingDate) return;
      setChecking(true);
      try {
        const docRef = doc(db, 'reports', `${user.id}_${meetingDate}`);
        const snap = await getDoc(docRef);
        setAlreadySubmitted(snap.exists());
      } catch (err) {
        console.error(err);
      } finally {
        setChecking(false);
      }
    };
    checkReport();
  }, [user?.id, meetingDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    const fd = new FormData(e.target);

    const reportData = {
      leaderId: user.id,
      leaderName: user.name,
      meetingDate: meetingDate,
      presentFamilies: Number(fd.get('presentFamilies')),
      absentFamilies: Number(fd.get('absentFamilies')),
      
      hasVisitor: hasVisitor === 'yes',
      visitorName: hasVisitor === 'yes' ? fd.get('visitorName') : null,
      visitorPrayer: hasVisitor === 'yes' ? fd.get('visitorPrayer') : null,
      
      messageTitle: fd.get('messageTitle'),
      messageDescription: fd.get('messageDescription'),
      
      hasDiscussion: hasDiscussion === 'yes',
      discussionTopic: hasDiscussion === 'yes' ? fd.get('discussionTopic') : null,
      discussionDetails: hasDiscussion === 'yes' ? fd.get('discussionDetails') : null,
      
      hasTestimony: hasTestimony === 'yes',
      testimonyName: hasTestimony === 'yes' ? fd.get('testimonyName') : null,
      testimonyDetails: hasTestimony === 'yes' ? fd.get('testimonyDetails') : null,
      
      timestamp: new Date()
    };

    try {
      await setDoc(doc(db, 'reports', `${user.id}_${meetingDate}`), reportData);
      setSuccessMsg(t('report.success'));
      setAlreadySubmitted(true);
    } catch (err) {
      console.error('Error saving report:', err);
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    
      <Box>
        
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            mb: 3, 
            bgcolor: 'var(--bg-glass-strong)', 
            backdropFilter: 'blur(12px)',
            borderRadius: 1,
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {successMsg && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 1 }}>
              {successMsg}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <TextField 
              label={t('report.meetingDate')} 
              type="date" 
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              fullWidth 
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: todayStr }}
              InputProps={{ startAdornment: <InputAdornment position="start"><EventIcon sx={{ color: 'var(--color-primary)' }} /></InputAdornment> }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--bg-surface)' } }} 
            />
          </Box>

          {checking ? (
            <Typography>Checking status...</Typography>
          ) : alreadySubmitted ? (
            <Alert severity="info" sx={{ borderRadius: 1 }}>
              A report for {meetingDate} has already been submitted. You cannot edit or delete it.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Meeting Info */}
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--primary-forest)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon /> {t('report.title')}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField name="presentFamilies" label={t('report.presentFamilies')} type="number" fullWidth required inputProps={{ min: 0 }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--bg-surface)' } }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="absentFamilies" label={t('report.absentFamilies')} type="number" fullWidth required inputProps={{ min: 0 }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--bg-surface)' } }} />
                </Grid>
              </Grid>
              <Divider sx={{ mb: 3 }} />

              {/* New Visitor */}
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--primary-forest)', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonAddIcon /> {t('report.newVisitor')}
              </Typography>
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel component="legend" sx={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t('report.newVisitor')}?</FormLabel>
                <RadioGroup row value={hasVisitor} onChange={(e) => setHasVisitor(e.target.value)}>
                  <FormControlLabel value="yes" control={<Radio color="primary" />} label={t('report.yes')} />
                  <FormControlLabel value="no" control={<Radio color="primary" />} label={t('report.no')} />
                </RadioGroup>
              </FormControl>
              {hasVisitor === 'yes' && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12}>
                    <TextField name="visitorName" label={t('report.newVisitorName')} fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--bg-surface)' } }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField name="visitorPrayer" label={t('prayer.title')} fullWidth required multiline rows={2} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--bg-surface)' } }} />
                  </Grid>
                </Grid>
              )}
              <Divider sx={{ mb: 3 }} />

              {/* Message Shared */}
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--primary-forest)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BookIcon /> {t('report.msgShared')}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <TextField name="messageTitle" label={t('report.msgTitle')} fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--bg-surface)' } }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField name="messageDescription" label={t('report.msgDesc')} fullWidth required multiline rows={4} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--bg-surface)' } }} />
                </Grid>
              </Grid>
              <Divider sx={{ mb: 3 }} />

              {/* Discussion */}
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--primary-forest)', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ForumIcon /> {t('report.discussion')}
              </Typography>
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel component="legend" sx={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t('report.discConducted')}</FormLabel>
                <RadioGroup row value={hasDiscussion} onChange={(e) => setHasDiscussion(e.target.value)}>
                  <FormControlLabel value="yes" control={<Radio color="primary" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio color="primary" />} label="No" />
                </RadioGroup>
              </FormControl>
              {hasDiscussion === 'yes' && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12}>
                    <TextField name="discussionTopic" label={t('report.discTopic')} fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--bg-surface)' } }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField name="discussionDetails" label={t('report.discDetails')} fullWidth required multiline rows={3} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--bg-surface)' } }} />
                  </Grid>
                </Grid>
              )}
              <Divider sx={{ mb: 3 }} />

              {/* Testimony */}
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--primary-forest)', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon /> {t('report.testimony')}
              </Typography>
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel component="legend" sx={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t('report.testShared')}</FormLabel>
                <RadioGroup row value={hasTestimony} onChange={(e) => setHasTestimony(e.target.value)}>
                  <FormControlLabel value="yes" control={<Radio color="primary" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio color="primary" />} label="No" />
                </RadioGroup>
              </FormControl>
              {hasTestimony === 'yes' && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12}>
                    <TextField name="testimonyName" label={t('prayer.personName')} fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--bg-surface)' } }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField name="testimonyDetails" label={t('report.testDetails')} fullWidth required multiline rows={3} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--bg-surface)' } }} />
                  </Grid>
                </Grid>
              )}
              <Divider sx={{ mb: 3 }} />

              <Button 
                type="submit" 
                variant="contained" 
                fullWidth
                disabled={loading}
                sx={{ 
                  bgcolor: 'var(--color-primary)', color: '#fff', borderRadius: 199, py: 1.5, fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                  '&:hover': { bgcolor: 'var(--color-primary-dark)', boxShadow: '0 6px 16px rgba(99,102,241,0.4)' }
                }}
              >
                {loading ? 'Submitting...' : t('gen.submit')}
              </Button>
            </form>
          )}
        </Paper>
      </Box>
    
  );
}

export default CellLeaderReportCardPage;
