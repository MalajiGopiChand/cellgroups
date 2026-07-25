import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Select, MenuItem, FormControl, InputLabel, Fade, Chip, CircularProgress } from '@mui/material';
import { DeleteOutline as DeleteIcon, FilterList as FilterIcon, PersonOutline as PersonIcon, ArrowBack as ArrowBackIcon, FamilyRestroom as FamilyIcon } from '@mui/icons-material';
import { collection, getDocs, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import MemberDetailsDialog from '../../components/MemberDetailsDialog';
import EditMemberDialog from '../../components/EditMemberDialog';
import { Edit as EditIcon } from '@mui/icons-material';
import AdminFamilyProfilePage from './AdminFamilyProfilePage';
import { useHardwareBack } from '../../hooks/useHardwareBack';

function AdminMembersPage({ onBack }) {
  const [members, setMembers] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [filterLeader, setFilterLeader] = useState('');
  const [filterPlace, setFilterPlace] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Profile dialog state
  const [selectedMember, setSelectedMember] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Family Profile state
  const [selectedFamily, setSelectedFamily] = useState(null);
  
  // Edit dialog state
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useHardwareBack(!!selectedFamily, () => setSelectedFamily(null));
  useHardwareBack(dialogOpen, () => setDialogOpen(false));
  useHardwareBack(editDialogOpen, () => setEditDialogOpen(false));

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
  const handleMemberUpdated = (updatedMember, newMembers = []) => {
    setMembers(prev => {
      const updatedList = prev.map(m => m.id === updatedMember.id ? updatedMember : m);
      return [...updatedList, ...newMembers];
    });
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

  if (selectedFamily) {
    return <AdminFamilyProfilePage family={selectedFamily} onBack={() => setSelectedFamily(null)} />;
  }

  return (
    
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 0.5 }}>Manage Members</Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>View and manage all cell group members</Typography>
          </Box>
          <Chip 
            label={`${filtered.length} Members`} 
            size="small" 
            sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)', fontWeight: 700 }} 
          />
        </Box>

        {/* Sleek Single-Line Filter Card */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 1.5, 
            display: 'flex', 
            gap: 1.5, alignItems: 'center',
            bgcolor: 'var(--bg-glass-strong)', 
            backdropFilter: 'blur(12px)',
            borderRadius: 1,
            border: '1px solid var(--border-light)',
            flexWrap: 'wrap',
            mb: 2
          }}
        >
          <FormControl size="small" sx={{ minWidth: 110, flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--surface-white)' } }}>
            <InputLabel>Cell Leader</InputLabel>
            <Select 
              value={filterLeader} 
              label="Cell Leader" 
              onChange={(e) => setFilterLeader(e.target.value)}
            >
              <MenuItem value=""><em>All Leaders</em></MenuItem>
              {leaders.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 110, flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: 'var(--surface-white)' } }}>
            <InputLabel>Place</InputLabel>
            <Select 
              value={filterPlace} 
              label="Place" 
              onChange={(e) => setFilterPlace(e.target.value)}
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
              <Paper 
                key={family.familyId}
                elevation={0}
                onClick={() => setSelectedFamily(family)}
                sx={{ 
                  p: 2.5, 
                  bgcolor: 'var(--bg-glass-strong)', 
                  backdropFilter: 'blur(12px)',
                  borderRadius: 1,
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--shadow-md)',
                    borderColor: 'rgba(99,102,241,0.3)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                      <FamilyIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-deep)', lineHeight: 1.2 }}>
                        {family.head.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.5 }}>
                        Family of {family.members.length}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    <Chip size="small" label={`Leader: ${family.head.cellLeaderName || 'Unassigned'}`} sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'rgba(99,102,241,0.08)', color: 'var(--color-primary)', fontWeight: 700 }} />
                    <Chip size="small" label={family.head.place || 'Unknown Place'} sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'var(--bg-main)', fontWeight: 600, color: 'var(--text-secondary)' }} />
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--bg-glass-strong)', borderRadius: 1, border: '1px dashed var(--border-light)' }}>
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

        <EditMemberDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          member={memberToEdit}
          onMemberUpdated={handleMemberUpdated}
        />
      </Box>
    
  );
}

export default AdminMembersPage;
