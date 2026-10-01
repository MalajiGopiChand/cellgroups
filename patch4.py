import re

with open("src/pages/admin/AdminFamilyProfilePage.jsx", "r") as f:
    code = f.read()

# Add DeleteIcon import if needed
if "DeleteOutline as DeleteIcon" not in code:
    code = code.replace(
        "import { Box, Typography, Paper, IconButton, Grid, Avatar, Divider, CircularProgress, Chip } from '@mui/material';",
        "import { Box, Typography, Paper, IconButton, Grid, Avatar, Divider, CircularProgress, Chip } from '@mui/material';\nimport { DeleteOutline as DeleteIcon } from '@mui/icons-material';"
    )

old_item = """                <Box 
                  key={m.id} 
                  onClick={() => setSelectedMember(m)}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    p: 1.5, 
                    bgcolor: 'rgba(255,255,255,0.6)', 
                    borderRadius: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid transparent',
                    '&:hover': {
                      borderColor: 'var(--primary-forest)',
                      bgcolor: 'rgba(255,255,255,0.9)'
                    }
                  }}
                >
                  <Typography sx={{ fontWeight: 700, color: 'var(--text-deep)' }}>{m.name}</Typography>
                  {m.isHead && <Chip label="HEAD" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(16,185,129,0.1)', color: 'var(--primary-forest)', fontWeight: 800 }} />}
                </Box>"""

new_item = """                <Box 
                  key={m.id} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 1.5, 
                    bgcolor: 'rgba(255,255,255,0.6)', 
                    borderRadius: 1,
                    transition: 'all 0.2s ease',
                    border: '1px solid transparent',
                    '&:hover': {
                      borderColor: 'var(--primary-forest)',
                      bgcolor: 'rgba(255,255,255,0.9)'
                    }
                  }}
                >
                  <Box onClick={() => setSelectedMember(m)} sx={{ flexGrow: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: 'var(--text-deep)' }}>{m.name}</Typography>
                    {m.isHead && <Chip label="HEAD" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(16,185,129,0.1)', color: 'var(--primary-forest)', fontWeight: 800 }} />}
                  </Box>
                  {onDeleteMember && (
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMember(m.id, m.name);
                      }}
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>"""

code = code.replace(old_item, new_item)

with open("src/pages/admin/AdminFamilyProfilePage.jsx", "w") as f:
    f.write(code)
