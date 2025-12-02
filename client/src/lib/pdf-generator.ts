/**
 * PDF Generation using jsPDF and html2canvas
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ReportData } from '@/pages/Home';

export async function generatePDF(data: ReportData) {
  const reportElement = document.getElementById('report-content');
  
  if (!reportElement) {
    console.error('Report content element not found');
    alert('Report content not found. Please ensure the report is displayed.');
    return;
  }

  try {
    // Show loading state with better styling
    const loadingMessage = document.createElement('div');
    loadingMessage.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-shopify-green"></div>
        <div style="font-weight: 500; color: #333;">Generating PDF...</div>
        <div style="font-size: 12px; color: #666;">This may take a few seconds</div>
      </div>
    `;
    loadingMessage.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 24px 32px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); z-index: 9999; border: 2px solid #95BF47;';
    document.body.appendChild(loadingMessage);

    // Convert HTML to canvas with better quality settings
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: reportElement.scrollWidth,
      windowHeight: reportElement.scrollHeight,
      allowTaint: false,
      removeContainer: false,
    });

    // Remove loading message
    document.body.removeChild(loadingMessage);

    const imgData = canvas.toDataURL('image/png');
    
    // Calculate PDF dimensions (Letter size: 8.5" x 11")
    const pdfWidth = 8.5;
    const pdfHeight = 11;
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Use standard letter size and handle multi-page content
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    const imgWidthInches = pdfWidth;
    const imgHeightInches = (imgHeight / imgWidth) * pdfWidth;
    
    // Add image, splitting across pages if needed
    let heightLeft = imgHeightInches;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidthInches, imgHeightInches);
    heightLeft -= pdfHeight;
    
    // Add additional pages if content is taller than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeightInches;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidthInches, imgHeightInches);
      heightLeft -= pdfHeight;
    }
    
    // Generate filename
    const filename = `bfcm-wrapped-${data.accountName.replace(/\s+/g, '-').toLowerCase()}-2025.pdf`;
    
    // Save PDF
    pdf.save(filename);
    
    console.log('✅ PDF generated successfully');
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Remove loading message if it still exists
    const existingLoading = document.querySelector('[style*="position: fixed"]');
    if (existingLoading) {
      document.body.removeChild(existingLoading as Node);
    }
    
    // Show user-friendly error message
    alert(`Failed to generate PDF: ${errorMessage}\n\nPlease ensure:\n- The report is fully loaded\n- Your browser allows popups\n- Try again in a few moments`);
  }
}

