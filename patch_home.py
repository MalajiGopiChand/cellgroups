import re

with open("src/pages/admin/AdminHomePage.jsx", "r") as f:
    code = f.read()

# 1. Update function signature
if "function AdminHomePage({ onNavigate })" not in code:
    code = code.replace("function AdminHomePage() {", "function AdminHomePage({ onNavigate }) {")

# 2. Add imports if needed
if "DownloadIcon" not in code:
    code = code.replace("from '@mui/icons-material';", ", Download as DownloadIcon } from '@mui/icons-material';")
if "Button" not in code.split("from '@mui/material'")[0]:
    code = code.replace("List, ListItem, ListItemText, ListItemIcon } from '@mui/material';", "List, ListItem, ListItemText, ListItemIcon, Button, Grid } from '@mui/material';")

# 3. Add the Downloads Card
downloads_card = """      {/* Quick Actions */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: 'var(--bg-glass-strong)', borderRadius: 2, border: '1px solid var(--border-neutral)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--text-deep)' }}>Data Downloads</Typography>
                <Typography variant="body2" color="text.secondary">Download full reports of Cell Leaders and Members (Excel/PDF).</Typography>
              </Box>
              <Button 
                variant="contained" 
                startIcon={<DownloadIcon />} 
                onClick={() => onNavigate && onNavigate(13)}
                sx={{ bgcolor: 'var(--primary-forest)', '&:hover': { bgcolor: '#059669' }, borderRadius: 1 }}
              >
                Go to Downloads
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Announcements Feed */}"""

if "{/* Quick Actions */}" not in code:
    code = code.replace("{/* Announcements Feed */}", downloads_card)

with open("src/pages/admin/AdminHomePage.jsx", "w") as f:
    f.write(code)
