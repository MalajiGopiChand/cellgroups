import re

with open("src/pages/admin/AdminLeaderProfilePage.jsx", "r") as f:
    code = f.read()

grouping_code = """
  // Group members by family
  const familyGroups = {};
  members.forEach(m => {
    const fid = m.familyId || `single_${m.id}`;
    if (!familyGroups[fid]) familyGroups[fid] = [];
    familyGroups[fid].push(m);
  });

  const families = Object.values(familyGroups).map(group => {
    const head = group.find(m => m.isHead) || group[0];
    return {
      head,
      members: group,
      familyId: head.familyId || `single_${head.id}`,
    };
  });
"""

code = code.replace("  return (\n    <Box sx={{ pb: 4, pt: { xs: 0, sm: 2 } }}>", grouping_code + "\n  return (\n    <Box sx={{ pb: 4, pt: { xs: 0, sm: 2 } }}>")

old_render = """                {members.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {members.map(m => {
                      const rec = weekGroupRecords.find(r => r.memberId === m.id || (r.name && m.name && r.name.toLowerCase() === m.name.toLowerCase()));
                      const status = rec ? rec.status : 'unrecorded';
                      
                      return (
                        <Paper 
                          key={m.id}
                          onClick={() => setSelectedMember(m)}
                          sx={{ 
                            p: 1.25, 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center', 
                            bgcolor: 'var(--bg-main)', 
                            borderRadius: 1, 
                            border: '1px solid var(--border-light)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'translateX(4px)',
                              borderColor: 'var(--primary-forest)',
                              bgcolor: 'var(--surface-white)'
                            },
                            '&:active': { bgcolor: 'var(--border-neutral)' }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(99,102,241,0.1)', color: 'var(--color-primary)' }}>
                              <PersonIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Box sx={{ minWidth: 0, pr: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-deep)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {m.name}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {status === 'present' && <Chip size="small" label="Present" sx={{ flexShrink: 0, height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981' }} />}
                          {status === 'absent' && <Chip size="small" label="Absent" sx={{ flexShrink: 0, height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444' }} />}
                          {status === 'out' && <Chip size="small" label="Out" sx={{ flexShrink: 0, height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b' }} />}
                          {status === 'unrecorded' && <Chip size="small" label="No Record" sx={{ flexShrink: 0, height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: 'var(--border-neutral)', color: 'var(--text-secondary)' }} />}
                        </Paper>
                      );
                    })}
                  </Box>
                ) : (
                  <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center', p: 3 }}>No members assigned.</Typography>
                )}"""

new_render = """                {families.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {families.map(family => (
                      <Box key={family.familyId}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', mb: 1, display: 'block', pl: 1 }}>
                          {family.head.name} Family
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {family.members.map(m => {
                            const rec = weekGroupRecords.find(r => r.memberId === m.id || (r.name && m.name && r.name.toLowerCase() === m.name.toLowerCase()));
                            const status = rec ? rec.status : 'unrecorded';
                            
                            return (
                              <Paper 
                                key={m.id}
                                onClick={() => setSelectedMember(m)}
                                sx={{ 
                                  p: 1.25, 
                                  display: 'flex', 
                                  justifyContent: 'space-between',
                                  alignItems: 'center', 
                                  bgcolor: 'var(--bg-main)', 
                                  borderRadius: 1, 
                                  border: '1px solid var(--border-light)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    transform: 'translateX(4px)',
                                    borderColor: 'var(--primary-forest)',
                                    bgcolor: 'var(--surface-white)'
                                  },
                                  '&:active': { bgcolor: 'var(--border-neutral)' }
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                                  <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(99,102,241,0.1)', color: 'var(--color-primary)' }}>
                                    <PersonIcon sx={{ fontSize: 16 }} />
                                  </Avatar>
                                  <Box sx={{ minWidth: 0, pr: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-deep)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {m.name}
                                    </Typography>
                                  </Box>
                                </Box>
                                
                                {status === 'present' && <Chip size="small" label="Present" sx={{ flexShrink: 0, height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981' }} />}
                                {status === 'absent' && <Chip size="small" label="Absent" sx={{ flexShrink: 0, height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444' }} />}
                                {status === 'out' && <Chip size="small" label="Out" sx={{ flexShrink: 0, height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b' }} />}
                                {status === 'unrecorded' && <Chip size="small" label="No Record" sx={{ flexShrink: 0, height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: 'var(--border-neutral)', color: 'var(--text-secondary)' }} />}
                              </Paper>
                            );
                          })}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center', p: 3 }}>No members assigned.</Typography>
                )}"""

code = code.replace(old_render, new_render)

with open("src/pages/admin/AdminLeaderProfilePage.jsx", "w") as f:
    f.write(code)
