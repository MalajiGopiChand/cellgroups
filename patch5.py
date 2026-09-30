import re

with open("src/pages/admin/AdminAttendancePage.jsx", "r") as f:
    code = f.read()

# Replace handleExportImage with handleExportPDF
old_handle = """  const handleExportImage = async () => {
    if (!listRef.current) return;
    try {
      const canvas = await html2canvas(listRef.current, { scale: 2, backgroundColor: '#f8fafc' });
      const link = document.createElement('a');
      link.download = `Attendance_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
      alert('Failed to export image');
    }
  };"""

new_handle = """  const handleExportPDF = async () => {
    if (!listRef.current) return;
    try {
      const canvas = await html2canvas(listRef.current, { scale: 2, backgroundColor: '#f8fafc' });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`Attendance_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF', err);
      alert('Failed to export PDF');
    }
  };"""

code = code.replace(old_handle, new_handle)

# Update import
code = code.replace(
    "import html2canvas from 'html2canvas';",
    "import html2canvas from 'html2canvas';\nimport jsPDF from 'jspdf';"
)

# Update button text and onClick
old_btn = """              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />} 
                onClick={handleExportImage}
                sx={{ color: 'var(--primary-forest)', borderColor: 'var(--primary-forest)', '&:hover': { bgcolor: 'rgba(16,185,129,0.1)', borderColor: 'var(--primary-forest)' }, borderRadius: 1 }}
              >
                Export Image
              </Button>"""

new_btn = """              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />} 
                onClick={handleExportPDF}
                sx={{ color: 'var(--primary-forest)', borderColor: 'var(--primary-forest)', '&:hover': { bgcolor: 'rgba(16,185,129,0.1)', borderColor: 'var(--primary-forest)' }, borderRadius: 1 }}
              >
                Export PDF
              </Button>"""

code = code.replace(old_btn, new_btn)

with open("src/pages/admin/AdminAttendancePage.jsx", "w") as f:
    f.write(code)
