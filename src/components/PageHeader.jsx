import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

export default function PageHeader({ title, onBack }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Playfair Display, serif' }}>
        {title}
      </Typography>
    </Box>
  );
}
