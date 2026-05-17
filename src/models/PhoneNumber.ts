import mongoose, { Document, Schema } from 'mongoose';

export interface IPhoneNumber extends Document {
    phoneNumber: string;
    assignedStaff: mongoose.Types.ObjectId;
    assignedBy: mongoose.Types.ObjectId;
    status: 'pending' | 'completed';
    callResult?: string;
    remarks?: string;
    interestedUserName?: string;
    interestedUserEmail?: string;
    interestedUserState?: string;
    interestedUserPincode?: string;
    interestedUserInfo?: string;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const phoneNumberSchema = new Schema<IPhoneNumber>({
    phoneNumber: {
        type: String,
        required: true,
    },
    assignedStaff: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending',
    },
    callResult: {
        type: String,
        enum: ['not_interested', 'no_pickup', 'not_understood', 'callback_later', 'interested', 'wrong_number', 'other'],
    },
    remarks: {
        type: String,
    },
    interestedUserName: {
        type: String,
    },
    interestedUserEmail: {
        type: String,
    },
    interestedUserState: {
        type: String,
    },
    interestedUserPincode: {
        type: String,
    },
    interestedUserInfo: {
        type: String,
    },
    completedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Index for faster queries
phoneNumberSchema.index({ assignedStaff: 1, status: 1 });
phoneNumberSchema.index({ phoneNumber: 1, assignedStaff: 1 });

export default mongoose.model<IPhoneNumber>('PhoneNumber', phoneNumberSchema);
