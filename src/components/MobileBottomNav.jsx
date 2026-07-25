import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, useTheme, useMediaQuery, Box } from '@mui/material';

function MobileBottomNav({ tabs, currentTab, onChange }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!isMobile) return null;

  return (
    <Box sx={{ borderTop: '1px solid var(--border-neutral)', zIndex: 1000, pb: 'env(safe-area-inset-bottom)' }}>
      <Paper 
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: 0,
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
              color: 'var(--text-muted)',
              minWidth: 'auto',
              padding: '6px 0',
              transition: 'all 0.2s ease',
            },
            '& .Mui-selected': {
              color: 'var(--text-deep)',
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
              icon={
                <Box sx={{ 
                  bgcolor: currentTab === tab.id ? 'var(--primary-forest)' : 'transparent',
                  color: currentTab === tab.id ? 'var(--surface-white)' : 'inherit',
                  borderRadius: 1,
                  px: 2, 
                  py: 0.5,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}>
                  {tab.icon}
                </Box>
              } 
              value={tab.id}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

export default MobileBottomNav;
