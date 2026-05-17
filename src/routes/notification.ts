import express from 'express';
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    getUnreadCount
} from '../controllers/notificationController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.use(authenticate);

// Get user's notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.patch('/:id/read', markNotificationRead);

// Mark all notifications as read
router.patch('/read-all', markAllNotificationsRead);

export default router;
