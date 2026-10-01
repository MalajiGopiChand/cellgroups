import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Button } from '@mui/material';
import { Download as DownloadIcon, Image as ImageIcon, TableChart as TableChartIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AnimatedButton from '../../components/ui/AnimatedButton';
import SplitText from '../../components/ui/SplitText';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

function AdminDownloadsPage({ onBack }) {
  const [members, setMembers] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const membersRef = useRef(null);
  const leadersRef = useRef(null);

  useEffect(() => {
    let unsubMembers, unsubLeaders;

    unsubMembers = onSnapshot(collection(db, 'students'), (snap) => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      if (unsubLeaders) setLoading(false);
    });

    unsubLeaders = onSnapshot(collection(db, 'cellleaders'), (snap) => {
      setLeaders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => {
      if (unsubMembers) unsubMembers();
      if (unsubLeaders) unsubLeaders();
    };
  }, []);

  const downloadExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const downloadPDF = async (ref, filename) => {
    if (!ref.current) return;
    try {
      const element = ref.current;
      // Make visible for capture
      element.style.display = 'block';
      const canvas = await html2canvas(element, { scale: 2 });
      element.style.display = 'none'; // Hide again

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      // For large tables, handle pagination
      let heightLeft = imgHeight * ratio;
      let position = imgY;

      pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight * ratio;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`${filename}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to export PDF.");
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.3s' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AnimatedButton onClick={onBack} sx={{ minWidth: 'auto', p: 1, bgcolor: 'var(--surface-white)', border: '1px solid var(--border-neutral)' }}>
          <ArrowBackIcon />
        </AnimatedButton>
        <SplitText text="Data Downloads" variant="h5" sx={{ fontWeight: 800, color: 'var(--primary-forest)' }} />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Members Download Card */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid var(--border-neutral)', bgcolor: 'var(--surface-white)' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Members Data</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Download details of all {members.length} registered members.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  startIcon={<TableChartIcon />}
                  onClick={() => downloadExcel(members.map(m => ({ Name: m.name, Phone: m.phone, Relation: m.relation, FamilyId: m.familyId })), 'Members_Details')}
                  sx={{ bgcolor: 'var(--primary-forest)' }}
                >
                  Excel
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<ImageIcon />}
                  onClick={() => downloadPDF(membersRef, 'Members_Details')}
                >
                  PDF/Image
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Leaders Download Card */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid var(--border-neutral)', bgcolor: 'var(--surface-white)' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Cell Leaders Data</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Download details of all {leaders.length} cell leaders.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  startIcon={<TableChartIcon />}
                  onClick={() => downloadExcel(leaders.map(l => ({ Name: l.name, Phone: l.phone, Place: l.place })), 'Leaders_Details')}
                  sx={{ bgcolor: 'var(--primary-forest)' }}
                >
                  Excel
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<ImageIcon />}
                  onClick={() => downloadPDF(leadersRef, 'Leaders_Details')}
                >
                  PDF/Image
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Hidden Divs for PDF generation */}
      <div style={{ display: 'none' }} ref={membersRef}>
        <div style={{ padding: '20px', background: '#fff' }}>
          <h2 style={{ color: '#059669', marginBottom: '20px' }}>Members List</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'sans-serif' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Name</th>
                <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Phone</th>
                <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Relation</th>
                <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Family ID</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{m.name || '-'}</td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{m.phone || '-'}</td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{m.relation || '-'}</td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{m.familyId || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'none' }} ref={leadersRef}>
        <div style={{ padding: '20px', background: '#fff' }}>
          <h2 style={{ color: '#059669', marginBottom: '20px' }}>Cell Leaders List</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'sans-serif' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Name</th>
                <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Phone</th>
                <th style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Place</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map(l => (
                <tr key={l.id}>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{l.name || '-'}</td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{l.phone || '-'}</td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{l.place || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Box>
  );
}

export default AdminDownloadsPage;
