import PDFDocument from 'pdfkit';

export function generatePdfReport(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).fillColor('#FF383C').text('FEMS Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).fillColor('#6B7280').text(`Generated: ${data.generatedAt}`, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(14).fillColor('#1A1D21').text('Inventory Summary');
    doc.fontSize(10).fillColor('#333');
    doc.text(`Total Extinguishers: ${data.inventory.total}`);
    doc.text(`Active: ${data.inventory.active}`);
    doc.text(`Expired: ${data.inventory.expired}`);
    doc.text(`Under Maintenance: ${data.inventory.underMaintenance}`);
    doc.moveDown();

    doc.fontSize(14).text('Inspection Summary');
    doc.fontSize(10);
    doc.text(`Total Inspections: ${data.inspections.total}`);
    doc.text(`Scheduled: ${data.inspections.scheduled}`);
    doc.text(`Completed: ${data.inspections.completed}`);
    doc.text(`Overdue: ${data.inspections.overdue}`);
    doc.moveDown();

    doc.fontSize(14).text('Compliance');
    doc.fontSize(10);
    doc.text(`Compliance Rate: ${data.compliance.compliancePercent}%`);
    doc.text(`Expired: ${data.compliance.expiredExtinguishers}`);
    doc.text(`Due Inspections: ${data.compliance.dueInspections}`);

    doc.end();
  });
}
