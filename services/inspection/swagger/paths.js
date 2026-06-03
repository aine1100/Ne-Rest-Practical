/**
 * @openapi
 * /inspections:
 *   get:
 *     tags: [Inspections]
 *     summary: List inspections (Inspector/Admin)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: inspectorId
 *         schema: { type: integer }
 *       - in: query
 *         name: extinguisherId
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated inspection list
 *   post:
 *     tags: [Inspections]
 *     summary: Schedule inspection
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [extinguisherId, inspectorId, inspectionDate, inspectionTime]
 *             properties:
 *               extinguisherId: { type: integer }
 *               inspectorId: { type: integer }
 *               inspectionDate: { type: string, format: date }
 *               inspectionTime: { type: string, example: '10:00' }
 *               remarks: { type: string }
 *     responses:
 *       201:
 *         description: Inspection scheduled
 *
 * /inspections/{id}:
 *   get:
 *     tags: [Inspections]
 *     summary: Get inspection by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Inspection details
 *   put:
 *     tags: [Inspections]
 *     summary: Update inspection
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inspectionDate: { type: string, format: date }
 *               inspectionTime: { type: string }
 *               status: { type: string, enum: [Scheduled, Completed, Failed, Cancelled, Overdue] }
 *               remarks: { type: string }
 *     responses:
 *       200:
 *         description: Inspection updated
 *   delete:
 *     tags: [Inspections]
 *     summary: Delete inspection
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Inspection deleted
 *
 * /maintenance:
 *   get:
 *     tags: [Maintenance]
 *     summary: List maintenance records
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: extinguisherId
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated maintenance list
 *   post:
 *     tags: [Maintenance]
 *     summary: Log maintenance activity
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [extinguisherId, inspectorId, maintenanceDate, actionTaken]
 *             properties:
 *               extinguisherId: { type: integer }
 *               inspectorId: { type: integer }
 *               maintenanceDate: { type: string, format: date }
 *               actionTaken: { type: string }
 *               issuesFound: { type: string }
 *               recommendations: { type: string }
 *     responses:
 *       201:
 *         description: Maintenance logged
 *
 * /maintenance/{id}:
 *   get:
 *     tags: [Maintenance]
 *     summary: Get maintenance record by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Maintenance details
 *
 * /maintenance/{id}/complete:
 *   patch:
 *     tags: [Maintenance]
 *     summary: Mark maintenance complete
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Maintenance completed
 */

export {};
