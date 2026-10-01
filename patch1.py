import re

with open("src/pages/admin/AdminLeaderProfilesListPage.jsx", "r") as f:
    code = f.read()

# 1. Imports
if "import * as XLSX" not in code:
    code = code.replace(
        "import { Box, Typography, Grid, Card, CardContent, Avatar, CircularProgress, IconButton } from '@mui/material';",
        "import { Box, Typography, Grid, Card, CardContent, Avatar, CircularProgress, IconButton, Button } from '@mui/material';\nimport * as XLSX from 'xlsx';"
    )

if "Download as DownloadIcon" not in code:
    code = code.replace(
        "import { ArrowBack as ArrowBackIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';",
        "import { ArrowBack as ArrowBackIcon, CheckCircle as CheckCircleIcon, Download as DownloadIcon } from '@mui/icons-material';"
    )

# 2. Add handleExport function
export_fn = """  const handleExport = () => {
    if (leadersData.length === 0) return;
    const exportData = leadersData.map(l => ({
      Name: l.name || 'Unknown',
      Phone: l.phone || 'N/A',
      Place: l.place || l.cellId || 'N/A',
      Status: l.approved ? 'Approved' : 'Pending'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cell Leaders");
    XLSX.writeFile(wb, `CellLeaders_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (selectedLeader) {"""

code = code.replace("  if (selectedLeader) {", export_fn)

# 3. Add button in the UI
old_ui = """      <Box sx={{ animation: 'fadeIn 0.3s' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={onBack} sx={{ bgcolor: 'var(--bg-glass-strong)', border: '1px solid var(--border-neutral)' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--primary-forest)' }}>
            Cell Leader Profiles
          </Typography>
        </Box>"""

new_ui = """      <Box sx={{ animation: 'fadeIn 0.3s' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={onBack} sx={{ bgcolor: 'var(--bg-glass-strong)', border: '1px solid var(--border-neutral)' }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--primary-forest)' }}>
              Cell Leader Profiles
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />} 
            onClick={handleExport}
            sx={{ bgcolor: 'var(--primary-forest)', '&:hover': { bgcolor: '#059669' }, borderRadius: 1 }}
          >
            Export
          </Button>
        </Box>"""

code = code.replace(old_ui, new_ui)

with open("src/pages/admin/AdminLeaderProfilesListPage.jsx", "w") as f:
    f.write(code)
