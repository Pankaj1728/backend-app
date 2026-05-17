import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
    type: 'contact_assigned' | 'contact_completed' | 'contact_undone' | 'profile_updated' | 'password_changed' | 'user_created' | 'staff_created' | 'csv_uploaded' | 'post_created' | 'post_published' | 'post_deleted';
    performedBy: mongoose.Types.ObjectId;
    performedByName: string;
    performedByRole: string;
    targetUser?: mongoose.Types.ObjectId;
    targetUserName?: string;
    description: string;
    metadata?: any;
    createdAt: Date;
}

const activitySchema = new Schema<IActivity>({
    type: {
        type: String,
        enum: ['contact_assigned', 'contact_completed', 'contact_undone', 'profile_updated', 'password_changed', 'user_created', 'staff_created', 'csv_uploaded', 'post_created', 'post_published', 'post_deleted'],
        required: true,
    },
    performedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    performedByName: {
        type: String,
        required: true,
    },
    performedByRole: {
        type: String,
        required: true,
    },
    targetUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    targetUserName: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    metadata: {
        type: Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});

// Index for faster queries
activitySchema.index({ createdAt: -1 });
activitySchema.index({ performedBy: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });

export default mongoose.model<IActivity>('Activity', activitySchema);
