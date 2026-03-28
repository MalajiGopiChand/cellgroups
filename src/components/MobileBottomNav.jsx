import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, useTheme, useMediaQuery, Box } from '@mui/material';

function MobileBottomNav({ tabs, currentTab, onChange }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!isMobile) return null;

  return (
    <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
      <Paper 
        elevation={0}
        sx={{
          bgcolor: 'var(--bg-glass-strong)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border-light)',
          /* Support for iOS safe area at the bottom */
          pb: 'env(safe-area-inset-bottom)', 
        }}
      >
        <BottomNavigation
          showLabels
          value={currentTab}
          onChange={(event, newValue) => {
            onChange(newValue);
          }}
          sx={{
            bgcolor: 'transparent',
            height: 65,
            '& .MuiBottomNavigationAction-root': {
              color: 'var(--text-tertiary)',
              minWidth: 'auto',
              padding: '6px 0',
              transition: 'all 0.2s ease',
            },
            '& .Mui-selected': {
              color: 'var(--color-primary)',
            },
            '& .MuiBottomNavigationAction-label': {
              fontWeight: 600,
              fontSize: '0.65rem',
              mt: 0.5,
              '&.Mui-selected': {
                fontSize: '0.7rem',
                fontWeight: 800,
              }
            }
          }}
        >
          {tabs.map((tab, idx) => (
            <BottomNavigationAction 
              key={idx} 
              label={tab.label} 
              icon={tab.icon} 
              value={tab.id}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

export default MobileBottomNav;
