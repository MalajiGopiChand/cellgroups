import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Grid,
  useTheme,
  useMediaQuery,
  Fade,
  Chip,
  Tooltip
} from '@mui/material';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '../theme';

import {
  Dashboard as DashboardIcon,
  PersonAdd as PersonAddIcon,
  FactCheck as AttendanceIcon,
  Logout as LogoutIcon,
  BoltRounded as BoltIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Cake as CakeIcon,
  Translate as TranslateIcon,
} from '@mui/icons-material';

import { collection, onSnapshot, query, where, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getTuesdayWeekDetails } from '../utils/dateUtils';

import CellLeaderHomePage from './cellleader/CellLeaderHomePage';
import CellLeaderAddMemberPage from './cellleader/CellLeaderAddMemberPage';
import CellLeaderAttendancePage from './cellleader/CellLeaderAttendancePage';
import CellLeaderAttendanceLogsPage from './cellleader/CellLeaderAttendanceLogsPage';
import CellLeaderSubmitPrayerRequestPage from './cellleader/CellLeaderSubmitPrayerRequestPage';
import CellLeaderViewPrayerRequestsPage from './cellleader/CellLeaderViewPrayerRequestsPage';
import CellLeaderReportCardPage from './cellleader/CellLeaderReportCardPage';
import CellLeaderMeetingPlacePage from './cellleader/CellLeaderMeetingPlacePage';
import CellLeaderTestimoniesPage from './cellleader/CellLeaderTestimoniesPage';
import MobileBottomNav from '../components/MobileBottomNav';
import BirthdaysView from '../components/BirthdaysView';
import BirthdayNotificationBar from '../components/BirthdayNotificationBar';

// New Icons
import {
  VolunteerActivism as PrayerIcon,
  Assessment as ReportIcon,
  LocationOn as LocationIcon,
  FormatListBulleted as ListIcon,
  Announcement as AnnouncementIcon,
  Comment as CommentIcon
} from '@mui/icons-material';

function CellLeaderDashboardInner({ user, onLogout }) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const { language, toggleLanguage, t } = useLanguage();

  // Tab State
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (!tabParam) {
      const savedTab = sessionStorage.getItem('CellLeaderDashboard_currentTab');
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
    totalMembers: 0,
    todayAttendance: 0,
    presentCount: 0,
    totalAttCount: 0,
    attendanceTaken: false
  });

  const [announcements, setAnnouncements] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [currentPrayerIndex, setCurrentPrayerIndex] = useState(0);

  const [testimonies, setTestimonies] = useState([]);
  const [currentTestimonyIndex, setCurrentTestimonyIndex] = useState(0);

  useEffect(() => {
    sessionStorage.setItem('CellLeaderDashboard_currentTab', currentTab.toString());
  }, [currentTab]);

  useEffect(() => {
    if (!user?.id) return;

    const qMembers = query(collection(db, 'students'), where('cellLeaderId', '==', user.id));
    const unsubMembers = onSnapshot(qMembers, (snap) => {
      const mems = snap.docs.map(d => d.data());
      const cellMems = mems.filter(m => m.place === user?.place);
      setStats(prev => ({ ...prev, totalMembers: cellMems.length }));
    });

    // Fetch attendance stats for this leader
    const { tuesdayWeekStartDate } = getTuesdayWeekDetails();
    const qAtt = query(collection(db, 'memberAttendance'), 
      where('leaderId', '==', user.id),
      where('tuesdayWeekStartDate', '==', tuesdayWeekStartDate)
    );
    
    const unsubAttendance = onSnapshot(qAtt, (snap) => {
      let totalAttCount = 0;
      let presentCount = 0;
      
      snap.forEach(docSnap => {
        const data = docSnap.data();
        totalAttCount++;
        if (data.status === 'present') {
          presentCount++;
        }
      });
      
      if (totalAttCount > 0) {
        const rate = Math.round((presentCount / totalAttCount) * 100);
        setStats(prev => ({ ...prev, todayAttendance: rate, presentCount, totalAttCount, attendanceTaken: true }));
      } else {
        setStats(prev => ({ ...prev, todayAttendance: 0, presentCount: 0, totalAttCount: 0, attendanceTaken: false }));
      }
    });

    const qPrayers = query(collection(db, 'prayer_requests'));
    const unsubPrayers = onSnapshot(qPrayers, (snap) => {
      let data = snap.docs.map(d => d.data());
      
      // Filter for past 10 days only
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      const tenDaysAgoSeconds = Math.floor(tenDaysAgo.getTime() / 1000);
      
      data = data.filter(p => (p.timestamp?.seconds || 0) >= tenDaysAgoSeconds);
      data.sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setPrayers(data);
    });

    const qAnnouncements = query(collection(db, 'announcements'));
    const unsubAnnouncements = onSnapshot(qAnnouncements, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(a => a.recipientType === 'all' || a.cellLeaderId === user?.id)
        .sort((a, b) => {
          const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const db_ = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return db_ - da;
        });
      setAnnouncements(data);
    });

    const qTestimonies = query(collection(db, 'reports'), where('hasTestimony', '==', true));
    const unsubTestimonies = onSnapshot(qTestimonies, (snap) => {
      let data = snap.docs.map(d => d.data());
      // Filter for past 30 days for testimonies
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoSeconds = Math.floor(thirtyDaysAgo.getTime() / 1000);
      data = data.filter(t => (t.timestamp?.seconds || 0) >= thirtyDaysAgoSeconds);
      data.sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setTestimonies(data);
    });

    return () => {
      unsubMembers();
      unsubAttendance();
      unsubPrayers();
      unsubAnnouncements();
      unsubTestimonies();
    };
  }, [user?.id, user?.place]);

  useEffect(() => {
    if (prayers.length === 0) return;
    const interval = setInterval(() => {
      setCurrentPrayerIndex(prev => (prev + 1) % prayers.length);
    }, 15000); // Scroll every 15 seconds
    return () => clearInterval(interval);
  }, [prayers]);

  useEffect(() => {
    if (testimonies.length === 0) return;
    
    let intervalId;
    const timeoutId = setTimeout(() => {
      setCurrentTestimonyIndex(prev => (prev + 1) % testimonies.length);
      intervalId = setInterval(() => {
        setCurrentTestimonyIndex(prev => (prev + 1) % testimonies.length);
      }, 15000);
    }, 7500); // 7.5 seconds stagger

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [testimonies]);

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
      id: 5,
      label: t('nav.submitPrayer'),
      icon: <PrayerIcon />,
      color: 'var(--text-gold)',
      bgColor: 'var(--surface-gold)',
      description: t('desc.submitPrayer'),
      isBottomNav: true
    },
    {
      id: 6,
      label: t('nav.reportCards'),
      icon: <ReportIcon />,
      color: 'var(--text-sage)',
      bgColor: 'var(--light-sage)',
      description: t('desc.submitReport'),
      isBottomNav: true
    },
    { 
      id: 3, 
      label: t('nav.birthdays'), 
      icon: <CakeIcon />, 
      color: 'var(--alert-dot)',
      bgColor: 'rgba(207, 138, 66, 0.1)',
      description: t('desc.birthdays'),
      isBottomNav: true
    },

    // --- Quick Actions ---
    { 
      id: 1, 
      label: t('nav.members'), 
      icon: <PersonAddIcon />, 
      color: 'var(--text-gold)',
      bgColor: 'var(--surface-gold)',
      description: t('desc.manage')
    },
    { 
      id: 2, 
      label: t('nav.attendance'), 
      icon: <AttendanceIcon />, 
      color: 'var(--text-sage)',
      bgColor: 'var(--light-sage)',
      description: t('desc.mark')
    },
    {
      id: 4,
      label: t('nav.logs'),
      icon: <CheckCircleIcon />,
      color: 'var(--primary-forest)',
      bgColor: 'var(--surface-sage)',
      description: t('desc.past')
    },
    {
      id: 7,
      label: t('nav.meetingPlace'),
      icon: <LocationIcon />,
      color: 'var(--alert-dot)',
      bgColor: 'rgba(207, 138, 66, 0.1)',
      description: t('desc.setLocation')
    }
  ];

  const renderTabContent = () => {
    const content = (() => {
      switch (currentTab) {
        case 0: return <CellLeaderHomePage user={user} />;
        case 1: return <CellLeaderAddMemberPage user={user} onBack={() => setCurrentTab(0)} />;
        case 2: return <CellLeaderAttendancePage user={user} onBack={() => setCurrentTab(0)} />;
        case 3: return <BirthdaysView user={user} onBack={() => setCurrentTab(0)} />;
        case 4: return <CellLeaderAttendanceLogsPage user={user} onBack={() => setCurrentTab(0)} />;
        case 5: return <CellLeaderSubmitPrayerRequestPage user={user} onBack={() => setCurrentTab(0)} />;
        case 6: return <CellLeaderReportCardPage user={user} onBack={() => setCurrentTab(0)} />;
        case 7: return <CellLeaderMeetingPlacePage user={user} onBack={() => setCurrentTab(0)} />;
        case 8: return <CellLeaderViewPrayerRequestsPage user={user} onBack={() => setCurrentTab(0)} />;
        case 9: return <CellLeaderTestimoniesPage onBack={() => setCurrentTab(0)} />;
        default: return <CellLeaderHomePage user={user} />;
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

  const statsCards = [
    {
      title: t('dash.tuesdayAtt'),
      value: stats.attendanceTaken ? `${stats.todayAttendance}%` : '--',
      icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
      color: 'var(--surface-white)',
      bgColor: 'rgba(255,255,255,0.2)',
      trend: stats.attendanceTaken ? `${stats.presentCount} / ${stats.totalAttCount} ${t('dash.present')}` : "No data available",
      cardBg: 'var(--primary-forest)',
      textColor: 'var(--surface-white)',
      subTextColor: 'rgba(255,255,255,0.8)'
    },
    {
      title: t('dash.groupMembers'),
      value: stats.totalMembers,
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      color: 'var(--text-gold)',
      bgColor: 'var(--surface-gold)',
      trend: t('dash.active'),
      cardBg: 'rgba(255,255,255,0.75)',
      textColor: 'var(--text-deep)',
      subTextColor: 'var(--text-supporting)'
    }
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', bgcolor: 'transparent' }}>
        
        {/* Top App Bar */}
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'transparent', backgroundImage: 'none', pt: '20px', px: '20px', pb: '12px' }}>
          <Toolbar disableGutters sx={{ minHeight: 'auto !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
              <Box component="img" src="/icon.png" alt="Bethel Logo" sx={{ width: 44, height: 44, objectFit: 'contain' }} />
              <Box>
                <Typography variant="h6" className="font-playfair" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'var(--text-deep)' }}>Bethel Cell</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--text-supporting)' }}>Leader • {user?.name}</Typography>
              </Box>
            </Box>

            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <BirthdayNotificationBar user={user} isAdmin={false} onNavigateToBirthdays={() => setCurrentTab(3)} />
                <Button 
                  onClick={toggleLanguage}
                  startIcon={<TranslateIcon />} 
                  sx={{ borderRadius: 1, px: 2, color: 'var(--text-primary)', fontWeight: 'bold', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' } }}
                >
                  {language === 'en' ? 'తెలుగు' : 'English'}
                </Button>
                <Chip size="small" color="primary" variant="outlined" label="Cell Leader" sx={{ borderRadius: 1 }} />
                <Tooltip title={t('nav.logout')}>
                  <Button onClick={onLogout} startIcon={<LogoutIcon />} sx={{ borderRadius: 1, px: 2.5, color: 'var(--text-primary)', fontWeight: 'bold', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' } }}>{t('nav.logout')}</Button>
                </Tooltip>
              </Box>
            )}

            {isMobile && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <BirthdayNotificationBar user={user} isAdmin={false} onNavigateToBirthdays={() => setCurrentTab(3)} />
                <IconButton onClick={toggleLanguage} sx={{ color: 'var(--color-primary)', bgcolor: 'rgba(99,102,241,0.1)', '&:hover': { bgcolor: 'rgba(99,102,241,0.2)' } }}>
                  <TranslateIcon />
                </IconButton>
                <IconButton onClick={onLogout} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.1)', '&:hover': { bgcolor: 'rgba(239,68,68,0.2)' } }}>
                  <LogoutIcon />
                </IconButton>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', pb: isMobile ? 3 : 6 }}>
          <Container maxWidth="lg" sx={{ py: 3 }}>
            
            {/* Quick Stats Cards - Only show on Home tab */}
            {currentTab === 0 && (
              
                <Box sx={{ mb: 4 }}>
                  <Grid container spacing={isMobile ? 1 : 2}>
                    {statsCards.map((stat, index) => (
                      <Grid item xs={6} sm={6} md={prayers.length > 0 ? 3 : 6} key={index}>
                        <Card sx={{ 
                          borderRadius: 1, 
                          background: stat.cardBg, 
                          backdropFilter: 'blur(12px)', 
                          border: stat.cardBg === 'var(--primary-forest)' ? 'none' : '1px solid var(--border-neutral)',
                          height: '100%'
                        }}>
                          <CardContent sx={{ p: isMobile ? 2 : 2.5, '&:last-child': { pb: isMobile ? 2 : 2.5 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                              <Box>
                                <Typography variant="h4" sx={{ fontWeight: 800, color: stat.textColor, lineHeight: 1, mb: 0.5, fontSize: isMobile ? '1.5rem' : '2.125rem' }}>
                                  {stat.value}
                                </Typography>
                                <Typography variant="body2" sx={{ color: stat.subTextColor, fontWeight: 600, fontSize: isMobile ? '0.75rem' : '0.875rem', lineHeight: 1.2 }}>
                                  {stat.title}
                                </Typography>
                              </Box>
                              <Avatar sx={{ bgcolor: stat.bgColor, color: stat.color, width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: 2 }}>
                                {React.cloneElement(stat.icon, { sx: { fontSize: isMobile ? 22 : 28 } })}
                              </Avatar>
                            </Box>
                            {stat.trend && (
                              <Box sx={{ mt: 2 }}>
                                <Chip size="small" label={stat.trend} sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem', fontWeight: 600, bgcolor: stat.cardBg === 'var(--primary-forest)' ? 'rgba(255,255,255,0.15)' : 'var(--light-sage)', color: stat.cardBg === 'var(--primary-forest)' ? '#fff' : 'var(--text-sage)', height: 24, borderRadius: 1, border: 'none' }} />
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}

                    {prayers.length > 0 && (
                      <Grid item xs={12} sm={12} md={6}>
                        <Card 
                          onClick={() => setCurrentTab(8)}
                          sx={{ 
                            borderRadius: 1, 
                            border: '1px solid var(--border-neutral)', 
                            background: 'rgba(255,255,255,0.75)', 
                            backdropFilter: 'blur(12px)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.2s',
                            '&:hover': {
                              background: 'rgba(255,255,255,0.95)',
                              borderColor: 'var(--text-gold)'
                            }
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: isMobile ? 1.5 : 2.5, '&:last-child': { pb: isMobile ? 1.5 : 2.5 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                              <Avatar sx={{ bgcolor: 'var(--surface-gold)', color: 'var(--text-gold)', width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: 1 }}>
                                <PrayerIcon sx={{ fontSize: isMobile ? 18 : 20 }} />
                              </Avatar>
                              <Typography variant={isMobile ? "subtitle1" : "h6"} className="font-playfair" sx={{ fontWeight: 700, color: 'var(--text-deep)' }}>
                                {t('dash.recentPrayers')}
                              </Typography>
                              <Chip className="live-badge-glow" size="small" label={t('dash.live')} sx={{ ml: 'auto', bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 700, height: 20, fontSize: '0.65rem', border: 'none' }} />
                            </Box>

                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                              <Fade in={true} key={currentPrayerIndex} timeout={800}>
                                <Box sx={{ width: '100%', textAlign: 'center', px: 1 }}>
                                  <Typography variant="body1" sx={{ color: 'var(--text-primary)', fontStyle: 'italic', mb: 1, fontSize: isMobile ? '0.9rem' : '1.05rem', lineHeight: 1.5 }}>
                                    "{prayers[currentPrayerIndex].description}"
                                  </Typography>
                                  <Typography variant="subtitle2" sx={{ color: 'var(--text-gold)', fontWeight: 800, fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                                    — {prayers[currentPrayerIndex].personName}
                                  </Typography>
                                </Box>
                              </Fade>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {testimonies.length > 0 && (
                      <Grid item xs={12} sm={12} md={6}>
                        <Card 
                          onClick={() => setCurrentTab(9)}
                          sx={{ 
                            borderRadius: 1, 
                            border: '1px solid var(--border-neutral)', 
                            background: 'rgba(255,255,255,0.75)', 
                            backdropFilter: 'blur(12px)',
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              background: 'rgba(255,255,255,0.95)',
                              borderColor: 'var(--primary-forest)'
                            }
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: isMobile ? 1.5 : 2.5, '&:last-child': { pb: isMobile ? 1.5 : 2.5 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                              <Avatar sx={{ bgcolor: 'var(--surface-sage)', color: 'var(--primary-forest)', width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: 1 }}>
                                <CommentIcon sx={{ fontSize: isMobile ? 18 : 20 }} />
                              </Avatar>
                              <Typography variant={isMobile ? "subtitle1" : "h6"} className="font-playfair" sx={{ fontWeight: 700, color: 'var(--text-deep)' }}>
                                {t('nav.testimonies')}
                              </Typography>
                              <Chip className="live-badge-glow" size="small" label={t('dash.live')} sx={{ ml: 'auto', bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 700, height: 20, fontSize: '0.65rem', border: 'none' }} />
                            </Box>

                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                              <Fade in={true} key={currentTestimonyIndex} timeout={800}>
                                <Box sx={{ width: '100%', textAlign: 'center', px: 1 }}>
                                  <Typography variant="body1" sx={{ color: 'var(--text-primary)', fontStyle: 'italic', mb: 1, fontSize: isMobile ? '0.9rem' : '1.05rem', lineHeight: 1.5 }}>
                                    "{testimonies[currentTestimonyIndex].testimonyDetails}"
                                  </Typography>
                                  <Typography variant="subtitle2" sx={{ color: 'var(--primary-forest)', fontWeight: 800, fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                                    — {testimonies[currentTestimonyIndex].testimonyName}
                                  </Typography>
                                </Box>
                              </Fade>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>

                  {announcements.length > 0 && (
                    <Card sx={{ 
                      mt: 2, 
                      bgcolor: 'var(--bg-glass-strong)', 
                      backdropFilter: 'blur(12px)',
                      borderRadius: 1,
                      border: '1px solid var(--border-light)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: announcements[0].recipientType === 'all' ? 'var(--color-success)' : 'var(--color-primary)' }} />
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: 40, height: 40 }}>
                          <AnnouncementIcon />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, mb: 0.5 }}>
                            {announcements[0].title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                            {announcements[0].message}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  )}
                </Box>
              
            )}

            {/* Navigation Buttons Grid */}
            {currentTab === 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" className="font-playfair" sx={{ fontSize: 22, fontWeight: 700, color: 'var(--text-deep)', mb: 2 }}>
                  {t('dash.quickActions')}
                </Typography>
                <Grid container spacing={isMobile ? 1 : 2}>
                  {navButtons.filter(b => b.id !== 0 && (!isMobile || !b.isBottomNav)).map((button) => (
                    <Grid item xs={4} sm={4} md={3} key={button.id}>
                      <Card
                        className="glass-gradient-card"
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
                        <CardContent sx={{ textAlign: 'center', p: isMobile ? 1 : 2.5, position: 'relative', '&:last-child': { pb: isMobile ? 1 : 2.5 } }}>
                          <Avatar sx={{ bgcolor: currentTab === button.id ? 'rgba(255, 255, 255, 0.2)' : button.bgColor, color: currentTab === button.id ? '#fff' : button.color, width: isMobile ? 36 : 56, height: isMobile ? 36 : 56, margin: '0 auto', mb: isMobile ? 0.5 : 1.5, transition: 'all 0.3s ease' }}>
                            {React.cloneElement(button.icon, { sx: { fontSize: isMobile ? 20 : 24 } })}
                          </Avatar>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: currentTab === button.id ? '#fff' : 'var(--text-primary)', mb: isMobile ? 0 : 0.5, fontSize: isMobile ? '0.7rem' : '1rem', lineHeight: 1.2 }}>
                            {button.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: currentTab === button.id ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)', display: isMobile ? 'none' : 'block' }}>
                            {button.description}
                          </Typography>
                          {currentTab === button.id && <CheckCircleIcon sx={{ position: 'absolute', bottom: 8, right: 8, fontSize: 16, color: 'rgba(255,255,255,0.6)' }} />}
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

function CellLeaderDashboard({ user, onLogout }) {
  return (
    <LanguageProvider>
      <CellLeaderDashboardInner user={user} onLogout={onLogout} />
    </LanguageProvider>
  );
}

export default CellLeaderDashboard;