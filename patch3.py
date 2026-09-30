import re

with open("src/pages/admin/AdminAttendancePage.jsx", "r") as f:
    code = f.read()

new_logic = """                      {totalCount > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {(() => {
                            // Group by family
                            const families = {};
                            rec.attendance.forEach(a => {
                              const fid = a.familyId || `single_${a.id}`;
                              if (!families[fid]) families[fid] = [];
                              families[fid].push(a);
                            });
                            
                            return Object.values(families).map((fam, fIdx) => {
                              const head = fam.find(m => m.isHead) || fam[0];
                              return (
                                <Box key={fIdx} sx={{ mb: 1 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', mb: 0.5, display: 'block', pl: 1 }}>
                                    {head.name} Family
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {fam.map((a, j) => (
                                      <Box key={j} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderRadius: 1, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.04)' } }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                                          {a.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Chip 
                                            size="small" 
                                            label={a.status} 
                                            sx={{ 
                                              height: 22, 
                                              fontSize: '0.65rem', 
                                              fontWeight: 700, 
                                              textTransform: 'uppercase',
                                              bgcolor: a.status === 'present' ? 'rgba(16, 185, 129, 0.1)' : (a.status === 'out' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
                                              color: a.status === 'present' ? 'var(--color-success)' : (a.status === 'out' ? '#f59e0b' : 'var(--color-error)')
                                            }} 
                                          />
                                          <IconButton
                                            size="small"
                                            onClick={() => handleToggleStatus(rec.id, rec.attendance, a)}
                                            sx={{ color: 'var(--color-primary)', bgcolor: 'rgba(99,102,241,0.05)', '&:hover': { bgcolor: 'rgba(99,102,241,0.1)' } }}
                                            title="Toggle Status"
                                          >
                                            <EditIcon sx={{ fontSize: 16 }} />
                                          </IconButton>
                                        </Box>
                                      </Box>
                                    ))}
                                  </Box>
                                </Box>
                              );
                            });
                          })()}
                        </Box>
                      ) : ("""

pattern = re.compile(r"\{totalCount > 0 \? \(\s*<Box sx=\{\{ display: 'flex', flexDirection: 'column', gap: 1 \}\}>.*?\) : \(", re.DOTALL)
code = pattern.sub(new_logic, code)

with open("src/pages/admin/AdminAttendancePage.jsx", "w") as f:
    f.write(code)
