import html2canvas from 'html2canvas';

export const downloadAsImage = async (elementId, filename = 'download.png') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    alert('Failed to find content to download.');
    return;
  }

  try {
    // Add a temporary class or style if needed for downloading (e.g., to ensure white background)
    const originalBackground = element.style.background;
    if (!originalBackground || originalBackground === 'transparent') {
      element.style.background = '#F8FAFC'; // Match the app background
    }

    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#F8FAFC'
    });

    // Restore original background
    element.style.background = originalBackground;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error generating image:', error);
    alert('Failed to generate image.');
  }
};
