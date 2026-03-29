import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fade, Avatar, Grid, Chip, IconButton } from '@mui/material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Cake as CakeIcon, Event as EventIcon, Today as TodayIcon, StarBorder as StarIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

function BirthdaysView({ user, isAdmin, onBack }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { width, height } = useWindowSize();

  const [todayList, setTodayList] = useState([]);
  const [upcomingList, setUpcomingList] = useState([]);
  const [thisWeekList, setThisWeekList] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        let q;
        if (isAdmin) {
          // Admins see all members
          q = collection(db, 'students');
        } else if (user?.id) {
          // Cell Leaders see their own members
          q = query(collection(db, 'students'), where('cellLeaderId', '==', user.id));
        } else {
          return;
        }

        const snap = await getDocs(q);
        const mems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Filter by place for Cell Leaders (Admins don't filter by place unless implemented)
        const filtered = isAdmin ? mems : mems.filter(m => m.place === user?.place);
        setMembers(filtered);
      } catch (error) {
        console.error("Error fetching members for birthdays:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [user, isAdmin]);

  useEffect(() => {
    if (members.length === 0) return;

    const todayListTemp = [];
    const upcomingListTemp = [];
    const thisWeekListTemp = [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const currentDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDayOfWeek + 1);
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + (7 - currentDayOfWeek));

    members.forEach(member => {
      if (!member.dob) return;
      const parts = member.dob.split('-');
      if (parts.length !== 3) return;
      
      const bMonth = parseInt(parts[1], 10);
      const bDay = parseInt(parts[2], 10);
      
      // Calculate birthday this year
      let bdayThisYear = new Date(now.getFullYear(), bMonth - 1, bDay);
      
      // Calculate next occurrence
      let nextBday = new Date(bdayThisYear);
      if (nextBday < today) {
        nextBday.setFullYear(now.getFullYear() + 1);
      }
      
      const diffDays = Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24));
      const inThisWeek = bdayThisYear >= monday && bdayThisYear <= sunday;
      
      const bdayItem = { ...member, diffDays, nextBday, bMonth, bDay };
      
      if (diffDays === 0) {
        todayListTemp.push(bdayItem);
      } else if (diffDays > 0 && diffDays <= 3) {
        upcomingListTemp.push(bdayItem);
      }
      
      if (inThisWeek && diffDays !== 0) {
        thisWeekListTemp.push(bdayItem);
      }
    });

    upcomingListTemp.sort((a, b) => a.diffDays - b.diffDays);
    thisWeekListTemp.sort((a, b) => (new Date(now.getFullYear(), a.bMonth - 1, a.bDay)) - (new Date(now.getFullYear(), b.bMonth - 1, b.bDay)));

    setTodayList(todayListTemp);
    setUpcomingList(upcomingListTemp);
    setThisWeekList(thisWeekListTemp);
  }, [members]);

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
              <Chip icon={<StarIcon fontSize="small"/>} label="Today 🎉" size="small" sx={{ bgcolor: 'rgba(236,72,153,0.1)', color: '#ec489a', fontWeight: 700, px: 0.5 }} />
            ) : isUpcoming ? (
              <Chip label={`In ${member.diffDays} days`} size="small" sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 700 }} />
            ) : (
              <Chip label="This Week" size="small" sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: 'var(--color-primary)', fontWeight: 700 }} />
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
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
            Birthdays
          </Typography>
        </Box>

        {todayList.length === 0 && upcomingList.length === 0 && thisWeekList.length === 0 && (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--bg-glass-strong)', borderRadius: 4, border: '1px dashed var(--border-light)' }}>
            <Typography color="var(--text-tertiary)" fontWeight={500}>No birthdays around this time.</Typography>
          </Paper>
        )}

        {todayList.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ec489a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TodayIcon fontSize="small" /> Today's Birthdays
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
              <EventIcon fontSize="small" /> Upcoming (Next 3 Days)
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

        {thisWeekList.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--color-primary)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventIcon fontSize="small" /> This Week
            </Typography>
            <Grid container spacing={2}>
              {thisWeekList.map(m => (
                <Grid item xs={12} sm={6} md={4} key={m.id}>
                  <BirthdayCard member={m} type="thisWeek" />
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
