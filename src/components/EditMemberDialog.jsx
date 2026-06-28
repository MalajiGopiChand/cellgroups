import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, 
  IconButton, Box, Grid, FormControl, InputLabel, Select, MenuItem, InputAdornment, Typography,
  Divider, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Person as PersonIcon, 
  Phone as PhoneIcon, 
  CalendarToday as CalendarTodayIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  FamilyRestroom as FamilyIcon
} from '@mui/icons-material';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

function EditMemberDialog({ open, onClose, member, onMemberUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    relation: ''
  });
  const [newFamilyMembers, setNewFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (member && open) {
      setFormData({
        name: member.name || '',
        phone: member.phone || '',
        dob: member.dob || '',
        relation: member.relation || 'Other'
      });
      setNewFamilyMembers([]);
      setExpanded(false);
    }
  }, [member, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddNewFamilyMember = () => {
    setNewFamilyMembers([...newFamilyMembers, { name: '', relation: 'Other', dob: '', phone: '' }]);
    setExpanded(true);
  };

  const handleNewFamilyMemberChange = (index, field, value) => {
    const updated = [...newFamilyMembers];
    updated[index][field] = value;
    setNewFamilyMembers(updated);
  };

  const handleRemoveNewFamilyMember = (index) => {
    setNewFamilyMembers(newFamilyMembers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!member) return;
    
    // Basic validation
    const phoneRegex = /^\d{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.trim())) {
      alert('Please enter a valid 10-digit mobile number for the member.');
      return;
    }

    for (let i = 0; i < newFamilyMembers.length; i++) {
      if (!newFamilyMembers[i].name.trim()) {
        alert(`Please enter a name for new family member #${i + 1}`);
        return;
      }
      if (newFamilyMembers[i].phone && !phoneRegex.test(newFamilyMembers[i].phone.trim())) {
        alert(`Please enter a valid 10-digit mobile number for family member: ${newFamilyMembers[i].name}`);
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Update current member
      const memberRef = doc(db, 'students', member.id);
      const updatedMemberData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        dob: formData.dob,
        relation: formData.relation
      };
      await updateDoc(memberRef, updatedMemberData);
      
      const newlyAddedDocs = [];

      // 2. Add new family members if any exist
      if (newFamilyMembers.length > 0) {
        // We use the same familyId. If the current member doesn't have one, we create one.
        const familyId = member.familyId || `family_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // If the current member didn't have a familyId, update them with it so they link properly
        if (!member.familyId) {
          await updateDoc(memberRef, { familyId });
          updatedMemberData.familyId = familyId;
        }

        const addPromises = newFamilyMembers.map(async (newMem) => {
          const docData = {
            name: newMem.name.trim(),
            place: member.place,
            cellLeaderName: member.cellLeaderName,
            cellLeaderId: member.cellLeaderId,
            dob: newMem.dob || null,
            phone: newMem.phone || '',
            familyId,
            relation: newMem.relation || 'Other',
            createdAt: new Date()
          };
          const docRef = await addDoc(collection(db, 'students'), docData);
          return { id: docRef.id, ...docData };
        });

        const results = await Promise.all(addPromises);
        newlyAddedDocs.push(...results);
      }

      if (onMemberUpdated) {
        // Pass both the updated member and any newly created members
        onMemberUpdated({ ...member, ...updatedMemberData }, newlyAddedDocs);
      }
      onClose();
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Failed to update member.');
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: 'var(--bg-glass-strong)',
          backdropFilter: 'blur(22px)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-lg)'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'rgba(99, 102, 241, 0.04)' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
          Edit Member Details
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'var(--text-secondary)' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3, borderColor: 'var(--border-light)', maxHeight: '70vh', overflowY: 'auto' }}>
          
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--text-secondary)', mb: 2 }}>
            EDIT EXISTING DETAILS
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField 
                name="name" label="Name" fullWidth required 
                value={formData.name} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: 'var(--color-primary)' }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'var(--bg-surface)' } }} 
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'var(--bg-surface)' } }}>
                <InputLabel>Relationship</InputLabel>
                <Select name="relation" value={formData.relation} label="Relationship" onChange={handleChange}>
                  <MenuItem value="Head">Head</MenuItem>
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
                name="dob" label="Date of Birth" type="date" fullWidth 
                value={formData.dob} onChange={handleChange}
                InputLabelProps={{ shrink: true }} inputProps={{ max: todayStr }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarTodayIcon sx={{ color: 'var(--color-primary)' }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'var(--bg-surface)' } }} 
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField 
                name="phone" label="Mobile Number" fullWidth type="tel"
                value={formData.phone} onChange={handleChange}
                inputProps={{ pattern: "\\d{10}", maxLength: 10 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: 'var(--color-primary)' }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'var(--bg-surface)' } }} 
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, mb: 1 }}>
            <Accordion 
              expanded={expanded} 
              onChange={() => setExpanded(!expanded)}
              disableGutters
              elevation={0}
              sx={{ 
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
                  <FamilyIcon fontSize="small" sx={{ color: 'var(--color-primary)' }} />
                  Add New Family Members (Optional)
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Divider sx={{ mb: 1, borderColor: 'var(--border-light)' }} />
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button 
                      size="small" 
                      startIcon={<AddIcon />} 
                      onClick={handleAddNewFamilyMember}
                      sx={{ textTransform: 'none', fontWeight: 700, color: 'var(--color-primary)' }}
                    >
                      Add Member
                    </Button>
                  </Box>

                  {newFamilyMembers.map((newMem, index) => (
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
                      <IconButton 
                        color="error" 
                        size="small" 
                        onClick={() => handleRemoveNewFamilyMember(index)}
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
                        NEW FAMILY MEMBER #{index + 1}
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField 
                            label="Name" 
                            size="small"
                            fullWidth
                            required
                            value={newMem.name}
                            onChange={(e) => handleNewFamilyMemberChange(index, 'name', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'var(--bg-surface)' } }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl size="small" fullWidth required>
                            <InputLabel>Relationship</InputLabel>
                            <Select 
                              label="Relationship"
                              value={newMem.relation}
                              onChange={(e) => handleNewFamilyMemberChange(index, 'relation', e.target.value)}
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
                            value={newMem.dob}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ max: todayStr }}
                            onChange={(e) => handleNewFamilyMemberChange(index, 'dob', e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'var(--bg-surface)' } }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField 
                            label="Mobile Number" 
                            size="small"
                            type="tel"
                            fullWidth
                            value={newMem.phone}
                            inputProps={{ pattern: "\\d{10}", maxLength: 10 }}
                            onChange={(e) => handleNewFamilyMemberChange(index, 'phone', e.target.value)}
                            InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: 16, color: 'var(--color-primary)' }} /></InputAdornment> }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'var(--bg-surface)' } }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}

                  {newFamilyMembers.length === 0 && (
                    <Typography variant="caption" sx={{ color: 'var(--text-tertiary)', fontStyle: 'italic', display: 'block', textAlign: 'center', py: 2 }}>
                      Click "Add Member" to add family members dynamically.
                    </Typography>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>

        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: 'rgba(0,0,0,0.02)', borderColor: 'var(--border-light)', borderTop: '1px solid var(--border-light)' }}>
          <Button onClick={onClose} sx={{ color: 'var(--text-secondary)', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: 'var(--color-primary)', borderRadius: 2, px: 3, fontWeight: 700 }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default EditMemberDialog;
