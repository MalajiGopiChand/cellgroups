import re

with open("src/pages/admin/AdminHomePage.jsx", "r") as f:
    code = f.read()

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
      </Box>"""

code = code.replace(downloads_card, "")

with open("src/pages/admin/AdminHomePage.jsx", "w") as f:
    f.write(code)
