import React, { useState } from 'react';
import { 
  IconButton, Badge, Popover, Box, Typography, List, ListItem, 
  ListItemAvatar, Avatar, ListItemText, Divider, Button
} from '@mui/material';
import { NotificationsActiveRounded as NotificationsIcon, Cake as CakeIcon, Event as EventIcon } from '@mui/icons-material';
import { useBirthdays } from '../hooks/useBirthdays';
import { useLanguage } from '../contexts/LanguageContext';

function BirthdayNotificationBar({ user, isAdmin, onNavigateToBirthdays }) {
  const { loading, beforeTuesdayList } = useBirthdays(user, isAdmin);
  const { t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'birthday-popover' : undefined;

  const bdayCount = beforeTuesdayList.length;

  return (
    <>
      <IconButton 
        onClick={handleClick}
        sx={{ 
          color: bdayCount > 0 ? '#ec489a' : 'var(--text-secondary)',
          bgcolor: bdayCount > 0 ? 'rgba(236,72,153,0.1)' : 'transparent',
          '&:hover': { bgcolor: bdayCount > 0 ? 'rgba(236,72,153,0.2)' : 'rgba(0,0,0,0.05)' }
        }}
      >
        <Badge badgeContent={bdayCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1.5,
            width: 320,
            borderRadius: 4,
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            bgcolor: 'var(--bg-surface)'
          }
        }}
      >
        <Box sx={{ p: 2, bgcolor: 'rgba(236, 72, 153, 0.05)', borderBottom: '1px solid var(--border-light)' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CakeIcon sx={{ color: '#ec489a', fontSize: 20 }} />
            {t('bday.upcoming')}
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
            {t('bday.thisWeek')}
          </Typography>
        </Box>
        
        <List sx={{ p: 0, maxHeight: 300, overflow: 'auto' }}>
          {loading ? (
            <Typography sx={{ p: 3, textAlign: 'center', color: 'var(--text-tertiary)' }}>{t('common.loading')}</Typography>
          ) : bdayCount > 0 ? (
            beforeTuesdayList.map((m, index) => (
              <React.Fragment key={m.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem sx={{ py: 1.5 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: m.diffDays === 0 ? '#ec489a' : 'rgba(245,158,11,0.2)', color: m.diffDays === 0 ? '#fff' : '#f59e0b', width: 40, height: 40 }}>
                      <CakeIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={<Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</Typography>}
                    secondary={
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: m.diffDays === 0 ? '#ec489a' : (m.diffDays < 0 ? '#6b7280' : '#f59e0b'), fontWeight: 600, mt: 0.5 }}>
                        <EventIcon sx={{ fontSize: 14 }} />
                        {m.diffDays === 0 ? t('bday.todayLabel') : (m.diffDays < 0 ? `${Math.abs(m.diffDays)} ${Math.abs(m.diffDays) > 1 ? t('bday.days') : t('bday.day')} ${t('bday.ago')}` : `${t('bday.in')} ${m.diffDays} ${m.diffDays > 1 ? t('bday.days') : t('bday.day')}`)}
                      </Typography>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'var(--text-tertiary)' }}>
                {t('bday.noBirthdaysThisWeek')}
              </Typography>
            </Box>
          )}
        </List>
        
        <Box sx={{ p: 1.5, borderTop: '1px solid var(--border-light)', bgcolor: 'var(--bg-main)' }}>
          <Button 
            fullWidth 
            variant="text" 
            sx={{ fontWeight: 700, color: 'var(--color-primary)', textTransform: 'none' }}
            onClick={() => {
              handleClose();
              if (onNavigateToBirthdays) onNavigateToBirthdays();
            }}
          >
            {t('bday.viewAll')}
          </Button>
        </Box>
      </Popover>
    </>
  );
}

export default BirthdayNotificationBar;
