/**
 * PDF Generation using jsPDF and html2canvas
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ReportData } from '@/pages/Home';

async function createCoverPage(data: ReportData): Promise<HTMLCanvasElement> {
  // Create a temporary container for the cover page
  const coverContainer = document.createElement('div');
  coverContainer.style.cssText = 'position: absolute; left: -9999px; width: 850px; height: 1100px; background: linear-gradient(135deg, #0f172a, #1e3a8a, #581c87);';
  
  coverContainer.innerHTML = `
    <div style="width: 100%; height: 100%; position: relative; display: flex; flex-direction: column; align-items: center; justify-center; padding: 60px; box-sizing: border-box;">
      <!-- Globe Background -->
      <div style="position: absolute; inset: 0; background-image: url(/assets/globe-connections.jpg); background-size: cover; background-position: center; opacity: 0.25; filter: brightness(0.8);"></div>
      
      <!-- Content -->
      <div style="position: relative; z-index: 10; text-align: center;">
        <div style="font-size: 72px; margin-bottom: 24px;">🎁</div>
        <h1 style="font-size: 56px; font-weight: bold; background: linear-gradient(to right, #22d3ee, #ec4899, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
          Your BFCM 2025
        </h1>
        <h2 style="font-size: 48px; font-weight: bold; background: linear-gradient(to right, #22d3ee, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 48px;">
          Wrapped
        </h2>
        <div style="font-size: 32px; font-weight: 300; color: white; margin-bottom: 16px; text-shadow: 0 2px 8px rgba(0,0,0,0.5);">
          ${data.accountName}
        </div>
        <div style="font-size: 20px; color: rgba(255,255,255,0.8); text-shadow: 0 2px 6px rgba(0,0,0,0.5);">
          ${new Date(data.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(data.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
      
      <!-- Shopify Logo -->
      <div style="position: absolute; bottom: 60px; width: 100%; text-align: center;">
        <div style="font-size: 16px; color: rgba(255,255,255,0.6); font-weight: 500;">Powered by Shopify</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(coverContainer);
  
  const canvas = await html2canvas(coverContainer, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: null,
    allowTaint: false,
  });
  
  document.body.removeChild(coverContainer);
  return canvas;
}

export async function generatePDF(data: ReportData) {
  const reportElement = document.getElementById('report-content');
  
  if (!reportElement) {
    console.error('Report content element not found');
    alert('Report content not found. Please ensure the report is displayed.');
    return;
  }

  try {
    // Show loading state with better styling and globe icon
    const loadingMessage = document.createElement('div');
    loadingMessage.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
        <div style="font-size: 48px; animation: spin 4s linear infinite;">🌍</div>
        <div style="font-weight: 600; color: white; font-size: 18px;">Generating Your Wrapped PDF...</div>
        <div style="font-size: 14px; color: rgba(255,255,255,0.8);">Creating cover page and compiling report</div>
      </div>
    `;
    loadingMessage.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: linear-gradient(135deg, #1e3a8a, #581c87); padding: 40px 48px; border-radius: 16px; box-shadow: 0 12px 32px rgba(0,0,0,0.3); z-index: 9999; border: 2px solid rgba(34,211,238,0.5);';
    document.body.appendChild(loadingMessage);

    // Create cover page
    const coverCanvas = await createCoverPage(data);
    const coverImgData = coverCanvas.toDataURL('image/png');

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
    
    // Use standard letter size and handle multi-page content
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    // Add cover page first
    pdf.addImage(coverImgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Add new page for report content
    pdf.addPage();
    
    // Add report content
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
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

