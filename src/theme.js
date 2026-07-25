import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4F46E5',
      light: '#818CF8',
      dark: '#3730A3',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7C3AED',
      light: '#A78BFA',
      dark: '#5B21B6',
      contrastText: '#FFFFFF',
    },
    background: {
      default: 'transparent',
      paper: 'rgba(255, 255, 255, 0.85)',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    h1: { fontFamily: '"Playfair Display", serif', fontWeight: 700, color: '#0F172A' },
    h2: { fontFamily: '"Playfair Display", serif', fontWeight: 700, color: '#0F172A' },
    h3: { fontFamily: '"Playfair Display", serif', fontWeight: 700, color: '#0F172A' },
    h4: { fontFamily: '"Playfair Display", serif', fontWeight: 700, color: '#0F172A' },
    h5: { fontFamily: '"Playfair Display", serif', fontWeight: 700, color: '#0F172A' },
    h6: { fontFamily: '"Playfair Display", serif', fontWeight: 700, color: '#0F172A' },
    subtitle1: { fontWeight: 700, color: '#1E293B' },
    body1: { fontSize: 14 },
    body2: { fontSize: 14, color: '#475569' },
    button: { textTransform: 'none', fontWeight: 700, fontSize: 14 },
    caption: { fontSize: 12, color: '#64748B' },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: 'none',
          padding: '12px 24px',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.15)',
          },
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 21,
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          border: '1px solid #E2E8F0',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 21,
        },
      },
    },
  },
});
