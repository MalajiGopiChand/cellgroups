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

import CellLeaderHomePage from './cellleader/CellLeaderHomePage';
import CellLeaderAddMemberPage from './cellleader/CellLeaderAddMemberPage';
import CellLeaderAttendancePage from './cellleader/CellLeaderAttendancePage';
import CellLeaderAttendanceLogsPage from './cellleader/CellLeaderAttendanceLogsPage';
import MobileBottomNav from '../components/MobileBottomNav';
import BirthdaysView from '../components/BirthdaysView';
import BirthdayNotificationBar from '../components/BirthdayNotificationBar';

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

    const getLocalDate = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const todayStr = getLocalDate();
    const docRefId = `${user.id}_${user.place}_${todayStr}`;
    
    const unsubAttendance = onSnapshot(doc(db, 'attendance', docRefId), (docSnap) => {
      if (docSnap.exists() && docSnap.data().attendance) {
        const attArray = docSnap.data().attendance;
        if (attArray.length > 0) {
          const presentCount = attArray.filter(a => a.status === 'present').length;
          const rate = Math.round((presentCount / attArray.length) * 100);
          setStats(prev => ({ ...prev, todayAttendance: rate, presentCount, totalAttCount: attArray.length, attendanceTaken: true }));
        } else {
          setStats(prev => ({ ...prev, todayAttendance: 0, presentCount: 0, totalAttCount: 0, attendanceTaken: false }));
        }
      } else {
        setStats(prev => ({ ...prev, todayAttendance: 0, presentCount: 0, totalAttCount: 0, attendanceTaken: false }));
      }
    });

    return () => {
      unsubMembers();
      unsubAttendance();
    };
  }, [user?.id, user?.place]);

  const navButtons = [
    { 
      id: 0, 
      label: t('nav.home'), 
      icon: <DashboardIcon />, 
      color: 'var(--primary-forest)',
      bgColor: 'var(--surface-sage)',
      description: t('desc.overview')
    },
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
      id: 3, 
      label: t('nav.birthdays'), 
      icon: <CakeIcon />, 
      color: 'var(--alert-dot)',
      bgColor: 'rgba(207, 138, 66, 0.1)',
      description: t('desc.birthdays')
    },
    {
      id: 4,
      label: t('nav.logs'),
      icon: <CheckCircleIcon />,
      color: 'var(--primary-forest)',
      bgColor: 'var(--surface-sage)',
      description: t('desc.past')
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
        default: return <CellLeaderHomePage user={user} />;
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

  const statsCards = [
    {
      title: t('dash.todayAtt'),
      value: stats.attendanceTaken ? `${stats.todayAttendance}%` : '--',
      icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
      color: 'var(--surface-white)',
      bgColor: 'rgba(255,255,255,0.2)',
      trend: stats.attendanceTaken ? `${stats.presentCount} / ${stats.totalAttCount} ${t('dash.present')}` : t('dash.notMarked'),
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
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'transparent' }}>
        
        {/* Top App Bar */}
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'transparent', backgroundImage: 'none', pt: '20px', px: '20px', pb: '12px' }}>
          <Toolbar disableGutters sx={{ minHeight: 'auto !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'var(--primary-forest)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Box component="img" src="/icon.png" alt="Bethel Logo" sx={{ width: 28, height: 28, objectFit: 'contain' }} />
              </Box>
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
                  sx={{ borderRadius: 2, px: 2, color: 'var(--text-primary)', fontWeight: 'bold', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' } }}
                >
                  {language === 'en' ? 'తెలుగు' : 'English'}
                </Button>
                <Chip size="small" color="primary" variant="outlined" label="Cell Leader" sx={{ borderRadius: 2 }} />
                <Tooltip title={t('nav.logout')}>
                  <Button onClick={onLogout} startIcon={<LogoutIcon />} sx={{ borderRadius: 2, px: 2.5, color: 'var(--text-primary)', fontWeight: 'bold', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' } }}>{t('nav.logout')}</Button>
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
        <Box sx={{ flexGrow: 1, overflow: 'auto', pb: isMobile ? '100px' : 6 }}>
          <Container maxWidth="lg" sx={{ py: 3 }}>
            
            {/* Quick Stats Cards - Only show on Home tab */}
            {currentTab === 0 && (
              <Fade in timeout={400}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" className="font-playfair" sx={{ fontSize: 22, fontWeight: 700, color: 'var(--text-deep)', mb: 2 }}>
                    {t('dash.overview')}
                  </Typography>
                  <Grid container spacing={isMobile ? 1.5 : 2}>
                    {statsCards.map((stat, index) => (
                      <Grid item xs={12} sm={6} md={6} key={index}>
                        <Card sx={{ 
                          borderRadius: 3, 
                          background: stat.cardBg, 
                          backdropFilter: 'blur(12px)', 
                          border: stat.cardBg === 'var(--primary-forest)' ? 'none' : '1px solid var(--border-neutral)', 
                          transition: 'all 0.3s ease', 
                          '&:hover': { transform: 'translateY(-4px)', boxShadow: 'var(--shadow-md)' } 
                        }}>
                          <CardContent sx={{ p: isMobile ? 2 : 2.5, '&:last-child': { pb: isMobile ? 2 : 2.5 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: isMobile ? 1.5 : 2 }}>
                              <Avatar sx={{ bgcolor: stat.bgColor, color: stat.color, width: 48, height: 48, borderRadius: 2 }}>{stat.icon}</Avatar>
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
              </Fade>
            )}

            {/* Navigation Buttons Grid */}
            {currentTab === 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" className="font-playfair" sx={{ fontSize: 22, fontWeight: 700, color: 'var(--text-deep)', mb: 2 }}>
                  {t('dash.quickActions')}
                </Typography>
                <Grid container spacing={isMobile ? 1.5 : 2}>
                  {navButtons.filter(b => b.id !== 0).map((button) => (
                    <Grid item xs={6} sm={6} md={3} key={button.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 3,
                          background: 'rgba(255,255,255,0.75)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid var(--border-neutral)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 'var(--shadow-md)',
                            background: 'rgba(255,255,255,0.9)',
                          }
                        }}
                        onClick={() => setCurrentTab(button.id)}
                      >
                        <CardContent sx={{ textAlign: 'center', p: isMobile ? 1.5 : 2.5, position: 'relative', '&:last-child': { pb: isMobile ? 1.5 : 2.5 } }}>
                          <Avatar sx={{ bgcolor: currentTab === button.id ? 'rgba(255, 255, 255, 0.2)' : button.bgColor, color: currentTab === button.id ? '#fff' : button.color, width: 56, height: 56, margin: '0 auto', mb: 1.5, transition: 'all 0.3s ease' }}>
                            {button.icon}
                          </Avatar>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: currentTab === button.id ? '#fff' : 'var(--text-primary)', mb: 0.5 }}>
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
        
        <MobileBottomNav tabs={navButtons.slice(0, 3)} currentTab={currentTab} onChange={setCurrentTab} />
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