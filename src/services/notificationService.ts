import Notification from '../models/Notification';
import User from '../models/User';
import mongoose from 'mongoose';

export class NotificationService {
    // Create notification for mentioned users
    static async notifyMentions(
        senderId: string,
        senderName: string,
        senderProfilePic: string | undefined,
        mentions: string[],
        postId: string,
        message: string
    ): Promise<void> {
        try {
            const notifications = mentions.map(userId => ({
                recipient: new mongoose.Types.ObjectId(userId),
                sender: new mongoose.Types.ObjectId(senderId),
                senderName,
                senderProfilePic,
                type: 'post_mentioned' as const,
                message,
                postId: new mongoose.Types.ObjectId(postId),
                isRead: false
            }));

            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
        } catch (error) {
            console.error('Error creating mention notifications:', error);
        }
    }

    // Notify all staff when admin creates a post
    static async notifyNewPost(
        senderId: string,
        senderName: string,
        senderProfilePic: string | undefined,
        postId: string,
        contentPreview: string
    ): Promise<void> {
        try {
            // Get all staff (exclude the sender)
            const staff = await User.find({
                role: { $in: ['staff', 'admin'] },
                _id: { $ne: senderId }
            }).select('_id');

            const notifications = staff.map(user => ({
                recipient: user._id,
                sender: new mongoose.Types.ObjectId(senderId),
                senderName,
                senderProfilePic,
                type: 'post_created' as const,
                message: `${senderName} posted: ${contentPreview}`,
                postId: new mongoose.Types.ObjectId(postId),
                isRead: false
            }));

            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
        } catch (error) {
            console.error('Error creating post notifications:', error);
        }
    }

    // Notify comment author when someone replies
    static async notifyCommentReply(
        senderId: string,
        senderName: string,
        senderProfilePic: string | undefined,
        recipientId: string,
        postId: string,
        commentId: string
    ): Promise<void> {
        try {
            // Don't notify if replying to own comment
            if (senderId === recipientId) return;

            await Notification.create({
                recipient: new mongoose.Types.ObjectId(recipientId),
                sender: new mongoose.Types.ObjectId(senderId),
                senderName,
                senderProfilePic,
                type: 'comment_reply',
                message: `${senderName} replied to your comment`,
                postId: new mongoose.Types.ObjectId(postId),
                commentId,
                isRead: false
            });
        } catch (error) {
            console.error('Error creating reply notification:', error);
        }
    }

    // Notify post author when someone likes the post
    static async notifyPostLike(
        senderId: string,
        senderName: string,
        senderProfilePic: string | undefined,
        postAuthorId: string,
        postId: string
    ): Promise<void> {
        try {
            // Don't notify if liking own post
            if (senderId === postAuthorId) return;

            await Notification.create({
                recipient: new mongoose.Types.ObjectId(postAuthorId),
                sender: new mongoose.Types.ObjectId(senderId),
                senderName,
                senderProfilePic,
                type: 'post_liked',
                message: `${senderName} reacted to your post`,
                postId: new mongoose.Types.ObjectId(postId),
                isRead: false
            });
        } catch (error) {
            console.error('Error creating post like notification:', error);
        }
    }

    // Notify comment author when someone likes the comment
    static async notifyCommentLike(
        senderId: string,
        senderName: string,
        senderProfilePic: string | undefined,
        commentAuthorId: string,
        postId: string,
        commentId: string
    ): Promise<void> {
        try {
            // Don't notify if liking own comment
            if (senderId === commentAuthorId) return;

            await Notification.create({
                recipient: new mongoose.Types.ObjectId(commentAuthorId),
                sender: new mongoose.Types.ObjectId(senderId),
                senderName,
                senderProfilePic,
                type: 'comment_liked',
                message: `${senderName} liked your comment`,
                postId: new mongoose.Types.ObjectId(postId),
                commentId,
                isRead: false
            });
        } catch (error) {
            console.error('Error creating comment like notification:', error);
        }
    }

    // Notify reply author when someone likes the reply
    static async notifyReplyLike(
        senderId: string,
        senderName: string,
        senderProfilePic: string | undefined,
        replyAuthorId: string,
        postId: string,
        commentId: string
    ): Promise<void> {
        try {
            // Don't notify if liking own reply
            if (senderId === replyAuthorId) return;

            await Notification.create({
                recipient: new mongoose.Types.ObjectId(replyAuthorId),
                sender: new mongoose.Types.ObjectId(senderId),
                senderName,
                senderProfilePic,
                type: 'reply_liked',
                message: `${senderName} liked your reply`,
                postId: new mongoose.Types.ObjectId(postId),
                commentId,
                isRead: false
            });
        } catch (error) {
            console.error('Error creating reply like notification:', error);
        }
    }

    // Get user's notifications
    static async getUserNotifications(userId: string, limit: number = 50): Promise<any[]> {
        try {
            return await Notification.find({ recipient: userId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    // Mark notification as read
    static async markAsRead(notificationId: string): Promise<void> {
        try {
            await Notification.findByIdAndUpdate(notificationId, { isRead: true });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    // Mark all notifications as read
    static async markAllAsRead(userId: string): Promise<void> {
        try {
            await Notification.updateMany(
                { recipient: userId, isRead: false },
                { isRead: true }
            );
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    // Get unread count
    static async getUnreadCount(userId: string): Promise<number> {
        try {
            return await Notification.countDocuments({
                recipient: userId,
                isRead: false
            });
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }
}
