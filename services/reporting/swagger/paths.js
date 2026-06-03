/**
 * @openapi
 * /reports/inventory:
 *   get:
 *     tags: [Reports]
 *     summary: Inventory summary report (Admin)
 *     responses:
 *       200:
 *         description: Total, active, expired, maintenance counts
 *
 * /reports/inspections:
 *   get:
 *     tags: [Reports]
 *     summary: Inspection summary report (Admin)
 *     responses:
 *       200:
 *         description: Pending, completed, overdue counts
 *
 * /reports/compliance:
 *   get:
 *     tags: [Reports]
 *     summary: Compliance report (Admin)
 *     responses:
 *       200:
 *         description: Compliance percentage and due items
 *
 * /reports/maintenance:
 *   get:
 *     tags: [Reports]
 *     summary: Maintenance trends report (Admin)
 *     responses:
 *       200:
 *         description: Maintenance frequency and recent activity
 *
 * /reports/export/pdf:
 *   get:
 *     tags: [Reports]
 *     summary: Export full report as PDF (Admin)
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *
 * /reports/export/csv:
 *   get:
 *     tags: [Reports]
 *     summary: Export full report as CSV (Admin)
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */

export {};
