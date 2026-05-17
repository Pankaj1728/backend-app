import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    username?: string;
    email: string;
    password: string;
    name: string;
    mobile?: string;
    phone?: string;
    profilePic?: string;
    dateOfBirth?: Date;
    role: 'admin' | 'staff' | 'user';
    city?: string;
    state?: string;
    country?: string;
    assignedStaff?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    username: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    mobile: { type: String },
    phone: { type: String },
    profilePic: { type: String },
    dateOfBirth: { type: Date },
    role: { type: String, enum: ['admin', 'staff', 'user'], required: true },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    assignedStaff: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);