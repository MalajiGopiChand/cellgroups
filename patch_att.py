import re

with open("src/pages/admin/AdminAttendancePage.jsx", "r") as f:
    code = f.read()

code = code.replace(
    "import * as XLSX from 'xlsx';",
    "import * as XLSX from 'xlsx';\nimport html2canvas from 'html2canvas';\nimport { useRef } from 'react';"
)

code = code.replace(
    "const handleExport = () => {",
    "const listRef = useRef(null);\n  const handleExportImage = async () => {\n    if (!listRef.current) return;\n    try {\n      const canvas = await html2canvas(listRef.current, { scale: 2, backgroundColor: '#f8fafc' });\n      const link = document.createElement('a');\n      link.download = `Attendance_${new Date().toISOString().split('T')[0]}.png`;\n      link.href = canvas.toDataURL('image/png');\n      link.click();\n    } catch (err) {\n      console.error('Failed to export image', err);\n      alert('Failed to export image');\n    }\n  };\n\n  const handleExport = () => {"
)

old_buttons = """            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />} 
              onClick={handleExport}
              sx={{ bgcolor: 'var(--primary-forest)', '&:hover': { bgcolor: '#059669' }, borderRadius: 1 }}
            >
              Export Excel
            </Button>"""

new_buttons = """            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />} 
                onClick={handleExportImage}
                sx={{ color: 'var(--primary-forest)', borderColor: 'var(--primary-forest)', '&:hover': { bgcolor: 'rgba(16,185,129,0.1)', borderColor: 'var(--primary-forest)' }, borderRadius: 1 }}
              >
                Export Image
              </Button>
              <Button 
                variant="contained" 
                startIcon={<DownloadIcon />} 
                onClick={handleExport}
                sx={{ bgcolor: 'var(--primary-forest)', '&:hover': { bgcolor: '#059669' }, borderRadius: 1 }}
              >
                Export Excel
              </Button>
            </Box>"""

code = code.replace(old_buttons, new_buttons)

code = code.replace(
    "<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>",
    "<Box ref={listRef} sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, bgcolor: 'transparent' }}>"
)

with open("src/pages/admin/AdminAttendancePage.jsx", "w") as f:
    f.write(code)
