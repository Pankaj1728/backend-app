import express from 'express';
import { addStaff, addUser, getUsers, editStaff, editUser, getStaffById, getUserById, deleteStaff, deleteUser, getRecentlyJoinedStaff, getUpcomingBirthdays } from '../controllers/userController';
import { authenticate, authorize } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /api/users/staff:
 *   post:
 *     summary: Add a new staff member
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               profilePic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Staff added successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.post('/staff', authorize('admin'), upload.single('profilePic'), addStaff);

/**
 * @swagger
 * /api/users/user:
 *   post:
 *     summary: Add a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               mobile:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               assignedStaff:
 *                 type: string
 *     responses:
 *       201:
 *         description: User added successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.post('/user', authorize('admin'), addUser);

/**
 * @swagger
 * /api/users/users:
 *   get:
 *     summary: Get users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Forbidden
 */
router.get('/users', authorize('admin', 'staff'), getUsers);

router.get('/staff/:id', authorize('admin', 'staff'), getStaffById);
router.get('/user/:id', authorize('admin', 'staff'), getUserById);
router.put('/staff/:id', authorize('admin', 'staff'), upload.single('profilePic'), editStaff);
router.put('/user/:id', authorize('admin'), editUser);
router.delete('/staff/:id', authorize('admin'), deleteStaff);
router.delete('/user/:id', authorize('admin'), deleteUser);

// Dashboard endpoints
router.get("/recently-joined", authorize("admin", "staff"), getRecentlyJoinedStaff);
router.get("/upcoming-birthdays", authorize("admin", "staff"), getUpcomingBirthdays);

export default router;