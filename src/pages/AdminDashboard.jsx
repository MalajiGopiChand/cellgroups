import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Paper,
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery,
  Fade,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Badge,
  Divider,
} from '@mui/material';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '../theme';

import {
  Dashboard as DashboardIcon,
  FactCheck as AttendanceIcon,
  ManageAccounts as ManageIcon,
  NotificationsActiveRounded as NotificationsIcon,
  Logout as LogoutIcon,
  BoltRounded as BoltIcon,
  ThumbUp as ApproveIcon,
  People as PeopleIcon,
  Announcement as AnnouncementIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';

import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

// Cellgroups Components
import AdminHomePage from './admin/AdminHomePage';
import AdminApprovePage from './admin/AdminApprovePage';
import AdminMembersPage from './admin/AdminMembersPage';
import AdminAttendancePage from './admin/AdminAttendancePage';
import AdminAnnouncementsPage from './admin/AdminAnnouncementsPage';
import MobileBottomNav from '../components/MobileBottomNav';

function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.between('sm', 'md'));

  // Tab State
  const [currentTab, setCurrentTab] = useState(() => {
    const savedTab = sessionStorage.getItem('AdminDashboard_currentTab');
    return savedTab ? parseInt(savedTab, 10) : 0;
  });
  
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    totalMembers: 0,
    todayAttendance: 0,
    activeAnnouncements: 0
  });

  useEffect(() => {
    sessionStorage.setItem('AdminDashboard_currentTab', currentTab.toString());
    // Also enforce the URL to stay clean at /admin/dashboard
    window.history.replaceState(null, '', '/admin/dashboard');
  }, [currentTab]);

  useEffect(() => {
    const unsubLeaders = onSnapshot(collection(db, 'cellleaders'), (snap) => {
      let pending = 0;
      snap.forEach(doc => {
        if (!doc.data().approved) pending++;
      });
      setStats(prev => ({ ...prev, pendingApprovals: pending }));
    });

    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      setStats(prev => ({ ...prev, totalMembers: snap.size }));
    });

    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snap) => {
      setStats(prev => ({ ...prev, activeAnnouncements: snap.size }));
    });

    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snap) => {
      const todayStr = new Date().toISOString().split('T')[0];
      let todayCount = 0;
      let presentCount = 0;
      snap.forEach(doc => {
        const data = doc.data();
        if (data.date === todayStr && Array.isArray(data.attendance)) {
          data.attendance.forEach(record => {
            todayCount++;
            if (record.status && record.status.toLowerCase() === 'present') {
              presentCount++;
            }
          });
        }
      });
      const attendanceRate = todayCount > 0 ? Math.round((presentCount / todayCount) * 100) : 0;
      setStats(prev => ({ ...prev, todayAttendance: attendanceRate }));
    });

    return () => {
      unsubLeaders();
      unsubStudents();
      unsubAnnouncements();
      unsubAttendance();
    };
  }, []);

  // Navigation buttons configuration
  const navButtons = [
    { 
      id: 0, 
      label: 'Dashboard', 
      icon: <DashboardIcon />, 
      color: '#6366f1',
      description: 'Overview & Stats'
    },
    { 
      id: 1, 
      label: 'Approvals', 
      icon: <ApproveIcon />, 
      color: '#10b981',
      description: 'Pending requests',
      badge: stats.pendingApprovals
    },
    { 
      id: 2, 
      label: 'Members', 
      icon: <PeopleIcon />, 
      color: '#f59e0b',
      description: 'Manage members'
    },
    { 
      id: 3, 
      label: 'Attendance', 
      icon: <AttendanceIcon />, 
      color: '#8b5cf6',
      description: 'Track attendance'
    },
    { 
      id: 4, 
      label: 'Announcements', 
      icon: <AnnouncementIcon />, 
      color: '#ec489a',
      description: 'Send alerts',
      badge: stats.activeAnnouncements
    },
  ];

  const renderTabContent = () => {
    const content = (() => {
      switch (currentTab) {
        case 0: return <AdminHomePage />;
        case 1: return <AdminApprovePage onBack={() => setCurrentTab(0)} />;
        case 2: return <AdminMembersPage onBack={() => setCurrentTab(0)} />;
        case 3: return <AdminAttendancePage onBack={() => setCurrentTab(0)} />;
        case 4: return <AdminAnnouncementsPage onBack={() => setCurrentTab(0)} />;
        default: return <AdminHomePage />;
      }
    })();

    return (
      <Fade in timeout={350} key={currentTab}>
        <Box>
          {content}
        </Box>
      </Fade>
    );
  };

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Members',
      value: stats.totalMembers,
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)',
      trend: '+12 this month'
    },
    {
      title: "Today's Attendance",
      value: `${stats.todayAttendance}%`,
      icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      trend: 'Above average'
    }
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'var(--bg-main)',
        }}
      >
        {/* Top App Bar with glassmorphism */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'var(--bg-glass-strong)',
            backgroundImage: 'none',
            borderBottom: '1px solid var(--border-light)',
            backdropFilter: 'blur(22px)',
          }}
        >
          <Toolbar sx={{ py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
              <Box
                component="img"
                src="/icon.png"
                alt="Bethel Logo"
                sx={{
                  width: 45,
                  height: 45,
                  objectFit: 'contain',
                }}
              />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
                  Bethel Admin
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {user?.email || 'Admin'}
                </Typography>
              </Box>
            </Box>

            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  label="Admin Control"
                  sx={{ borderRadius: 2 }}
                />
                <Tooltip title="Logout">
                  <Button
                    onClick={onLogout}
                    startIcon={<LogoutIcon />}
                    sx={{ 
                      borderRadius: 2, 
                      px: 2.5, 
                      color: 'var(--text-primary)', 
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444'
                      }
                    }}
                  >
                    Logout
                  </Button>
                </Tooltip>
              </Box>
            )}

            {isMobile && (
              <IconButton
                onClick={onLogout}
                sx={{
                  color: '#ef4444',
                  bgcolor: 'rgba(239,68,68,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(239,68,68,0.2)',
                  }
                }}
              >
                <LogoutIcon />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', pb: isMobile ? '100px' : 6 }}>
          <Container maxWidth="lg" sx={{ py: 3 }}>
            
            {/* Quick Stats Cards - Only show on Dashboard tab */}
            {currentTab === 0 && (
              <Fade in timeout={400}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 2 }}>
                    Quick Overview
                  </Typography>
                  <Grid container spacing={isMobile ? 1.5 : 2}>
                    {statsCards.map((stat, index) => (
                      <Grid item xs={12} sm={6} md={6} key={index}>
                        <Card
                          sx={{
                            borderRadius: 3,
                            background: 'var(--bg-glass-strong)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid var(--border-light)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 'var(--shadow-lg)',
                            }
                          }}
                        >
                          <CardContent sx={{ 
                            p: isMobile ? 2 : 2.5,
                            '&:last-child': { pb: isMobile ? 2 : 2.5 }
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: isMobile ? 1.5 : 2 }}>
                              <Avatar
                                sx={{
                                  bgcolor: stat.bgColor,
                                  color: stat.color,
                                  width: 48,
                                  height: 48,
                                  borderRadius: 2
                                }}
                              >
                                {stat.icon}
                              </Avatar>
                              {stat.trend && (
                                <Chip
                                  size="small"
                                  label={stat.trend}
                                  sx={{
                                    fontSize: '0.65rem',
                                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                                    color: '#10b981',
                                    height: 22
                                  }}
                                />
                              )}
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 0.5 }}>
                              {stat.value}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                              {stat.title}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Fade>
            )}

            {/* Navigation Buttons Grid - Hidden on Mobile */}
            {currentTab === 0 && !isMobile && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 2 }}>
                  Quick Actions
                </Typography>
                <Grid container spacing={isMobile ? 1.5 : 2}>
                  {navButtons.map((button) => (
                    <Grid item xs={6} sm={4} md={2.4} key={button.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 3,
                          background: currentTab === button.id 
                            ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                            : 'var(--bg-glass-strong)',
                          backdropFilter: 'blur(12px)',
                          border: currentTab === button.id 
                            ? 'none'
                            : '1px solid var(--border-light)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 'var(--shadow-lg)',
                            background: currentTab === button.id 
                              ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                              : 'var(--bg-glass-strong)',
                          }
                        }}
                        onClick={() => setCurrentTab(button.id)}
                      >
                        <CardContent sx={{ 
                          textAlign: 'center', 
                          p: isMobile ? 1.5 : 2.5,
                          position: 'relative',
                          '&:last-child': { pb: isMobile ? 1.5 : 2.5 }
                        }}>
                          {button.badge > 0 && (
                            <Badge
                              badgeContent={button.badge}
                              color="error"
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                '& .MuiBadge-badge': {
                                  fontSize: '0.65rem',
                                  height: 18,
                                  minWidth: 18,
                                }
                              }}
                            />
                          )}
                          <Avatar
                            sx={{
                              bgcolor: currentTab === button.id 
                                ? 'rgba(255, 255, 255, 0.2)'
                                : button.bgColor || 'rgba(99, 102, 241, 0.1)',
                              color: currentTab === button.id 
                                ? '#fff'
                                : button.color,
                              width: 56,
                              height: 56,
                              margin: '0 auto',
                              mb: 1.5,
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {button.icon}
                          </Avatar>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 700, 
                              color: currentTab === button.id ? '#fff' : 'var(--text-primary)',
                              mb: 0.5
                            }}
                          >
                            {button.label}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: currentTab === button.id ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)',
                              display: isMobile ? 'none' : 'block'
                            }}
                          >
                            {button.description}
                          </Typography>
                          {currentTab === button.id && (
                            <CheckCircleIcon 
                              sx={{ 
                                position: 'absolute', 
                                bottom: 8, 
                                right: 8, 
                                fontSize: 16,
                                color: 'rgba(255,255,255,0.6)'
                              }} 
                            />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Render the selected tab content */}
            {renderTabContent()}
          </Container>
        </Box>
        
        <MobileBottomNav tabs={navButtons} currentTab={currentTab} onChange={setCurrentTab} />
      </Box>
    </ThemeProvider>
  );
}

export default AdminDashboard;