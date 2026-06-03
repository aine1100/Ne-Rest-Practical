/**
 * @openapi
 * /extinguishers:
 *   get:
 *     tags: [Extinguishers]
 *     summary: List fire extinguishers
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
 *         name: type
 *         schema: { type: string, enum: [Water, CO2, Foam, 'Dry Chemical'] }
 *       - in: query
 *         name: building
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated extinguisher list
 *   post:
 *     tags: [Extinguishers]
 *     summary: Register new extinguisher (Admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serialNumber, type, size, building, floor, room, manufactureDate, installationDate, expiryDate]
 *             properties:
 *               serialNumber: { type: string }
 *               type: { type: string, enum: [Water, CO2, Foam, 'Dry Chemical'] }
 *               size: { type: string, example: 5kg }
 *               building: { type: string }
 *               floor: { type: string }
 *               room: { type: string }
 *               manufactureDate: { type: string, format: date, example: '2020-01-15' }
 *               installationDate: { type: string, format: date }
 *               expiryDate: { type: string, format: date }
 *               assignedUserId: { type: integer, nullable: true }
 *     responses:
 *       201:
 *         description: Extinguisher created
 *
 * /extinguishers/search:
 *   get:
 *     tags: [Extinguishers]
 *     summary: Search extinguishers
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Search results
 *
 * /extinguishers/{id}:
 *   get:
 *     tags: [Extinguishers]
 *     summary: Get extinguisher by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Extinguisher details
 *   put:
 *     tags: [Extinguishers]
 *     summary: Update extinguisher (Admin)
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
 *     responses:
 *       200:
 *         description: Extinguisher updated
 *   delete:
 *     tags: [Extinguishers]
 *     summary: Delete extinguisher (Admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Extinguisher deleted
 *
 * /extinguishers/{id}/status:
 *   patch:
 *     tags: [Extinguishers]
 *     summary: Update extinguisher status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Active, 'Inspection Due', 'Under Maintenance', Expired, Damaged, Retired]
 *     responses:
 *       200:
 *         description: Status updated
 */

export {};
