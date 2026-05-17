import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { ActivityService } from '../services/activityService';

// Get recent activities (Admin only)
export const getRecentActivities = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { limit } = req.query;
        const activities = await ActivityService.getRecentActivities(
            limit ? parseInt(limit as string) : 50
        );

        res.json({ activities });
    } catch (error: any) {
        console.error('Get recent activities error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
