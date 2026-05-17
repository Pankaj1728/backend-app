import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { NotificationService } from '../services/notificationService';

// Get user's notifications
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const notifications = await NotificationService.getUserNotifications(req.user!.id);
        const unreadCount = await NotificationService.getUnreadCount(req.user!.id);

        res.json({ notifications, unreadCount });
    } catch (error: any) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Mark notification as read
export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await NotificationService.markAsRead(id as string);
        res.json({ message: 'Notification marked as read' });
    } catch (error: any) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Mark all notifications as read
export const markAllNotificationsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await NotificationService.markAllAsRead(req.user!.id);
        res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
        console.error('Mark all notifications read error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get unread count
export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const count = await NotificationService.getUnreadCount(req.user!.id);
        res.json({ count });
    } catch (error: any) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
