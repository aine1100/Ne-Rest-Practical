/**
 * @openapi
 * /api/auth/setup-admin:
 *   post:
 *     tags: [Auth]
 *     summary: Create the first admin account (one-time bootstrap)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201: { description: Admin created with tokens }
 *       403: { description: Admin already exists }
 *
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and revoke refresh token
 *     responses:
 *       200: { description: Logged out }
 *
 * /api/auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Token refreshed }
 *
 * /api/auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP
 *     security: []
 *     responses:
 *       200: { description: OTP verified }
 *
 * /api/auth/resend-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Resend OTP
 *     security: []
 *     responses:
 *       200: { description: OTP resent }
 *
 * /api/auth/set-password:
 *   post:
 *     tags: [Auth]
 *     summary: Set password (invited users)
 *     security: []
 *     responses:
 *       200: { description: Password set }
 *
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset OTP
 *     security: []
 *     responses:
 *       200: { description: OTP sent }
 *
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password with OTP
 *     security: []
 *     responses:
 *       200: { description: Password reset }
 *
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get own profile
 *     responses:
 *       200: { description: Profile data }
 *   put:
 *     tags: [Users]
 *     summary: Update own profile
 *     responses:
 *       200: { description: Profile updated }
 *
 * /api/users/change-password:
 *   put:
 *     tags: [Users]
 *     summary: Change own password
 *     responses:
 *       200: { description: Password changed }
 *
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List users (Admin)
 *     responses:
 *       200: { description: User list }
 *   post:
 *     tags: [Users]
 *     summary: Invite user (Admin)
 *     responses:
 *       201: { description: User invited }
 *
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user (Admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: User details }
 *   put:
 *     tags: [Users]
 *     summary: Update user (Admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: User updated }
 *   delete:
 *     tags: [Users]
 *     summary: Deactivate user (Admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: User deactivated }
 *
 * /api/extinguishers:
 *   get:
 *     tags: [Extinguishers]
 *     summary: List extinguishers
 *     responses:
 *       200: { description: Extinguisher list }
 *   post:
 *     tags: [Extinguishers]
 *     summary: Create extinguisher (Admin)
 *     responses:
 *       201: { description: Created }
 *
 * /api/extinguishers/search:
 *   get:
 *     tags: [Extinguishers]
 *     summary: Search extinguishers
 *     responses:
 *       200: { description: Search results }
 *
 * /api/extinguishers/{id}:
 *   get:
 *     tags: [Extinguishers]
 *     summary: Get extinguisher
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Extinguisher details }
 *   put:
 *     tags: [Extinguishers]
 *     summary: Update extinguisher (Admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Extinguishers]
 *     summary: Delete extinguisher (Admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 *
 * /api/extinguishers/{id}/status:
 *   patch:
 *     tags: [Extinguishers]
 *     summary: Update extinguisher status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Status updated }
 *
 * /api/inspections:
 *   get:
 *     tags: [Inspections]
 *     summary: List inspections
 *     responses:
 *       200: { description: Inspection list }
 *   post:
 *     tags: [Inspections]
 *     summary: Schedule inspection
 *     responses:
 *       201: { description: Scheduled }
 *
 * /api/inspections/{id}:
 *   get:
 *     tags: [Inspections]
 *     summary: Get inspection
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Inspection details }
 *   put:
 *     tags: [Inspections]
 *     summary: Update inspection
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Inspections]
 *     summary: Delete inspection
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 *
 * /api/maintenance:
 *   get:
 *     tags: [Maintenance]
 *     summary: List maintenance records
 *     responses:
 *       200: { description: Maintenance list }
 *   post:
 *     tags: [Maintenance]
 *     summary: Log maintenance
 *     responses:
 *       201: { description: Logged }
 *
 * /api/maintenance/{id}:
 *   get:
 *     tags: [Maintenance]
 *     summary: Get maintenance record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Details }
 *
 * /api/maintenance/{id}/complete:
 *   patch:
 *     tags: [Maintenance]
 *     summary: Complete maintenance
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Completed }
 *
 * /api/reports/inventory:
 *   get:
 *     tags: [Reports]
 *     summary: Inventory report (Admin)
 *     responses:
 *       200: { description: Inventory summary }
 *
 * /api/reports/inspections:
 *   get:
 *     tags: [Reports]
 *     summary: Inspection report (Admin)
 *     responses:
 *       200: { description: Inspection summary }
 *
 * /api/reports/compliance:
 *   get:
 *     tags: [Reports]
 *     summary: Compliance report (Admin)
 *     responses:
 *       200: { description: Compliance data }
 *
 * /api/reports/maintenance:
 *   get:
 *     tags: [Reports]
 *     summary: Maintenance report (Admin)
 *     responses:
 *       200: { description: Maintenance trends }
 *
 * /api/reports/export/pdf:
 *   get:
 *     tags: [Reports]
 *     summary: Export PDF (Admin)
 *     responses:
 *       200:
 *         description: PDF download
 *         content:
 *           application/pdf:
 *             schema: { type: string, format: binary }
 *
 * /api/reports/export/csv:
 *   get:
 *     tags: [Reports]
 *     summary: Export CSV (Admin)
 *     responses:
 *       200:
 *         description: CSV download
 *         content:
 *           text/csv:
 *             schema: { type: string }
 *
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List notifications
 *     responses:
 *       200: { description: Notification list }
 *
 * /api/notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Unread count
 *     responses:
 *       200: { description: Count }
 *
 * /api/notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all read
 *     responses:
 *       200: { description: All read }
 *
 * /api/notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark one read
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Marked read }
 */

export {};
