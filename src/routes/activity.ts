import express from 'express';
import { getRecentActivities } from '../controllers/activityController';
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();

router.use(authenticate);

// Admin only routes
router.get('/recent', authorize('admin'), getRecentActivities);

export default router;
