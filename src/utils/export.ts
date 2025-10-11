import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportToPDF(notebookTitle: string, cells: any[]): Promise<void> {
  try {
    // Find the notebook container element
    const notebookContainer = document.querySelector('.max-w-5xl.mx-auto.p-6') as HTMLElement;
    
    if (!notebookContainer) {
      console.error('Notebook container not found');
      // Fallback to text-based export
      await exportToPDFText(notebookTitle, cells);
      return;
    }

    // Create a temporary container for better PDF layout
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      position: fixed;
      top: -10000px;
      left: -10000px;
      width: 800px;
      background: white;
      padding: 40px;
      font-family: system-ui, -apple-system, sans-serif;
      z-index: -1;
      page-break-inside: avoid;
      min-height: 200px;
    `;

    // Clone the notebook content
    const clonedContent = notebookContainer.cloneNode(true) as HTMLElement;
    
    // Clean up the cloned content for PDF
    cleanContentForPDF(clonedContent);
    
    // Add title
    const titleElement = document.createElement('h1');
    titleElement.textContent = notebookTitle;
    titleElement.style.cssText = `
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 30px;
      color: #1f2937;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
      page-break-after: avoid;
    `;
    
    tempContainer.appendChild(titleElement);
    tempContainer.appendChild(clonedContent);
    document.body.appendChild(tempContainer);

    // Capture the entire content as canvas first
    const canvas = await html2canvas(tempContainer, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: tempContainer.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 20; // Top margin in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - margin);

    // Add additional pages if needed (only if there's significant content left)
    while (heightLeft > 10) { // Only add page if there's more than 10mm of content
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - margin);
    }

    // Clean up temporary container
    document.body.removeChild(tempContainer);

    // Save the PDF
    pdf.save(`${notebookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
    
  } catch (error) {
    console.error('Visual PDF export failed, falling back to text export:', error);
    // Fallback to text-based export
    await exportToPDFText(notebookTitle, cells);
  }
}

function cleanContentForPDF(element: HTMLElement): void {
  // Remove interactive elements that shouldn't be in PDF
  const elementsToRemove = element.querySelectorAll(`
    button, 
    .animate-spin, 
    [data-rbd-drag-handle-draggable-id],
    select,
    .flex.items-center.gap-2.p-2,
    .text-xs,
    .px-3.py-1,
    .px-4.py-2
  `);
  elementsToRemove.forEach(el => el.remove());

  // Remove language selector dropdowns specifically
  const languageSelectors = element.querySelectorAll('select[class*="text-sm"], select[class*="border"]');
  languageSelectors.forEach(selector => {
    const parent = selector.parentElement;
    if (parent && parent.classList.contains('flex')) {
      parent.remove();
    } else {
      selector.remove();
    }
  });

  // Update styles for better PDF rendering
  const cells = element.querySelectorAll('[class*="mb-4"]');
  cells.forEach(cell => {
    const cellElement = cell as HTMLElement;
    
    // Remove hover effects and transitions
    cellElement.style.transition = 'none';
    cellElement.style.transform = 'none';
    
    // Ensure proper spacing and page break handling
    cellElement.style.marginBottom = '20px';
    cellElement.style.border = '1px solid #e5e7eb';
    cellElement.style.borderRadius = '8px';
    cellElement.style.overflow = 'visible';
    cellElement.style.pageBreakInside = 'avoid';
    cellElement.style.breakInside = 'avoid';
    
    // Clean up cell headers - remove toolbars and keep only essential info
    const cellHeaders = cellElement.querySelectorAll('[class*="px-4"][class*="py-3"]');
    cellHeaders.forEach(header => {
      const headerElement = header as HTMLElement;
      // Keep only the cell type info, remove everything else
      const typeInfo = headerElement.querySelector('[class*="text-sm"][class*="font-medium"]');
      if (typeInfo) {
        headerElement.innerHTML = '';
        headerElement.appendChild(typeInfo);
        headerElement.style.padding = '8px 16px';
        headerElement.style.backgroundColor = '#f8f9fa';
        headerElement.style.borderBottom = '1px solid #e9ecef';
      }
    });

    // Remove cell toolbars completely
    const toolbars = cellElement.querySelectorAll('[class*="bg-gray-700"], [class*="bg-gray-100"]');
    toolbars.forEach(toolbar => {
      if (toolbar.querySelector('button')) {
        toolbar.remove();
      }
    });
    
    // Style code blocks
    const codeBlocks = cellElement.querySelectorAll('pre, code');
    codeBlocks.forEach(code => {
      const codeElement = code as HTMLElement;
      codeElement.style.backgroundColor = '#f8f9fa';
      codeElement.style.padding = '12px';
      codeElement.style.borderRadius = '4px';
      codeElement.style.fontFamily = 'Monaco, Consolas, monospace';
      codeElement.style.fontSize = '11px';
      codeElement.style.whiteSpace = 'pre-wrap';
      codeElement.style.border = '1px solid #e9ecef';
      codeElement.style.lineHeight = '1.4';
      codeElement.style.pageBreakInside = 'avoid';
    });

    // Style Monaco editor containers
    const editorContainers = cellElement.querySelectorAll('[class*="flex"][class*="flex-col"][class*="h-"]');
    editorContainers.forEach(container => {
      const containerElement = container as HTMLElement;
      containerElement.style.height = 'auto';
      containerElement.style.minHeight = '120px';
      containerElement.style.border = '1px solid #e9ecef';
      containerElement.style.borderRadius = '4px';
      containerElement.style.backgroundColor = '#f8f9fa';
      containerElement.style.padding = '16px';
    });

    // Ensure cell content has minimum height
    const cellContent = cellElement.querySelector('[class*="p-4"]');
    if (cellContent) {
      const contentElement = cellContent as HTMLElement;
      contentElement.style.minHeight = '100px';
      contentElement.style.padding = '16px';
    }

    // Style output sections
    const outputSections = cellElement.querySelectorAll('[class*="bg-gray-800"], [class*="bg-red-50"], [class*="bg-red-900"]');
    outputSections.forEach(output => {
      const outputElement = output as HTMLElement;
      outputElement.style.backgroundColor = '#f8f9fa';
      outputElement.style.color = '#212529';
      outputElement.style.border = '1px solid #e9ecef';
      outputElement.style.borderRadius = '4px';
      outputElement.style.padding = '12px';
      outputElement.style.fontFamily = 'Monaco, Consolas, monospace';
      outputElement.style.fontSize = '11px';
      outputElement.style.lineHeight = '1.4';
      outputElement.style.pageBreakInside = 'avoid';
    });

    // Style markdown preview sections
    const markdownPreviews = cellElement.querySelectorAll('[class*="markdown-preview"]');
    markdownPreviews.forEach(preview => {
      const previewElement = preview as HTMLElement;
      previewElement.style.backgroundColor = 'white';
      previewElement.style.color = '#212529';
      previewElement.style.padding = '16px';
      previewElement.style.border = '1px solid #e9ecef';
      previewElement.style.borderRadius = '4px';
      previewElement.style.fontSize = '14px';
      previewElement.style.lineHeight = '1.6';
    });
  });
}

// Fallback text-based PDF export
async function exportToPDFText(notebookTitle: string, cells: any[]): Promise<void> {
  const pdf = new jsPDF();
  const pageHeight = pdf.internal.pageSize.height;
  let yPosition = 20;
  
  // Add title
  pdf.setFontSize(20);
  pdf.text(notebookTitle, 20, yPosition);
  yPosition += 20;
  
  // Add cells content
  cells.forEach((cell, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }
    
    // Cell header
    pdf.setFontSize(12);
    pdf.text(`Cell ${index + 1} (${cell.type})`, 20, yPosition);
    yPosition += 10;
    
    // Cell content
    pdf.setFontSize(10);
    const cellContent = cell.content || '';
    const lines = pdf.splitTextToSize(cellContent, 170);
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, 20, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;
  });
  
  // Save the PDF
  pdf.save(`${notebookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
}

export async function exportToGitHubGist(notebookTitle: string, cells: any[]): Promise<string> {
  // Create a markdown formatted content
  let content = `# ${notebookTitle}\n\n`;
  
  cells.forEach((cell, index) => {
    if (cell.type === 'code') {
      content += `## Code Cell ${index + 1} (${cell.language})\n\n`;
      content += '```' + cell.language + '\n';
      content += cell.content || '';
      content += '\n```\n\n';
      
      if (cell.output) {
        content += '**Output:**\n```\n';
        content += cell.output;
        content += '\n```\n\n';
      }
      
      if (cell.error) {
        content += '**Error:**\n```\n';
        content += cell.error;
        content += '\n```\n\n';
      }
    } else {
      content += `## Markdown Cell ${index + 1}\n\n`;
      content += cell.content || '';
      content += '\n\n';
    }
  });
  
  return content;
}

export function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text).then(() => {
    // Could show a toast notification here
    console.log('Content copied to clipboard');
  });
}
