import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  DashboardOutlined as DashboardOutlinedIcon,
  FactCheck as AttendanceIcon,
  FactCheckOutlined as AttendanceOutlinedIcon,
  ManageAccounts as ManageIcon,
  ManageAccountsOutlined as ManageOutlinedIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  BoltRounded as BoltIcon,
} from '@mui/icons-material';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '../theme';
import AdminHomePage from './admin/AdminHomePage';
import AdminApprovePage from './admin/AdminApprovePage';
import AdminMembersPage from './admin/AdminMembersPage';
import AdminAttendancePage from './admin/AdminAttendancePage';
import AdminAnnouncementsPage from './admin/AdminAnnouncementsPage';

const tabs = [
  { path: '/admin/dashboard', label: 'Home', icon: DashboardIcon, iconOut: DashboardOutlinedIcon },
  { path: '/admin/approve', label: 'Approve', icon: AttendanceIcon, iconOut: AttendanceOutlinedIcon },
  { path: '/admin/members', label: 'Members', icon: ManageIcon, iconOut: ManageOutlinedIcon },
  { path: '/admin/attendance', label: 'Attendance', icon: AttendanceIcon, iconOut: AttendanceOutlinedIcon },
  { path: '/admin/announcements', label: 'Announcements', icon: NotificationsIcon, iconOut: NotificationsIcon },
];

function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  const currentIndex = Math.max(0, tabs.findIndex(t => location.pathname === t.path));

  const renderContent = () => {
    switch (location.pathname) {
      case '/admin/approve': return <AdminApprovePage />;
      case '/admin/members': return <AdminMembersPage />;
      case '/admin/attendance': return <AdminAttendancePage />;
      case '/admin/announcements': return <AdminAnnouncementsPage />;
      default: return <AdminHomePage />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0', color: 'text.primary' }}>
          <Toolbar sx={{ py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 3, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.3)', color: '#fff' }}>
                <BoltIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.04em' }}>Bethel Cell Leaders</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>Admin • {user?.email}</Typography>
              </Box>
            </Box>
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip size="small" color="success" variant="outlined" label="Control Center" sx={{ borderRadius: 999 }} />
                <Button color="inherit" onClick={onLogout} startIcon={<LogoutIcon />} sx={{ borderRadius: 999, px: 2.5 }}>Logout</Button>
              </Box>
            )}
            {isMobile && (
              <Button onClick={onLogout} startIcon={<LogoutIcon />} sx={{ bgcolor: 'rgba(239,68,68,0.1)', color: 'error.main', '&:hover': { bgcolor: 'rgba(239,68,68,0.2)' }, borderRadius: 999, px: 1.5 }}>Logout</Button>
            )}
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, overflow: 'auto', pb: 12, px: 2, py: 3 }}>
          <Box sx={{ maxWidth: 900, margin: '0 auto' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
              {tabs.map((t, i) => (
                <Chip key={t.path} icon={location.pathname === t.path ? <t.icon /> : <t.iconOut />} label={t.label} variant={location.pathname === t.path ? 'filled' : 'outlined'} color="primary" sx={{ borderRadius: 999 }} onClick={() => navigate(t.path)} />
              ))}
            </Box>
            {renderContent()}
          </Box>
        </Box>

        <Paper sx={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, borderRadius: 999, bgcolor: '#ffffff', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', px: 1, width: '92%', maxWidth: 620 }} elevation={0}>
          <BottomNavigation value={currentIndex >= 0 ? currentIndex : 0} onChange={(e, v) => navigate(tabs[v]?.path || '/admin/dashboard')} showLabels sx={{ bgcolor: 'transparent', '& .MuiBottomNavigationAction-root': { minWidth: 'auto', padding: '8px 6px', color: '#64748b', '&.Mui-selected': { color: 'primary.main' }, '& .MuiSvgIcon-root': { transition: 'all 0.25s ease' }, '&.Mui-selected .MuiSvgIcon-root': { transform: 'translateY(-3px) scale(1.15)' }, '& .MuiBottomNavigationAction-label': { fontSize: 11, fontWeight: 600 } } }}>
            {tabs.map((t, i) => (
              <BottomNavigationAction key={t.path} label={t.label} icon={location.pathname === t.path ? <t.icon /> : <t.iconOut />} />
            ))}
          </BottomNavigation>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default AdminDashboard;
