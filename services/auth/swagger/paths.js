/**
 * @openapi
 * /auth/setup-admin:
 *   post:
 *     tags: [Auth]
 *     summary: Create the first admin account (one-time bootstrap)
 *     description: Only works when no admin exists yet. Returns tokens so you can use the API immediately.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string, example: System }
 *               lastName: { type: string, example: Admin }
 *               email: { type: string, format: email, example: admin@fems.local }
 *               password: { type: string, minLength: 8, example: Admin@123456 }
 *     responses:
 *       201:
 *         description: Admin created with access and refresh tokens
 *       403:
 *         description: Admin already exists
 *       409:
 *         description: Email already registered
 *
 * /auth/login:
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
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and revoke refresh token
 *     responses:
 *       200:
 *         description: Logged out
 *
 * /auth/refresh-token:
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
 *       200:
 *         description: Token refreshed
 *
 * /auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP and receive temp token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string, minLength: 6, maxLength: 6 }
 *     responses:
 *       200:
 *         description: OTP verified
 *
 * /auth/resend-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Resend OTP (max 3 per session)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: OTP resent
 *
 * /auth/set-password:
 *   post:
 *     tags: [Auth]
 *     summary: Set password using temp token (invited users)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tempToken, password]
 *             properties:
 *               tempToken: { type: string }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password set
 *
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset OTP
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: OTP sent if email exists
 *
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using OTP
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, password]
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password reset
 *
 * /users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get own profile
 *     responses:
 *       200:
 *         description: User profile
 *   put:
 *     tags: [Users]
 *     summary: Update own profile
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 *
 * /users/change-password:
 *   put:
 *     tags: [Users]
 *     summary: Change own password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password changed
 *
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List users (Admin)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [admin, inspector, user] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, active, inactive, suspended] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated user list
 *   post:
 *     tags: [Users]
 *     summary: Invite new user (Admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, role]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               role: { type: string, enum: [admin, inspector, user] }
 *     responses:
 *       201:
 *         description: User invited, OTP sent
 *
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID (Admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User details
 *   put:
 *     tags: [Users]
 *     summary: Update user (Admin)
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
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               role: { type: string, enum: [admin, inspector, user] }
 *               status: { type: string, enum: [pending, active, inactive, suspended] }
 *     responses:
 *       200:
 *         description: User updated
 *   delete:
 *     tags: [Users]
 *     summary: Deactivate user (Admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User deactivated
 */

export {};
