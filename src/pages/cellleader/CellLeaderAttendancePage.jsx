import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Fade, Button, IconButton, Snackbar, Alert, Avatar, Collapse } from '@mui/material';
import { collection, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ArrowBack as ArrowBackIcon, Download as DownloadIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
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
  const [expandedFamilies, setExpandedFamilies] = useState({});
  const printRef = useRef(null);

  const toggleFamily = (familyId) => {
    setExpandedFamilies(prev => ({
      ...prev,
      [familyId]: !prev[familyId]
    }));
  };

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
              bgcolor: 'transparent', 
              color: 'var(--text-deep)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } 
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" className="font-playfair" sx={{ fontWeight: 700, color: 'var(--text-deep)' }}>
            {t('att.title')}
          </Typography>
        </Box>
        <Typography variant="body2" color="var(--text-secondary)" sx={{ mb: 3, fontWeight: 600 }}>{user?.name} • {user?.place}</Typography>
        
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', bgcolor: 'var(--surface-sage)', p: 2, borderRadius: 4 }}>
          <Typography variant="caption" sx={{ mr: 1.5, fontWeight: 700, color: 'var(--text-sage)' }}>Date:</Typography>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ padding: '8px 12px', borderRadius: '12px', border: 'none', background: 'var(--surface-white)', color: 'var(--text-deep)', fontFamily: 'inherit', fontWeight: 600, boxShadow: 'var(--shadow-sm)' }} />
          <Box sx={{ flexGrow: 1 }} />
          <Button 
            onClick={handleDownload} 
            startIcon={<DownloadIcon />} 
            size="small"
            sx={{ 
              borderRadius: 3, 
              color: 'var(--surface-white)', 
              bgcolor: 'var(--primary-forest)',
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)',
              '&:hover': { bgcolor: 'var(--primary-forest)', opacity: 0.9 } 
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
                onClick={() => toggleFamily(family.familyId)}
                sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: 'var(--shadow-sm)', 
                  border: '1px solid var(--border-neutral)',
                  borderRadius: '21px',
                  mb: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', ml: 1 }}>
                      {family.members.slice(0, 3).map((m) => {
                        const mRec = attendance.find(a => a.studentId === m.id);
                        const isPresent = mRec?.status === 'present';
                        const isAbsent = mRec?.status === 'absent';
                        let avatarColor = 'var(--border-neutral)';
                        let textColor = 'var(--text-deep)';
                        if (isPresent) { avatarColor = '#4E7D58'; textColor = '#fff'; }
                        else if (isAbsent) { avatarColor = '#ef4444'; textColor = '#fff'; }
                        
                        return (
                          <Avatar key={m.id} sx={{ 
                            width: 36, height: 36, 
                            ml: -1, 
                            border: '2px solid #fff',
                            bgcolor: avatarColor,
                            color: textColor,
                            fontSize: '0.85rem',
                            fontWeight: 700
                          }}>
                            {m.name.substring(0, 2).toUpperCase()}
                          </Avatar>
                        )
                      })}
                      {family.members.length > 3 && (
                        <Avatar sx={{ width: 36, height: 36, ml: -1, border: '2px solid #fff', bgcolor: 'var(--surface-sage)', color: 'var(--text-sage)', fontSize: '0.8rem', fontWeight: 700 }}>
                          +{family.members.length - 3}
                        </Avatar>
                      )}
                    </Box>
                    <Box sx={{ ml: 1 }}>
                      <Typography sx={{ fontWeight: 700, color: 'var(--text-deep)', fontSize: 16 }}>{family.head.name} family</Typography>
                      <Typography sx={{ color: 'var(--text-supporting)', fontSize: 13, fontWeight: 500 }}>{family.members.length} members</Typography>
                    </Box>
                  </Box>
                  <ChevronRightIcon sx={{ color: 'var(--text-supporting)', transform: expandedFamilies[family.familyId] ? 'rotate(90deg)' : 'none', transition: '0.3s' }} />
                </Box>

                <Collapse in={expandedFamilies[family.familyId]} timeout="auto" unmountOnExit>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 3, pt: 2, borderTop: '1px dashed var(--border-neutral)' }} onClick={(e) => e.stopPropagation()}>
                    {family.members.map(m => {
                      const mRec = attendance.find(a => a.studentId === m.id);
                      const isPresent = mRec?.status === 'present';
                      const isAbsent = mRec?.status === 'absent';
                      return (
                        <Fade in key={m.id}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontWeight: 700, color: 'var(--text-deep)' }}>{m.name}</Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Box 
                                onClick={() => handleMark(m.id, m.name, 'present')}
                                sx={{
                                  width: 32, height: 32, borderRadius: '10px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer',
                                  bgcolor: isPresent ? '#4E7D58' : 'var(--surface-white)',
                                  border: isPresent ? 'none' : '1px solid var(--border-neutral)',
                                  color: isPresent ? '#fff' : 'transparent',
                                  transition: 'all 0.2s',
                                  '&:hover': { bgcolor: isPresent ? '#4E7D58' : 'var(--surface-sage)', borderColor: 'transparent' }
                                }}
                              >
                                <CheckCircleIcon sx={{ fontSize: 20 }} />
                              </Box>
                              <Box 
                                onClick={() => handleMark(m.id, m.name, 'absent')}
                                sx={{
                                  width: 32, height: 32, borderRadius: '10px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer',
                                  bgcolor: isAbsent ? '#ef4444' : 'var(--surface-white)',
                                  border: isAbsent ? 'none' : '1px solid var(--border-neutral)',
                                  color: isAbsent ? '#fff' : 'transparent',
                                  transition: 'all 0.2s',
                                  '&:hover': { bgcolor: isAbsent ? '#ef4444' : 'var(--app-bg)', borderColor: 'transparent' }
                                }}
                              >
                                <CancelIcon sx={{ fontSize: 20 }} />
                              </Box>
                            </Box>
                          </Box>
                        </Fade>
                      );
                    })}
                  </Box>
                </Collapse>
              </Paper>
            ))}
          </Box>
        )}

        <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
          <div ref={printRef} style={{ width: '794px', minHeight: '1123px', padding: '40px', background: '#fff', color: '#000', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
            <h2 style={{ color: '#6366f1', marginBottom: '20px' }}>Bethel Cell Attendance - {selectedDate}</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', borderBottom: '2px solid #d1d5db' }}>S.No.</th>
                  <th style={{ padding: '12px 16px', borderBottom: '2px solid #d1d5db' }}>Name</th>
                  <th style={{ padding: '12px 16px', borderBottom: '2px solid #d1d5db' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {families.map((family, fIndex) => (
                  <React.Fragment key={family.head.id}>
                    {family.members.map((member, mIndex) => {
                      const mRec = attendance.find(a => a.studentId === member.id);
                      const mStatus = mRec?.status || 'Not Marked';
                      const statusColor = mStatus === 'present' ? '#10b981' : (mStatus === 'absent' ? '#ef4444' : '#6b7280');
                      const displayName = (member.firstName || '') + ' ' + (member.lastName || '') || member.name;
                      const globalIndex = families.slice(0, fIndex).reduce((acc, f) => acc + f.members.length, 0) + mIndex + 1;
                      return (
                        <tr key={member.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px 16px', color: '#4b5563' }}>{globalIndex}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{displayName.trim() || 'Unknown'}</td>
                          <td style={{ padding: '12px 16px', color: statusColor, fontWeight: 'bold', textTransform: 'capitalize' }}>{mStatus}</td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
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
