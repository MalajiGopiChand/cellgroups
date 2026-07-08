import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fade, Avatar, Grid, Chip, IconButton } from '@mui/material';
import { Cake as CakeIcon, Event as EventIcon, StarBorder as StarIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useLanguage } from '../contexts/LanguageContext';
import { useBirthdays } from '../hooks/useBirthdays';

function BirthdaysView({ user, isAdmin, onBack }) {
  const { t } = useLanguage();
  const { loading, todayList, upcomingList } = useBirthdays(user, isAdmin);
  const { width, height } = useWindowSize();

  if (loading) return null;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return '';
    return `${parseInt(parts[2], 10)} ${monthNames[parseInt(parts[1], 10) - 1]}`;
  };

  const BirthdayCard = ({ member, type }) => {
    const isToday = type === 'today';
    const isUpcoming = type === 'upcoming';
    
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'var(--bg-glass-strong)',
          backdropFilter: 'blur(12px)',
          borderRadius: 4,
          border: `1px solid ${isToday ? 'rgba(236,72,153,0.3)' : 'var(--border-light)'}`,
          boxShadow: isToday ? '0 8px 32px rgba(236,72,153,0.15)' : 'var(--shadow-sm)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 'var(--shadow-md)',
          }
        }}
      >
        {isToday && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #ec489a, #f43f5e, #8b5cf6)' }} />
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              width: 56, 
              height: 56, 
              background: isToday ? 'linear-gradient(135deg, #ec489a, #8b5cf6)' : 'rgba(99,102,241,0.1)',
              color: isToday ? '#fff' : 'var(--color-primary)',
              fontWeight: 800,
              fontSize: '1.2rem'
            }}
          >
            {member.name.charAt(0).toUpperCase()}
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {member.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.5, fontWeight: 500 }}>
              {formatDate(member.dob)}
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            {isToday ? (
              <Chip icon={<StarIcon fontSize="small"/>} label={t('bday.todayLabel')} size="small" sx={{ bgcolor: 'rgba(236,72,153,0.1)', color: '#ec489a', fontWeight: 700, px: 0.5 }} />
            ) : (
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, color: '#f59e0b', bgcolor: 'rgba(245, 158, 11, 0.1)', px: 1, py: 0.2, borderRadius: 1 }}>
                <EventIcon sx={{ fontSize: 14 }} />
                {t('bday.in')} {member.diffDays} {member.diffDays === 1 ? t('bday.day') : t('bday.days')}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    );
  };

  return (
    <Fade in timeout={350}>
      <Box sx={{ pb: 4 }}>
        {todayList.length > 0 && <Confetti width={width} height={height} recycle={false} numberOfPieces={300} gravity={0.15} />}
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
          {onBack && (
            <IconButton 
              onClick={onBack} 
              sx={{ 
                bgcolor: 'var(--bg-glass-strong)', 
                border: '1px solid var(--border-light)', 
                boxShadow: 'var(--shadow-sm)',
                '&:hover': { bgcolor: 'var(--bg-surface)' } 
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          )}
          <CakeIcon sx={{ color: '#ec489a', fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
            {t('bday.title')}
          </Typography>
        </Box>

        {todayList.length === 0 && upcomingList.length === 0 && (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--bg-glass-strong)', borderRadius: 4, border: '1px dashed var(--border-light)' }}>
            <Typography color="var(--text-tertiary)" fontWeight={500}>{t('bday.noBirthdays')}</Typography>
          </Paper>
        )}

        {todayList.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--color-success)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CakeIcon fontSize="small" /> {t('bday.today')}
            </Typography>
            <Grid container spacing={2}>
              {todayList.map(m => (
                <Grid item xs={12} sm={6} md={4} key={m.id}>
                  <BirthdayCard member={m} type="today" />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {upcomingList.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f59e0b', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventIcon fontSize="small" /> {t('bday.upcoming')}
            </Typography>
            <Grid container spacing={2}>
              {upcomingList.map(m => (
                <Grid item xs={12} sm={6} md={4} key={m.id}>
                  <BirthdayCard member={m} type="upcoming" />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Fade>
  );
}

export default BirthdaysView;
