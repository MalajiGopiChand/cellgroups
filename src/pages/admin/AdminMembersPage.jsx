import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Select, MenuItem, FormControl, InputLabel, Fade, Chip, CircularProgress } from '@mui/material';
import { DeleteOutline as DeleteIcon, FilterList as FilterIcon, PersonOutline as PersonIcon, ArrowBack as ArrowBackIcon, FamilyRestroom as FamilyIcon } from '@mui/icons-material';
import { collection, getDocs, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import MemberDetailsDialog from '../../components/MemberDetailsDialog';

function AdminMembersPage({ onBack }) {
  const [members, setMembers] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [filterLeader, setFilterLeader] = useState('');
  const [filterPlace, setFilterPlace] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Profile dialog state
  const [selectedMember, setSelectedMember] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [membersSnap, leadersSnap] = await Promise.all([
          getDocs(collection(db, 'students')),
          getDocs(collection(db, 'cellleaders'))
        ]);
        setMembers(membersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLeaders(leadersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete member ${name}? This will also remove their attendance history.`)) return;
    try {
      // 1. Delete the member doc from students collection
      await deleteDoc(doc(db, 'students', id));
      setMembers(prev => prev.filter(m => m.id !== id));

      // 2. Clean up attendance records
      const attSnap = await getDocs(collection(db, 'attendance'));
      const updates = [];
      
      // Since attendance is stored in arrays inside date-based documents, we must iterate
      attSnap.forEach(docSnap => {
        const data = docSnap.data();
        if (data.attendance && Array.isArray(data.attendance)) {
          // filter out the deleted member, strictly by ID if present, otherwise fallback to name
          const filtered = data.attendance.filter(a => {
            if (a.studentId && a.studentId.length > 15) {
              const baseId = a.studentId.split('_')[0];
              return baseId !== id;
            }
            return a.name !== name;
          });
          
          if (filtered.length !== data.attendance.length) {
            // Push an update promise for documents that contained this member
            updates.push(setDoc(docSnap.ref, {
              ...data,
              attendance: filtered,
              updatedAt: new Date()
            }));
          }
        }
      });
      // Wait for all cleans to complete
      await Promise.all(updates);
      
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const places = [...new Set(members.map(m => m.place))].filter(Boolean).sort();
  const filtered = members.filter(m => {
    if (filterLeader && m.cellLeaderId !== filterLeader) return false;
    if (filterPlace && m.place !== filterPlace) return false;
    return true;
  });

  // Group filtered members by familyId
  const familyGroups = {};
  filtered.forEach(m => {
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </Box>
    );
  }

  return (
    <Fade in timeout={400}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Header & Stats */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {onBack && (
              <IconButton 
                onClick={onBack} 
                sx={{ 
                  bgcolor: 'var(--bg-glass-strong)', 
                  border: '1px solid var(--border-light)', 
                  boxShadow: 'var(--shadow-sm)' 
                }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
              Cell Members
            </Typography>
          </Box>
          <Chip 
            label={`${filtered.length} Total`} 
            size="small" 
            sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)', fontWeight: 700 }} 
          />
        </Box>

        {/* Filters */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 2, 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap', 
            bgcolor: 'var(--bg-glass-strong)', 
            backdropFilter: 'blur(12px)',
            borderRadius: 3,
            border: '1px solid var(--border-light)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', mr: 1 }}>
            <FilterIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" fontWeight={600}>Filters</Typography>
          </Box>
          <FormControl size="small" sx={{ flexGrow: 1, minWidth: 160 }}>
            <InputLabel>Cell Leader</InputLabel>
            <Select 
              value={filterLeader} 
              label="Cell Leader" 
              onChange={(e) => setFilterLeader(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value=""><em>All Leaders</em></MenuItem>
              {leaders.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ flexGrow: 1, minWidth: 160 }}>
            <InputLabel>Place</InputLabel>
            <Select 
              value={filterPlace} 
              label="Place" 
              onChange={(e) => setFilterPlace(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value=""><em>All Places</em></MenuItem>
              {places.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
        </Paper>

        {/* Members List Grouped by Family */}
        {filtered.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {families.map((family, fIdx) => (
              <Fade in timeout={300 + (fIdx * 50)} key={family.familyId || fIdx}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2.5, 
                    bgcolor: 'var(--bg-glass-strong)', 
                    backdropFilter: 'blur(12px)',
                    borderRadius: 4,
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Family Card Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FamilyIcon sx={{ fontSize: 18 }} />
                      {family.head.name}'s Family ({family.members.length})
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip size="small" label={`Leader: ${family.head.cellLeaderName}`} sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(99,102,241,0.08)', color: 'var(--color-primary)', fontWeight: 600 }} />
                      <Chip size="small" label={family.head.place} sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'var(--bg-main)' }} />
                    </Box>
                  </Box>

                  {/* Family Members list */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {family.members.map((m) => (
                      <Box 
                        key={m.id} 
                        onClick={() => {
                          setSelectedMember(m);
                          setDialogOpen(true);
                        }}
                        sx={{ 
                          p: 1.5, 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          bgcolor: 'rgba(255, 255, 255, 0.6)', 
                          borderRadius: 2.5,
                          border: '1px solid rgba(0, 0, 0, 0.03)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': { 
                            transform: 'translateX(2px)', 
                            borderColor: 'rgba(99,102,241,0.2)', 
                            bgcolor: 'rgba(99, 102, 241, 0.02)' 
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: m.relation === 'Head' ? 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))' : 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.relation === 'Head' ? 'var(--color-primary)' : 'var(--text-secondary)' }}>
                            <PersonIcon sx={{ fontSize: 18 }} />
                          </Box>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography fontWeight={700} sx={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.2 }}>{m.name}</Typography>
                              <Chip 
                                size="small" 
                                label={m.relation || 'Head'} 
                                sx={{ 
                                  height: 16, 
                                  fontSize: '0.6rem', 
                                  fontWeight: 700, 
                                  bgcolor: m.relation === 'Spouse' ? 'rgba(236,72,153,0.08)' : m.relation === 'Head' ? 'rgba(99,102,241,0.08)' : 'rgba(0,0,0,0.05)',
                                  color: m.relation === 'Spouse' ? '#ec489a' : m.relation === 'Head' ? 'var(--color-primary)' : 'var(--text-secondary)'
                                }} 
                              />
                            </Box>
                          </Box>
                        </Box>
                        <IconButton 
                          color="error" 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(m.id, m.name);
                          }} 
                          title="Delete Member"
                          sx={{ opacity: 0.6, '&:hover': { opacity: 1, bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Fade>
            ))}
          </Box>
        ) : (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--bg-glass-strong)', borderRadius: 4, border: '1px dashed var(--border-light)' }}>
            <Typography sx={{ color: 'var(--text-tertiary)' }}>No members found matching these filters.</Typography>
          </Paper>
        )}

        {/* Member Profile Dialog */}
        <MemberDetailsDialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)} 
          member={selectedMember} 
          familyMembers={selectedMember ? members.filter(m => m.familyId && m.familyId === selectedMember.familyId) : []}
        />
      </Box>
    </Fade>
  );
}

export default AdminMembersPage;
