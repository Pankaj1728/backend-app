import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    senderName: string;
    senderProfilePic?: string;
    type: 'post_created' | 'post_mentioned' | 'comment_reply' | 'post_liked' | 'comment_liked' | 'reply_liked';
    message: string;
    postId?: mongoose.Types.ObjectId;
    commentId?: string;
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    senderProfilePic: { type: String },
    type: {
        type: String,
        enum: ['post_created', 'post_mentioned', 'comment_reply', 'post_liked', 'comment_liked', 'reply_liked'],
        required: true
    },
    message: { type: String, required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post' },
    commentId: { type: String },
    isRead: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Index for faster queries
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
