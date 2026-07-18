import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#315B46',
      light: '#45785C',
      dark: '#1E3C2D',
      contrastText: '#FBF4DF',
    },
    secondary: {
      main: '#B7782A',
      light: '#D5B16C',
      dark: '#8C5B1F',
      contrastText: '#FFFDF8',
    },
    background: {
      default: 'transparent', // The body has the gradient
      paper: 'rgba(255, 255, 255, 0.75)',
    },
    text: {
      primary: '#283D32',
      secondary: '#788279',
    },
    divider: '#E8E6DF',
  },
  typography: {
    fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    h1: { fontFamily: '"Playfair Display", serif', fontWeight: 700, color: '#293F33' },
    h2: { fontFamily: '"Playfair Display", serif', fontWeight: 700, color: '#293F33' },
    h3: { fontFamily: '"Playfair Display", serif', fontWeight: 700, color: '#293F33' },
    h4: { fontFamily: '"Playfair Display", serif', fontWeight: 700, color: '#293F33' },
    h5: { fontFamily: '"Playfair Display", serif', fontWeight: 700, color: '#293F33' },
    h6: { fontFamily: '"Playfair Display", serif', fontWeight: 700, color: '#293F33' },
    subtitle1: { fontWeight: 700, color: '#34473B' },
    body1: { fontSize: 14 },
    body2: { fontSize: 14, color: '#788279' },
    button: { textTransform: 'none', fontWeight: 700, fontSize: 14 },
    caption: { fontSize: 12, color: '#7E887F' },
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
            boxShadow: '0 12px 28px rgba(49, 91, 70, 0.15)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 21,
          boxShadow: '0 2px 8px rgba(62, 72, 60, 0.05)',
          border: '1px solid #E8E6DF',
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(16px)',
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
