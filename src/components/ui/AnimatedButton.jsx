import React from 'react';
import { Button } from '@mui/material';

const AnimatedButton = ({ children, ...props }) => {
  return (
    <Button
      {...props}
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 2,
        boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
        },
        '&:active': {
          transform: 'scale(0.95)',
        },
        ...props.sx
      }}
    >
      {children}
    </Button>
  );
};

export default AnimatedButton;
