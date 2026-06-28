import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Fade, Button, IconButton, Chip, Snackbar, Alert } from '@mui/material';
import { collection, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ArrowBack as ArrowBackIcon, FamilyRestroom as FamilyIcon, Download as DownloadIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { useLanguage } from '../../contexts/LanguageContext';

function CellLeaderAttendancePage({ user, onBack }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const printRef = useRef(null);

  const handleDownload = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, { backgroundColor: '#ffffff', scale: 2 });
      const data = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = data;
      link.download = `Attendance_${selectedDate}.png`;
      link.click();
    } catch (e) {
      console.error('Failed to generate image:', e);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  useEffect(() => {
    const fetch = async () => {
      if (!user?.id) return;
      const q = query(collection(db, 'students'), where('cellLeaderId', '==', user.id));
      const snap = await getDocs(q);
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(m => m.place === user?.place));
    };
    fetch();
  }, [user?.id, user?.place]);

  useEffect(() => {
    const fetch = async () => {
      setAttendance([]); 
      if (!user?.id) return;
      const ref = doc(db, 'attendance', `${user.id}_${user.place}_${selectedDate}`);
      const snap = await getDoc(ref);
      setAttendance(snap.exists() ? (snap.data().attendance || []) : []);
    };
    fetch();
  }, [user?.id, user?.place, selectedDate]);

  const handleMark = async (memberId, memberName, status) => {
    const current = attendance.find(a => a.studentId === memberId);
    let newAttendance;
    if (current) {
      newAttendance = attendance.map(a => 
        a.studentId === memberId ? { ...a, status } : a
      );
    } else {
      newAttendance = [...attendance, { studentId: memberId, name: memberName, status }];
    }
    setAttendance(newAttendance);
    
    await setDoc(doc(db, 'attendance', `${user.id}_${user.place}_${selectedDate}`), {
      cellLeaderId: user.id,
      place: user.place,
      date: selectedDate,
      attendance: newAttendance,
      updatedAt: new Date()
    }, { merge: true });
  };

  const familyGroups = {};
  members.forEach(m => {
    const fid = m.familyId || `single_${m.id}`;
    if (!familyGroups[fid]) {
      familyGroups[fid] = [];
    }
    familyGroups[fid].push(m);
  });

  const relationOrder = { 'Head': 1, 'Spouse': 2, 'Father': 3, 'Mother': 4, 'Child': 5 };
  const getRelationOrder = (rel) => relationOrder[rel] || 99;

  const families = Object.values(familyGroups).map(group => {
    const sortedGroup = group.sort((a, b) => getRelationOrder(a.relation) - getRelationOrder(b.relation));
    const head = sortedGroup.find(m => m.relation === 'Head') || sortedGroup[0];
    return {
      familyId: head.familyId || `single_${head.id}`,
      head,
      members: sortedGroup
    };
  });

  return (
    <Fade in timeout={350}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <IconButton 
            onClick={onBack ? onBack : () => navigate('/cellleader/dashboard')} 
            sx={{ 
              bgcolor: 'var(--bg-glass-strong)', 
              border: '1px solid var(--border-light)', 
              boxShadow: 'var(--shadow-sm)',
              '&:hover': { bgcolor: 'var(--bg-surface)' } 
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
            {t('att.title')}
          </Typography>
        </Box>
        <Typography variant="body2" color="var(--text-secondary)" sx={{ mb: 3, fontWeight: 600 }}>{user?.name} • {user?.place}</Typography>
        
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ mr: 1.5, fontWeight: 700, color: 'var(--text-secondary)' }}>Date:</Typography>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', fontFamily: 'inherit', fontWeight: 600 }} />
          <Button 
            onClick={handleDownload} 
            startIcon={<DownloadIcon />} 
            variant="outlined" 
            size="small"
            sx={{ 
              ml: 2,
              borderRadius: 2, 
              color: 'var(--color-primary)', 
              borderColor: 'rgba(99, 102, 241, 0.5)',
              fontWeight: 700,
              '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.05)', borderColor: 'var(--color-primary)' } 
            }}
          >
            {t('att.download')}
          </Button>
        </Box>

        {members.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--bg-glass-strong)', borderRadius: 3, border: '1px dashed var(--border-light)' }}>
            <Typography color="var(--text-tertiary)">{t('att.addFirst')}</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {families.map(family => (
              <Paper 
                key={family.familyId} 
                elevation={0}
                sx={{ 
                  p: 2, 
                  bgcolor: 'var(--bg-glass-strong)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: 'var(--shadow-sm)', 
                  border: '1px solid var(--border-light)',
                  borderRadius: 4,
                  mb: 1
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--color-primary)', mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <FamilyIcon sx={{ fontSize: 16 }} />
                  {family.head.name}'s Family
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {family.members.map(m => {
                    const mRec = attendance.find(a => a.studentId === m.id);
                    const isPresent = mRec?.status === 'present';
                    const isAbsent = mRec?.status === 'absent';
                    return (
                      <Fade in key={m.id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography fontWeight={700}>{m.name}</Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              size="small"
                              label={t('att.presentBtn')}
                              icon={<CheckCircleIcon fontSize="small" />}
                              onClick={() => handleMark(m.id, m.name, 'present')}
                              sx={{ 
                                bgcolor: isPresent ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0,0,0,0.04)',
                                color: isPresent ? '#059669' : 'var(--text-secondary)',
                                fontWeight: isPresent ? 800 : 600,
                                border: isPresent ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                                '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.2)' }
                              }}
                            />
                            <Chip 
                              size="small"
                              label={t('att.absentBtn')}
                              icon={<CancelIcon fontSize="small" />}
                              onClick={() => handleMark(m.id, m.name, 'absent')}
                              sx={{ 
                                bgcolor: isAbsent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0,0,0,0.04)',
                                color: isAbsent ? '#dc2626' : 'var(--text-secondary)',
                                fontWeight: isAbsent ? 800 : 600,
                                border: isAbsent ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
                                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
                              }}
                            />
                          </Box>
                        </Box>
                      </Fade>
                    );
                  })}
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
          <div ref={printRef} style={{ width: 800, padding: '30px', background: '#fff', color: '#000', fontFamily: 'sans-serif' }}>
            <h2 style={{ color: '#6366f1', marginBottom: '20px' }}>Bethel Cell Attendance - {selectedDate}</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px' }}>Name</th>
                  <th style={{ padding: '12px 16px' }}>Relation</th>
                  <th style={{ padding: '12px 16px' }}>Phone Number</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => {
                  const mRec = attendance.find(a => a.studentId === member.id);
                  const mStatus = mRec?.status || 'Not Marked';
                  const statusColor = mStatus === 'present' ? '#10b981' : (mStatus === 'absent' ? '#ef4444' : '#6b7280');
                  const displayName = (member.firstName || '') + ' ' + (member.lastName || '');
                  return (
                    <tr key={member.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{displayName.trim() || 'Unknown'}</td>
                      <td style={{ padding: '12px 16px' }}>{member.relation || 'Head'}</td>
                      <td style={{ padding: '12px 16px' }}>{member.mobile || 'N/A'}</td>
                      <td style={{ padding: '12px 16px', color: statusColor, fontWeight: 'bold', textTransform: 'capitalize' }}>{mStatus}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <Snackbar 
          open={snackbarOpen} 
          autoHideDuration={3000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}>
            {t('att.savedAlert')} {selectedDate}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
}

export default CellLeaderAttendancePage;
