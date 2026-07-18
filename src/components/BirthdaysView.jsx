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
          bgcolor: isToday ? 'var(--surface-gold)' : 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(12px)',
          borderRadius: '21px',
          border: '1px solid var(--border-neutral)',
          boxShadow: isToday ? '0 8px 32px rgba(207,138,66,0.15)' : 'var(--shadow-sm)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 'var(--shadow-md)',
          }
        }}
      >
        {isToday && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #CF8A42, #E6A756)' }} />
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              width: 56, 
              height: 56, 
              background: isToday ? 'linear-gradient(135deg, #CF8A42, #E6A756)' : 'var(--bg-glass-strong)',
              color: isToday ? '#fff' : 'var(--text-gold)',
              fontWeight: 800,
              fontSize: '1.2rem',
              border: isToday ? 'none' : '1px solid var(--border-neutral)'
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
              <Chip icon={<StarIcon fontSize="small"/>} label={t('bday.todayLabel')} size="small" sx={{ bgcolor: 'rgba(207,138,66,0.1)', color: 'var(--text-gold)', fontWeight: 700, px: 0.5, border: 'none' }} />
            ) : (
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, color: 'var(--text-deep)', bgcolor: 'rgba(0,0,0,0.04)', px: 1, py: 0.2, borderRadius: 1 }}>
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
                bgcolor: 'transparent', 
                color: 'var(--text-deep)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } 
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <CakeIcon sx={{ color: 'var(--text-gold)', fontSize: 32 }} />
          <Typography variant="h5" className="font-playfair" sx={{ fontWeight: 700, color: 'var(--text-deep)' }}>
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
            <Typography variant="subtitle1" className="font-playfair" sx={{ fontSize: 18, fontWeight: 700, color: 'var(--text-gold)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
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
            <Typography variant="subtitle1" className="font-playfair" sx={{ fontSize: 18, fontWeight: 700, color: 'var(--text-deep)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
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
