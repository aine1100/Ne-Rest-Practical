import * as reportService from '../services/report.service.js';
import * as exportService from '../services/export.service.js';
import { generatePdfReport } from '../services/pdf.service.js';
import { generateCsvReport } from '../services/csv.service.js';
import { successResponse } from '@fems/shared';

export async function inventory(req, res) {
  const data = await reportService.getInventoryReport();
  return successResponse(res, data);
}

export async function inspections(req, res) {
  const data = await reportService.getInspectionReport();
  return successResponse(res, data);
}

export async function compliance(req, res) {
  const data = await reportService.getComplianceReport();
  return successResponse(res, data);
}

export async function maintenance(req, res) {
  const data = await reportService.getMaintenanceReport();
  return successResponse(res, data);
}

export async function exportPdf(req, res) {
  const data = await reportService.getFullReportData();
  const pdf = await generatePdfReport(data);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=fems-report.pdf');
  res.send(pdf);
}

export async function exportCsv(req, res) {
  const data = await reportService.getFullReportData();
  const csv = generateCsvReport(data);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=fems-report.csv');
  res.send(csv);
}

export async function exportExtinguishersCsv(req, res) {
  const rows = await exportService.getExtinguishersForExport(req.query, req.user);
  const csv = exportService.generateExtinguishersCsv(rows);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=fems-extinguishers.csv');
  res.send(csv);
}

export async function exportUsersCsv(req, res) {
  const rows = await exportService.getUsersForExport(req.query);
  const csv = exportService.generateUsersCsv(rows);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=fems-users.csv');
  res.send(csv);
}

export async function exportInspectionsCsv(req, res) {
  const rows = await exportService.getInspectionsForExport(req.query, req.user);
  const csv = exportService.generateInspectionsCsv(rows);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=fems-inspections.csv');
  res.send(csv);
}
