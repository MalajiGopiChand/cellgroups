import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Fade, Button, IconButton, Chip, Snackbar, Alert } from '@mui/material';
import { collection, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ArrowBack as ArrowBackIcon, FamilyRestroom as FamilyIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';

function CellLeaderAttendancePage({ user, onBack }) {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [showSnackbar, setShowSnackbar] = useState(false);
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
      setAttendance([]); // Clear instantly when date changes
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
    
    // Auto-save instantly so data is not lost if date changes
    await setDoc(doc(db, 'attendance', `${user.id}_${user.place}_${selectedDate}`), {
      cellLeaderId: user.id,
      place: user.place,
      date: selectedDate,
      attendance: newAttendance,
      updatedAt: new Date()
    }, { merge: true });
  };

  const handleSave = async () => {
    if (attendance.length > 0) {
      await setDoc(doc(db, 'attendance', `${user.id}_${user.place}_${selectedDate}`), {
        cellLeaderId: user.id,
        place: user.place,
        date: selectedDate,
        attendance: attendance,
        updatedAt: new Date()
      }, { merge: true });
      
      setShowSnackbar(true);
    }
  };

  const getButtonStyles = (isSelected, type, isSubRow = false) => {
    const colorSuccess = 'var(--color-success)';
    const colorError = 'var(--color-error)';
    const baseColor = type === 'present' ? colorSuccess : colorError;
    const hoverBg = type === 'present' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)';
    const activeBg = type === 'present' ? 'var(--color-success)' : 'var(--color-error)';
    
    return {
      fontWeight: 600,
      textTransform: 'none',
      borderRadius: 2,
      padding: isSubRow ? '2px 10px' : '4px 12px',
      minWidth: isSubRow ? '60px' : '75px',
      fontSize: isSubRow ? '0.75rem' : '0.875rem',
      bgcolor: isSelected ? activeBg : 'transparent',
      color: isSelected ? '#fff' : 'var(--text-secondary)',
      border: isSelected ? '1px solid transparent' : '1px solid var(--border-light)',
      boxShadow: isSelected ? `0 4px 12px ${type === 'present' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` : 'none',
      '&:hover': { 
        bgcolor: isSelected ? (type === 'present' ? '#059669' : '#dc2626') : hoverBg, 
        color: isSelected ? '#fff' : baseColor 
      }
    };
  };

  // Group members by familyId
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
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>Take Attendance</Typography>
        </Box>
        <Typography variant="body2" color="var(--text-secondary)" sx={{ mb: 3, fontWeight: 600 }}>{user?.name} • {user?.place}</Typography>
        
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ mr: 1.5, fontWeight: 700, color: 'var(--text-secondary)' }}>Date:</Typography>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', fontFamily: 'inherit', fontWeight: 600 }} />
          <Button 
            variant="contained" 
            size="small" 
            onClick={handleDownload}
            sx={{ ml: 2, bgcolor: 'var(--color-primary)', borderRadius: 2, fontWeight: 700 }}
          >
            Download IMG
          </Button>
        </Box>
        {members.length > 0 ? (
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
                {/* Family Header */}
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--color-primary)', mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <FamilyIcon sx={{ fontSize: 16 }} />
                  {family.head.name}'s Family
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {family.members.map(member => {
                    const mId = member.id || member.name;
                    const mRec = attendance.find(a => a.studentId === mId);
                    const mStatus = mRec?.status || null;
                    const displayName = member.relation && member.relation !== 'Head' 
                      ? `${member.name} (${member.relation} of ${family.head.name})`
                      : member.name;

                    return (
                      <Box 
                        key={member.id} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          pl: member.relation && member.relation !== 'Head' ? 2 : 0,
                          borderLeft: member.relation && member.relation !== 'Head' ? '2px solid var(--border-light)' : 'none',
                          py: 0.5
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography fontWeight={700} sx={{ color: 'var(--text-primary)', fontSize: member.relation && member.relation !== 'Head' ? '0.9rem' : '1rem' }}>
                            {member.name}
                          </Typography>
                          {member.relation && (
                            <Chip 
                              size="small" 
                              label={member.relation} 
                              sx={{ 
                                height: 16, 
                                fontSize: '0.6rem', 
                                fontWeight: 700,
                                bgcolor: member.relation === 'Spouse' ? 'rgba(236,72,153,0.08)' : member.relation === 'Head' ? 'rgba(99,102,241,0.08)' : 'rgba(0,0,0,0.05)',
                                color: member.relation === 'Spouse' ? '#ec489a' : member.relation === 'Head' ? 'var(--color-primary)' : 'var(--text-secondary)'
                              }} 
                            />
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            size="small" 
                            onClick={() => handleMark(mId, displayName, 'present')}
                            sx={getButtonStyles(mStatus === 'present', 'present', member.relation && member.relation !== 'Head')}
                          >
                            Present
                          </Button>
                          <Button 
                            size="small" 
                            onClick={() => handleMark(mId, displayName, 'absent')}
                            sx={getButtonStyles(mStatus === 'absent', 'absent', member.relation && member.relation !== 'Head')}
                          >
                            Absent
                          </Button>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            ))}

            {/* Submit Button */}
            {attendance.length > 0 && (
              <Button 
                variant="contained"
                fullWidth
                onClick={handleSave}
                sx={{ mt: 1, mb: 2, py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', bgcolor: 'var(--color-success)', '&:hover': { bgcolor: '#059669' } }}
              >
                Save Attendance
              </Button>
            )}
          </Box>
        ) : (
          <Typography color="text.secondary">Add members first</Typography>
        )}

        {/* Hidden Printable Area */}
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
          open={showSnackbar} 
          autoHideDuration={3000} 
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setShowSnackbar(false)} severity="success" sx={{ width: '100%', fontWeight: 700, borderRadius: 2 }}>
            Attendance saved successfully for {selectedDate}!
          </Alert>
        </Snackbar>

      </Box>
    </Fade>
  );
}

export default CellLeaderAttendancePage;
