import re

with open("src/pages/admin/AdminLeaderProfilePage.jsx", "r") as f:
    code = f.read()

# 1. Imports
if "import * as XLSX" not in code:
    code = code.replace(
        "import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';",
        "import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';\nimport * as XLSX from 'xlsx';\nimport { Download as DownloadIcon } from '@mui/icons-material';"
    )
    if "Button" not in code.split("from '@mui/material'")[0]:
        code = code.replace("import { Box, Typography, Paper, Grid, Chip, Avatar, CircularProgress, Divider } from '@mui/material';", "import { Box, Typography, Paper, Grid, Chip, Avatar, CircularProgress, Divider, Button } from '@mui/material';")


export_code = """
  const handleExport = () => {
    if (members.length === 0) {
      alert("No members found for this leader.");
      return;
    }
    const exportData = members.map(m => ({
      'Family Group': m.familyId ? m.familyId : `Single_${m.id}`,
      Name: m.name || 'Unknown',
      Relation: m.relation || (m.isHead ? 'Head' : 'Member'),
      Phone: m.phone || 'N/A',
      Place: m.place || leader.place || 'N/A',
      'Leader Name': leader.name || 'Unknown'
    }));
    
    // Sort by Family Group
    exportData.sort((a, b) => a['Family Group'].localeCompare(b['Family Group']));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    const fileName = (leader.name || 'Leader').replace(/\\s+/g, '_') + '_Members_Export.xlsx';
    XLSX.writeFile(wb, fileName);
  };

"""

# Insert handleExport just before "  return (\n    <Box sx={{ display: 'flex', flexDirection: 'column'"
target1 = "  return (\n    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 }"
if export_code not in code:
    code = code.replace(target1, export_code + target1)

# Insert Button just after the `<SplitText />` line inside that box
target2 = "<SplitText text={`${leader.name}'s Profile`} variant=\"h5\" sx={{ fontWeight: 800, color: 'var(--primary-forest)' }} />\n        </Box>"
button_code = target2 + """
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />} 
          onClick={handleExport}
          sx={{ bgcolor: 'var(--primary-forest)', '&:hover': { bgcolor: '#059669' }, borderRadius: 1 }}
        >
          Export Members
        </Button>"""

if "Export Members" not in code:
    code = code.replace(target2, button_code)


with open("src/pages/admin/AdminLeaderProfilePage.jsx", "w") as f:
    f.write(code)
