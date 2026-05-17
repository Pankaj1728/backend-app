import Activity from '../models/Activity';
import { IUser } from '../models/User';

export class ActivityService {
    static async logActivity(
        type: 'contact_assigned' | 'contact_completed' | 'contact_undone' | 'profile_updated' | 'password_changed' | 'user_created' | 'staff_created' | 'csv_uploaded' | 'post_created' | 'post_published' | 'post_deleted',
        performedBy: IUser,
        description: string,
        targetUser?: { id: string; name: string },
        metadata?: any
    ) {
        try {
            await Activity.create({
                type,
                performedBy: performedBy._id,
                performedByName: performedBy.name,
                performedByRole: performedBy.role,
                targetUser: targetUser?.id,
                targetUserName: targetUser?.name,
                description,
                metadata,
            });
        } catch (error) {
            console.error('Failed to log activity:', error);
            // Don't throw error to prevent breaking main functionality
        }
    }

    static async getRecentActivities(limit: number = 50) {
        try {
            return await Activity.find()
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
        } catch (error) {
            console.error('Failed to fetch activities:', error);
            return [];
        }
    }

    static async getUserActivities(userId: string, limit: number = 20) {
        try {
            return await Activity.find({ performedBy: userId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
        } catch (error) {
            console.error('Failed to fetch user activities:', error);
            return [];
        }
    }
}
