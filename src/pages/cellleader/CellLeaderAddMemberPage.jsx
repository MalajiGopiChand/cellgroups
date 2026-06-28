import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Fade, 
  TextField, 
  Button, 
  IconButton, 
  Avatar, 
  InputAdornment, 
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  ArrowBack as ArrowBackIcon, 
  Person as PersonIcon, 
  LocationOn as LocationIcon, 
  Group as GroupIcon, 
  CalendarToday as CalendarTodayIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  EscalatorWarning as ChildrenIcon,
  Favorite as SpouseIcon,
  PersonOutline as ParentIcon,
  FamilyRestroom as FamilyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MemberDetailsDialog from '../../components/MemberDetailsDialog';
import EditMemberDialog from '../../components/EditMemberDialog';
import { Edit as EditIcon } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

function CellLeaderAddMemberPage({ user, onBack }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Family and contact state
  const [expanded, setExpanded] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  
  // Profile dialog state
  const [selectedMember, setSelectedMember] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Edit dialog state
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const fetchMembers = async () => {
    if (!user?.id) return;
    const q = query(collection(db, 'students'), where('cellLeaderId', '==', user.id));
    const snap = await getDocs(q);
    setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(m => m.place === user?.place));
  };

  useEffect(() => {
    fetchMembers();
  }, [user?.id, user?.place]);

  const handleMemberUpdated = (updatedMember, newMembers = []) => {
    setMembers(prev => {
      const updatedList = prev.map(m => m.id === updatedMember.id ? updatedMember : m);
      return [...updatedList, ...newMembers];
    });
  };

  const handleAddFamilyMember = () => {
    setFamilyMembers([...familyMembers, { name: '', relation: 'Spouse', dob: '', phone: '' }]);
  };

  const handleFamilyMemberChange = (index, field, value) => {
    const updated = [...familyMembers];
    updated[index][field] = value;
    setFamilyMembers(updated);
  };

  const handleRemoveFamilyMember = (index) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const handleOpenDetails = (member) => {
    setSelectedMember(member);
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    
    // Validate DOB is not future date
    const dobValue = fd.get('dob');
    if (dobValue) {
      const selectedDate = new Date(dobValue);
      const today = new Date();
      if (selectedDate > today) {
        alert('Date of Birth cannot be a future date.');
        setLoading(false);
        return;
      }
    }

    const phoneRegex = /^\d{10}$/;
    
    const primaryPhone = fd.get('phone');
    if (primaryPhone && !phoneRegex.test(primaryPhone.trim())) {
      alert('Please enter a valid 10-digit mobile number for the primary member.');
      setLoading(false);
      return;
    }

    for (let i = 0; i < familyMembers.length; i++) {
      if (familyMembers[i].phone && !phoneRegex.test(familyMembers[i].phone.trim())) {
        alert(`Please enter a valid 10-digit mobile number for family member: ${familyMembers[i].name}`);
        setLoading(false);
        return;
      }
    }

    // Generate a unique familyId for grouping
    const familyId = `family_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const addPromises = [];

    // 1. Add Primary Member (Head)
    addPromises.push(addDoc(collection(db, 'students'), {
      name: fd.get('name').trim(),
      place: user.place,
      cellLeaderName: user.name,
      cellLeaderId: user.id,
      dob: dobValue || null,
      phone: fd.get('phone') || '',
      familyId,
      relation: 'Head',
      createdAt: new Date()
    }));

    // 2. Add Family Members
    familyMembers.forEach((member) => {
      if (member.name && member.name.trim()) {
        addPromises.push(addDoc(collection(db, 'students'), {
          name: member.name.trim(),
          place: user.place,
          cellLeaderName: user.name,
          cellLeaderId: user.id,
          dob: member.dob || null,
          phone: member.phone || '',
          familyId,
          relation: member.relation || 'Other',
          createdAt: new Date()
        }));
      }
    });

    try {
      await Promise.all(addPromises);
      await fetchMembers();
      setFamilyMembers([]);
      setExpanded(false);
      e.target.reset();
    } catch (err) {
      console.error('Error adding family members:', err);
      alert('Failed to add family members. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDOBShort = (dobStr) => {
    if (!dobStr) return '';
    try {
      const date = new Date(dobStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dobStr;
    }
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

  const relationOrder = { 'Head': 1, 'Spouse': 2, 'Father': 3, 'Mother': 4, 'Child': 5, 'Brother': 6, 'Sister': 7, 'Other': 8 };
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

  // Calculate today's date in YYYY-MM-DD format for the max attribute
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <Fade in timeout={350}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
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
            {t('add.title')}
          </Typography>
        </Box>
        <Paper 
          elevation={0}
          sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: 'var(--bg-glass-strong)', 
            backdropFilter: 'blur(12px)',
            borderRadius: 3,
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <form onSubmit={handleSubmit}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--text-secondary)', mb: 1.5 }}>
              {t('add.primaryDetails')}
            </Typography>
            
            <TextField 
              name="name" label={t('add.name')} fullWidth required 
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: 'var(--color-primary)' }} /></InputAdornment> }}
              sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'var(--bg-surface)' } }} 
            />
            <TextField 
              name="dob" label="Date of Birth (Optional)" type="date" fullWidth 
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: todayStr }}
              InputProps={{ startAdornment: <InputAdornment position="start"><CalendarTodayIcon sx={{ color: 'var(--color-primary)' }} /></InputAdornment> }}
              sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'var(--bg-surface)' } }} 
            />
            <TextField 
              name="phone" label="Mobile Number (Optional)" fullWidth type="tel"
              inputProps={{ pattern: "\\d{10}", maxLength: 10 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: 'var(--color-primary)' }} /></InputAdornment> }}
              sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'var(--bg-surface)' } }} 
            />
            
            {/* Collapse / Accordion for Family Details */}
            <Accordion 
              expanded={expanded} 
              onChange={() => setExpanded(!expanded)}
              disableGutters
              elevation={0}
              sx={{ 
                mb: 2.5, 
                borderRadius: '12px !important', 
                border: '1px solid var(--border-light)',
                bgcolor: 'var(--bg-surface)',
                overflow: 'hidden',
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon sx={{ color: 'var(--color-primary)' }} />}
                sx={{ px: 2, py: 0.5, '&.Mui-expanded': { minHeight: 48 } }}
              >
                <Typography sx={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ParentIcon fontSize="small" sx={{ color: 'var(--color-primary)' }} />
                  Add Family Members (Optional)
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Divider sx={{ mb: 1, borderColor: 'var(--border-light)' }} />
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FamilyIcon fontSize="small" sx={{ color: 'var(--color-primary)' }} />
                      Family Members
                    </Typography>
                    <Button 
                      size="small" 
                      startIcon={<AddIcon />} 
                      onClick={handleAddFamilyMember}
                      sx={{ textTransform: 'none', fontWeight: 700, color: 'var(--color-primary)' }}
                    >
                      Add Member
                    </Button>
                  </Box>

                  {familyMembers.map((member, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        p: 2,
                        mb: 2, 
                        border: '1px solid var(--border-light)', 
                        borderRadius: 3, 
                        bgcolor: 'var(--bg-main)',
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 2,
                        position: 'relative'
                      }}
                    >
                      {/* Close / Remove button at top right of the card */}
                      <IconButton 
                        color="error" 
                        size="small" 
                        onClick={() => handleRemoveFamilyMember(index)}
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8,
                          bgcolor: 'rgba(239, 68, 68, 0.05)', 
                          '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } 
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>

                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'var(--text-tertiary)' }}>
                        FAMILY MEMBER #{index + 1}
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField 
                            label="Name" 
                            size="small"
                            fullWidth
                            required
                            value={member.name}
                            onChange={(e) => handleFamilyMemberChange(index, 'name', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'var(--bg-surface)' } }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl size="small" fullWidth required>
                            <InputLabel>Relationship</InputLabel>
                            <Select 
                              label="Relationship"
                              value={member.relation}
                              onChange={(e) => handleFamilyMemberChange(index, 'relation', e.target.value)}
                              sx={{ borderRadius: 2, bgcolor: 'var(--bg-surface)' }}
                            >
                              <MenuItem value="Spouse">Spouse</MenuItem>
                              <MenuItem value="Father">Father</MenuItem>
                              <MenuItem value="Mother">Mother</MenuItem>
                              <MenuItem value="Child">Child</MenuItem>
                              <MenuItem value="Brother">Brother</MenuItem>
                              <MenuItem value="Sister">Sister</MenuItem>
                              <MenuItem value="Other">Other</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField 
                            label="Date of Birth" 
                            size="small"
                            type="date"
                            fullWidth
                            value={member.dob}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ max: todayStr }}
                            onChange={(e) => handleFamilyMemberChange(index, 'dob', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'var(--bg-surface)' } }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField 
                            label="Mobile Number" 
                            size="small"
                            type="tel"
                            fullWidth
                            value={member.phone}
                            inputProps={{ pattern: "\\d{10}", maxLength: 10 }}
                            onChange={(e) => handleFamilyMemberChange(index, 'phone', e.target.value)}
                            InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: 16, color: 'var(--color-primary)' }} /></InputAdornment> }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'var(--bg-surface)' } }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}

                  {familyMembers.length === 0 && (
                    <Typography variant="caption" sx={{ color: 'var(--text-tertiary)', fontStyle: 'italic', display: 'block', textAlign: 'center', py: 2 }}>
                      No family members added. Click "Add Member" to add them dynamically.
                    </Typography>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

            <TextField 
              label="Place" value={user?.place || ''} fullWidth disabled 
              InputProps={{ startAdornment: <InputAdornment position="start"><LocationIcon sx={{ color: 'var(--text-tertiary)' }} /></InputAdornment> }}
              sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'var(--bg-surface)' } }} 
            />
            <TextField 
              label="Cell Leader" value={user?.name || ''} fullWidth disabled 
              InputProps={{ startAdornment: <InputAdornment position="start"><GroupIcon sx={{ color: 'var(--text-tertiary)' }} /></InputAdornment> }}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'var(--bg-surface)' } }} 
            />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              disabled={loading}
              sx={{ 
                bgcolor: 'var(--color-primary)', 
                color: '#fff',
                borderRadius: 999, 
                py: 1.5,
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                '&:hover': {
                  bgcolor: 'var(--color-primary-dark)',
                  boxShadow: '0 6px 16px rgba(99,102,241,0.4)',
                }
              }}
            >
              {loading ? 'Adding...' : t('add.saveBtn')}
            </Button>
          </form>
        </Paper>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, px: 1 }}>
          {t('add.myMembers')} ({members.length})
        </Typography>

        {families.map((family, fIdx) => (
          <Paper 
            key={family.familyId || fIdx} 
            elevation={0}
            sx={{ 
              p: 2, 
              mb: 2,
              bgcolor: 'var(--bg-glass-strong)',
              backdropFilter: 'blur(12px)',
              borderRadius: 4,
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden'
            }}
          >
            {/* Family Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FamilyIcon sx={{ fontSize: 16 }} />
                {family.head.name}'s Family ({family.members.length})
              </Typography>
              <Chip size="small" label={family.head.place} sx={{ bgcolor: 'var(--bg-main)', fontSize: '0.7rem', fontWeight: 700 }} />
            </Box>
            
            {/* Family Members list inside the card */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {family.members.map((m) => (
                <Box 
                  key={m.id} 
                  onClick={() => handleOpenDetails(m)}
                  sx={{ 
                    p: 1.5, 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    borderRadius: 2.5,
                    border: '1px solid rgba(0, 0, 0, 0.03)',
                    bgcolor: 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(99, 102, 241, 0.04)',
                      borderColor: 'rgba(99, 102, 241, 0.15)',
                      transform: 'translateX(2px)'
                    }
                  }}
                >
                  <Avatar sx={{ bgcolor: m.relation === 'Head' ? 'rgba(99,102,241,0.1)' : 'rgba(0,0,0,0.03)', color: m.relation === 'Head' ? 'var(--color-primary)' : 'var(--text-secondary)', fontWeight: 700, width: 36, height: 36, fontSize: '0.9rem' }}>
                    {m.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</Typography>
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
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 0.2, flexWrap: 'wrap' }}>
                      {m.dob && (
                        <Typography variant="caption" sx={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>
                          DOB: {formatDOBShort(m.dob)}
                        </Typography>
                      )}
                      {m.phone && (
                        <Typography variant="caption" sx={{ color: 'var(--color-primary)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                          <PhoneIcon sx={{ fontSize: 10 }} /> {m.phone}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <IconButton 
                      color="primary" 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setMemberToEdit(m);
                        setEditDialogOpen(true);
                      }} 
                      title="Edit Member"
                      sx={{ opacity: 0.7, '&:hover': { opacity: 1, bgcolor: 'rgba(99, 102, 241, 0.1)' } }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <Chip size="small" label="Active" sx={{ bgcolor: 'rgba(16,185,129,0.08)', color: 'var(--color-success)', fontWeight: 700, borderRadius: 2, height: 20, fontSize: '0.65rem' }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        ))}

        {members.length === 0 && (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--bg-glass-strong)', borderRadius: 3, border: '1px dashed var(--border-light)' }}>
            <Typography color="var(--text-tertiary)">No members found. Add one above.</Typography>
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
    </Fade>
  );
}

export default CellLeaderAddMemberPage;
