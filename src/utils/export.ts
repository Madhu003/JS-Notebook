import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportToPDF(notebookTitle: string, cells: any[]): Promise<void> {
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
