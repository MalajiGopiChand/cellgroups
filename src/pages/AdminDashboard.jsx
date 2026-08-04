import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Cake as CakeIcon,
  HowToReg as HowToRegIcon,
} from '@mui/icons-material';

import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

// Cellgroups Components
import AdminHomePage from './admin/AdminHomePage';
import AdminApprovePage from './admin/AdminApprovePage';
import AdminMembersPage from './admin/AdminMembersPage';
import AdminAttendancePage from './admin/AdminAttendancePage';
import AdminAnnouncementsPage from './admin/AdminAnnouncementsPage';
import AdminLeaderAttendancePage from './admin/AdminLeaderAttendancePage';
import AdminSubmitPrayerRequestPage from './admin/AdminSubmitPrayerRequestPage';
import AdminViewPrayerRequestsPage from './admin/AdminViewPrayerRequestsPage';
import AdminReportCardPage from './admin/AdminReportCardPage';
import AdminMeetingPlacesPage from './admin/AdminMeetingPlacesPage';
import MobileBottomNav from '../components/MobileBottomNav';
import BirthdaysView from '../components/BirthdaysView';
import BirthdayNotificationBar from '../components/BirthdayNotificationBar';
import { useLanguage } from '../contexts/LanguageContext';

// New Icons
import {
  VolunteerActivism as PrayerIcon,
  Assessment as ReportIcon,
  LocationOn as LocationIcon,
  FormatListBulleted as ListIcon
} from '@mui/icons-material';

function AdminDashboard({ user, onLogout }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.between('sm', 'md'));

  // Tab State
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (!tabParam) {
      const savedTab = sessionStorage.getItem('AdminDashboard_currentTab');
      if (savedTab && savedTab !== '0') {
        setSearchParams({ tab: savedTab }, { replace: true });
      }
    }
  }, []);

  const currentTab = parseInt(tabParam || '0', 10);

  const setCurrentTab = (newTab) => {
    if (newTab === 0) {
      setSearchParams({});
    } else {
      setSearchParams({ tab: newTab });
    }
  };
  
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    totalMembers: 0,
    todayAttendance: 0,
    presentCount: 0,
    todayCount: 0,
    activeAnnouncements: 0
  });

  useEffect(() => {
    sessionStorage.setItem('AdminDashboard_currentTab', currentTab.toString());
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
      let todayCount = 0;
      let presentCount = 0;
      snap.forEach(doc => {
        const data = doc.data();
        if (Array.isArray(data.attendance)) {
          data.attendance.forEach(record => {
            todayCount++;
            if (record.status === 'present') {
              presentCount++;
            }
          });
        }
      });
      const attendanceRate = todayCount > 0 ? Math.round((presentCount / todayCount) * 100) : 0;
      setStats(prev => ({ ...prev, todayAttendance: attendanceRate, presentCount, todayCount }));
    });

    return () => {
      unsubLeaders();
      unsubStudents();
      unsubAnnouncements();
      unsubAttendance();
    };
  }, []);

  const navButtons = [
    // --- Bottom Nav Items ---
    { 
      id: 0, 
      label: t('nav.home'), 
      icon: <DashboardIcon />, 
      color: 'var(--primary-forest)',
      bgColor: 'var(--surface-sage)',
      description: t('desc.overview'),
      isBottomNav: true
    },
    {
      id: 8,
      label: t('nav.reportCards'),
      icon: <ReportIcon />,
      color: 'var(--text-sage)',
      bgColor: 'var(--light-sage)',
      description: t('desc.viewReports'),
      isBottomNav: true
    },
    {
      id: 7,
      label: 'Submit Prayer',
      icon: <PrayerIcon />,
      color: 'var(--text-gold)',
      bgColor: 'var(--surface-gold)',
      description: 'Submit request',
      isBottomNav: true
    },
    {
      id: 10,
      label: 'View Prayers',
      icon: <ListIcon />,
      color: 'var(--text-gold)',
      bgColor: 'var(--surface-gold)',
      description: 'View requests',
      isBottomNav: true
    },
    { 
      id: 2, 
      label: t('nav.members'), 
      icon: <PeopleIcon />, 
      color: 'var(--primary-forest)',
      bgColor: 'var(--light-sage)',
      description: t('desc.manage'),
      isBottomNav: true
    },

    // --- Quick Actions ---
    { 
      id: 3, 
      label: t('nav.logs'), 
      icon: <AttendanceIcon />, 
      color: 'var(--text-sage)',
      bgColor: 'var(--accent-sage)',
      description: t('desc.past')
    },
    {
      id: 9,
      label: t('nav.meetingPlaces'),
      icon: <LocationIcon />,
      color: 'var(--alert-dot)',
      bgColor: 'rgba(207, 138, 66, 0.1)',
      description: t('desc.viewLocations')
    },
    { 
      id: 4, 
      label: t('nav.announcements'), 
      icon: <AnnouncementIcon />, 
      color: 'var(--alert-dot)',
      bgColor: 'rgba(207, 138, 66, 0.1)',
      description: t('desc.sendAlerts'),
      badge: stats.activeAnnouncements
    },
    {
      id: 6,
      label: t('nav.leaderAttendance'),
      icon: <HowToRegIcon />,
      color: 'var(--text-deep)',
      bgColor: 'var(--border-neutral)',
      description: t('desc.leaderAtt')
    },
    { 
      id: 5, 
      label: t('nav.birthdays'), 
      icon: <CakeIcon />, 
      color: 'var(--alert-dot)',
      bgColor: 'rgba(207, 138, 66, 0.1)',
      description: t('desc.birthdays')
    },
    { 
      id: 1, 
      label: t('nav.approvals'), 
      icon: <ApproveIcon />, 
      color: 'var(--text-gold)',
      bgColor: 'var(--surface-gold)',
      description: t('desc.pendingReq'),
      badge: stats.pendingApprovals
    }
  ];

  const renderTabContent = () => {
    const content = (() => {
      switch (currentTab) {
        case 0: return <AdminHomePage />;
        case 1: return <AdminApprovePage onBack={() => setCurrentTab(0)} />;
        case 2: return <AdminMembersPage onBack={() => setCurrentTab(0)} />;
        case 3: return <AdminAttendancePage onBack={() => setCurrentTab(0)} />;
        case 4: return <AdminAnnouncementsPage onBack={() => setCurrentTab(0)} />;
        case 5: return <BirthdaysView isAdmin={true} onBack={() => setCurrentTab(0)} />;
        case 6: return <AdminLeaderAttendancePage onBack={() => setCurrentTab(0)} />;
        case 7: return <AdminSubmitPrayerRequestPage user={user} onBack={() => setCurrentTab(0)} />;
        case 8: return <AdminReportCardPage onBack={() => setCurrentTab(0)} />;
        case 9: return <AdminMeetingPlacesPage onBack={() => setCurrentTab(0)} />;
        case 10: return <AdminViewPrayerRequestsPage user={user} onBack={() => setCurrentTab(0)} />;
        default: return <AdminHomePage />;
      }
    })();

    return (
      <Fade in timeout={250} key={currentTab}>
        <Box>
          {content}
        </Box>
      </Fade>
    );
  };

  // Stats cards data
  const statsCards = [
    {
      title: "Overall Attendance",
      value: `${stats.todayAttendance}%`,
      icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
      color: 'var(--surface-white)',
      bgColor: 'rgba(255,255,255,0.2)',
      trend: stats.todayCount > 0 ? `${stats.presentCount} / ${stats.todayCount} Present` : 'No data available',
      cardBg: 'var(--primary-forest)',
      textColor: 'var(--surface-white)',
      subTextColor: 'rgba(255,255,255,0.8)'
    },
    {
      title: 'Total Members',
      value: stats.totalMembers,
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      color: 'var(--text-gold)',
      bgColor: 'var(--surface-gold)',
      trend: '+12 this month',
      cardBg: 'rgba(255,255,255,0.75)',
      textColor: 'var(--text-deep)',
      subTextColor: 'var(--text-supporting)'
    }
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          bgcolor: 'transparent',
        }}
      >
        {/* Top App Bar */}
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'transparent', backgroundImage: 'none', pt: '20px', px: '20px', pb: '12px' }}>
          <Toolbar disableGutters sx={{ minHeight: 'auto !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
              <Box component="img" src="/icon.png" alt="Bethel Logo" sx={{ width: 44, height: 44, objectFit: 'contain' }} />
              <Box>
                <Typography variant="h6" className="font-playfair" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'var(--text-deep)' }}>
                  Bethel Admin
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--text-supporting)' }}>
                  {user?.email || 'Admin'}
                </Typography>
              </Box>
            </Box>

            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <BirthdayNotificationBar user={user} isAdmin={true} onNavigateToBirthdays={() => setCurrentTab(5)} />
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  label="Admin Control"
                  sx={{ borderRadius: 1 }}
                />
                <Tooltip title="Logout">
                  <Button
                    onClick={onLogout}
                    startIcon={<LogoutIcon />}
                    sx={{ 
                      borderRadius: 1, 
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BirthdayNotificationBar user={user} isAdmin={true} onNavigateToBirthdays={() => setCurrentTab(5)} />
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
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', pb: isMobile ? 3 : 6 }}>
          <Container maxWidth="lg" sx={{ py: 3 }}>
            
            {/* Quick Stats Cards - Only show on Dashboard tab */}
            {currentTab === 0 && (
              
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" className="font-playfair" sx={{ fontSize: 22, fontWeight: 700, color: 'var(--text-deep)', mb: 2 }}>
                    Quick Overview
                  </Typography>
                  <Grid container spacing={isMobile ? 1.5 : 2}>
                    {statsCards.map((stat, index) => (
                      <Grid item xs={12} sm={6} md={6} key={index}>
                        <Card sx={{ 
                          borderRadius: 1, 
                          background: stat.cardBg, 
                          backdropFilter: 'blur(12px)', 
                          border: stat.cardBg === 'var(--primary-forest)' ? 'none' : '1px solid var(--border-neutral)' 
                        }}>
                          <CardContent sx={{ p: isMobile ? 2 : 2.5, '&:last-child': { pb: isMobile ? 2 : 2.5 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: isMobile ? 1.5 : 2 }}>
                              <Avatar sx={{ bgcolor: stat.bgColor, color: stat.color, width: 48, height: 48, borderRadius: 1 }}>{stat.icon}</Avatar>
                              {stat.trend && <Chip size="small" label={stat.trend} sx={{ fontSize: '0.65rem', bgcolor: stat.cardBg === 'var(--primary-forest)' ? 'rgba(255,255,255,0.15)' : 'var(--light-sage)', color: stat.cardBg === 'var(--primary-forest)' ? '#fff' : 'var(--text-sage)', height: 22, border: 'none' }} />}
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: stat.textColor, mb: 0.5 }}>{stat.value}</Typography>
                            <Typography variant="body2" sx={{ color: stat.subTextColor, fontWeight: 500 }}>{stat.title}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              
            )}

            {/* Navigation Buttons Grid */}
            {currentTab === 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" className="font-playfair" sx={{ fontSize: 22, fontWeight: 700, color: 'var(--text-deep)', mb: 2 }}>
                  Quick Actions
                </Typography>
                <Grid container spacing={isMobile ? 1.5 : 2}>
                  {navButtons.filter(b => b.id !== 0).map((button) => (
                    <Grid item xs={6} sm={4} md={2.4} key={button.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 1,
                          background: 'rgba(255,255,255,0.75)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid var(--border-neutral)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.9)',
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
        
        <MobileBottomNav tabs={navButtons.filter(b => b.isBottomNav)} currentTab={currentTab} onChange={setCurrentTab} />
      </Box>
    </ThemeProvider>
  );
}

export default AdminDashboard;