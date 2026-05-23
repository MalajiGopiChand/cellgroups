import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Avatar, 
  Divider, 
  Grid, 
  IconButton, 
  Chip,
  Paper
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Phone as PhoneIcon, 
  CalendarToday as CalendarIcon, 
  LocationOn as LocationIcon, 
  Group as LeaderIcon,
  EscalatorWarning as ChildrenIcon,
  Favorite as SpouseIcon,
  Person as PersonIcon,
  FamilyRestroom as FamilyIcon
} from '@mui/icons-material';

function MemberDetailsDialog({ open, onClose, member, familyMembers = [] }) {
  if (!member) return null;

  // Format DOB if present
  const formatDOB = (dobStr) => {
    if (!dobStr) return 'Not Provided';
    try {
      const date = new Date(dobStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dobStr;
    }
  };

  // Sort relations: Head, Spouse, Father, Mother, Child
  const relationOrder = { 'Head': 1, 'Spouse': 2, 'Father': 3, 'Mother': 4, 'Child': 5 };
  const getRelationOrder = (rel) => relationOrder[rel] || 99;

  const sortedFamily = [...familyMembers]
    .filter(m => m.id !== member.id) // Exclude current member
    .sort((a, b) => getRelationOrder(a.relation) - getRelationOrder(b.relation));

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
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Dialog Header */}
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'rgba(99, 102, 241, 0.04)' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
          Member Profile
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: 'var(--text-secondary)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, borderColor: 'var(--border-light)', maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Profile Card */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'rgba(99, 102, 241, 0.1)', 
              color: 'var(--color-primary)', 
              fontWeight: 800, 
              width: 64, 
              height: 64, 
              fontSize: '1.5rem',
              border: '2px solid rgba(99, 102, 241, 0.2)'
            }}
          >
            {member.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 0.5 }}>
              {member.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                size="small" 
                label={member.relation || 'Head'} 
                sx={{ bgcolor: 'var(--color-primary)', color: '#fff', fontWeight: 700 }}
              />
              <Chip 
                size="small" 
                label={member.place || 'Unknown Place'} 
                icon={<LocationIcon sx={{ fontSize: '12px !important' }} />}
                sx={{ bgcolor: 'var(--bg-main)', fontWeight: 600, color: 'var(--text-secondary)' }} 
              />
              <Chip 
                size="small" 
                label={`Leader: ${member.cellLeaderName || 'Unknown'}`} 
                icon={<LeaderIcon sx={{ fontSize: '12px !important' }} />}
                sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)', fontWeight: 600, color: 'var(--color-primary)' }} 
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2.5, borderColor: 'var(--border-light)' }} />

        {/* Member Details */}
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Date of Birth
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon fontSize="small" sx={{ color: 'var(--color-primary)' }} />
                <Typography sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formatDOB(member.dob)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Phone Number
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" sx={{ color: 'var(--color-primary)' }} />
                {member.phone ? (
                  <Typography 
                    component="a" 
                    href={`tel:${member.phone}`}
                    sx={{ 
                      fontWeight: 700, 
                      color: 'var(--color-primary)', 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' } 
                    }}
                  >
                    {member.phone}
                  </Typography>
                ) : (
                  <Typography sx={{ fontWeight: 500, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    Not Provided
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'var(--border-light)' }} />

        {/* Family Details Section */}
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--text-primary)', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FamilyIcon sx={{ color: 'var(--color-primary)' }} />
          Family Members
        </Typography>

        {sortedFamily.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {sortedFamily.map((fam, index) => {
              const iconColor = fam.relation === 'Spouse' ? '#ec489a' : 'var(--color-primary)';
              return (
                <Paper 
                  key={fam.id || index}
                  variant="outlined" 
                  sx={{ 
                    p: 1.8, 
                    borderRadius: 3, 
                    borderColor: 'var(--border-light)', 
                    bgcolor: 'rgba(0,0,0,0.01)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontWeight: 750, color: 'var(--text-primary)' }}>
                        {fam.name}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={fam.relation} 
                        sx={{ 
                          height: 18, 
                          fontSize: '0.65rem', 
                          fontWeight: 700, 
                          bgcolor: fam.relation === 'Spouse' ? 'rgba(236,72,153,0.1)' : 'rgba(99,102,241,0.1)',
                          color: fam.relation === 'Spouse' ? '#ec489a' : 'var(--color-primary)'
                        }} 
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                      {fam.dob && (
                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarIcon sx={{ fontSize: 12 }} /> {formatDOB(fam.dob)}
                        </Typography>
                      )}
                      {fam.phone && (
                        <Typography 
                          component="a" 
                          href={`tel:${fam.phone}`}
                          variant="caption" 
                          sx={{ color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: 0.5, textDecoration: 'none', fontWeight: 600 }}
                        >
                          <PhoneIcon sx={{ fontSize: 12 }} /> {fam.phone}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {fam.phone && (
                    <IconButton 
                      component="a"
                      href={`tel:${fam.phone}`}
                      size="small"
                      sx={{ bgcolor: 'rgba(99, 102, 241, 0.05)', color: 'var(--color-primary)', '&:hover': { bgcolor: 'rgba(99,102,241,0.1)' } }}
                    >
                      <PhoneIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </Paper>
              );
            })}
          </Box>
        ) : (
          <Typography sx={{ color: 'var(--text-tertiary)', fontStyle: 'italic', display: 'block', py: 1 }}>
            No other family members are registered in this group.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderColor: 'var(--border-light)', borderTop: '1px solid var(--border-light)' }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          sx={{ 
            bgcolor: 'var(--color-primary)', 
            color: '#fff',
            borderRadius: 2,
            px: 3,
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { bgcolor: 'var(--color-primary-dark)' }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MemberDetailsDialog;
