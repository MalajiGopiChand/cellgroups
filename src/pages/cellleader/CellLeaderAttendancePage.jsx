import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fade, Button, IconButton, Chip } from '@mui/material';
import { collection, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ArrowBack as ArrowBackIcon, FamilyRestroom as FamilyIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function CellLeaderAttendancePage({ user, onBack }) {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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
      newAttendance = attendance.map(a => a.studentId === memberId ? { ...a, studentId: memberId, name: memberName, status } : a);
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
          </Box>
        ) : (
          <Typography color="text.secondary">Add members first</Typography>
        )}
      </Box>
    </Fade>
  );
}

export default CellLeaderAttendancePage;
