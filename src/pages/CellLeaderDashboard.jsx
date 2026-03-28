import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/icons-material';

import { collection, onSnapshot, query, where, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

import CellLeaderHomePage from './cellleader/CellLeaderHomePage';
import CellLeaderAddMemberPage from './cellleader/CellLeaderAddMemberPage';
import CellLeaderAttendancePage from './cellleader/CellLeaderAttendancePage';
import MobileBottomNav from '../components/MobileBottomNav';

function CellLeaderDashboard({ user, onLogout }) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  // Tab State
  const [currentTab, setCurrentTab] = useState(() => {
    const savedTab = sessionStorage.getItem('CellLeaderDashboard_currentTab');
    return savedTab ? parseInt(savedTab, 10) : 0;
  });
  
  const [stats, setStats] = useState({
    totalMembers: 0,
    todayAttendance: 0,
    attendanceTaken: false
  });

  useEffect(() => {
    sessionStorage.setItem('CellLeaderDashboard_currentTab', currentTab.toString());
    window.history.replaceState(null, '', '/cellleader/dashboard');
  }, [currentTab]);

  useEffect(() => {
    if (!user?.id) return;

    const qMembers = query(collection(db, 'students'), where('cellLeaderId', '==', user.id));
    const unsubMembers = onSnapshot(qMembers, (snap) => {
      const mems = snap.docs.map(d => d.data());
      const cellMems = mems.filter(m => m.place === user?.place);
      setStats(prev => ({ ...prev, totalMembers: cellMems.length }));
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const docRefId = `${user.id}_${user.place}_${todayStr}`;
    
    const unsubAttendance = onSnapshot(doc(db, 'attendance', docRefId), (docSnap) => {
      if (docSnap.exists() && docSnap.data().attendance) {
        const attArray = docSnap.data().attendance;
        if (attArray.length > 0) {
          const presentCount = attArray.filter(a => a.status === 'present').length;
          const rate = Math.round((presentCount / attArray.length) * 100);
          setStats(prev => ({ ...prev, todayAttendance: rate, attendanceTaken: true }));
        } else {
          setStats(prev => ({ ...prev, todayAttendance: 0, attendanceTaken: false }));
        }
      } else {
        setStats(prev => ({ ...prev, todayAttendance: 0, attendanceTaken: false }));
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
      label: 'Home', 
      icon: <DashboardIcon />, 
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)',
      description: 'Overview & Alerts'
    },
    { 
      id: 1, 
      label: 'Members', 
      icon: <PersonAddIcon />, 
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      description: 'Manage group'
    },
    { 
      id: 2, 
      label: 'Attendance', 
      icon: <AttendanceIcon />, 
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      description: 'Mark daily'
    }
  ];

  const renderTabContent = () => {
    const content = (() => {
      switch (currentTab) {
        case 0: return <CellLeaderHomePage user={user} />;
        case 1: return <CellLeaderAddMemberPage user={user} onBack={() => setCurrentTab(0)} />;
        case 2: return <CellLeaderAttendancePage user={user} onBack={() => setCurrentTab(0)} />;
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
      title: 'Group Members',
      value: stats.totalMembers,
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)',
      trend: 'Active'
    },
    {
      title: "Today's Attendance",
      value: stats.attendanceTaken ? `${stats.todayAttendance}%` : '--',
      icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      trend: stats.attendanceTaken ? 'Marked' : 'Not marked'
    }
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'var(--bg-main)' }}>
        
        {/* Top App Bar with glassmorphism */}
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'var(--bg-glass-strong)', backgroundImage: 'none', borderBottom: '1px solid var(--border-light)', backdropFilter: 'blur(22px)' }}>
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
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>Bethel Cell</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Leader • {user?.name}</Typography>
              </Box>
            </Box>

            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip size="small" color="primary" variant="outlined" label="Cell Leader" sx={{ borderRadius: 2 }} />
                <Tooltip title="Logout">
                  <Button onClick={onLogout} startIcon={<LogoutIcon />} sx={{ borderRadius: 2, px: 2.5, color: 'var(--text-primary)', fontWeight: 'bold', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' } }}>Logout</Button>
                </Tooltip>
              </Box>
            )}

            {isMobile && (
              <IconButton onClick={onLogout} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.1)', '&:hover': { bgcolor: 'rgba(239,68,68,0.2)' } }}>
                <LogoutIcon />
              </IconButton>
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
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 2 }}>
                    Quick Overview
                  </Typography>
                  <Grid container spacing={isMobile ? 1.5 : 2}>
                    {statsCards.map((stat, index) => (
                      <Grid item xs={12} sm={6} md={6} key={index}>
                        <Card sx={{ borderRadius: 3, background: 'var(--bg-glass-strong)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-light)', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 'var(--shadow-lg)' } }}>
                          <CardContent sx={{ p: isMobile ? 2 : 2.5, '&:last-child': { pb: isMobile ? 2 : 2.5 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: isMobile ? 1.5 : 2 }}>
                              <Avatar sx={{ bgcolor: stat.bgColor, color: stat.color, width: 48, height: 48, borderRadius: 2 }}>{stat.icon}</Avatar>
                              {stat.trend && <Chip size="small" label={stat.trend} sx={{ fontSize: '0.65rem', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', height: 22 }} />}
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 0.5 }}>{stat.value}</Typography>
                            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.title}</Typography>
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
                    <Grid item xs={4} sm={4} md={4} key={button.id}>
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
        
        <MobileBottomNav tabs={navButtons} currentTab={currentTab} onChange={setCurrentTab} />
      </Box>
    </ThemeProvider>
  );
}

export default CellLeaderDashboard;