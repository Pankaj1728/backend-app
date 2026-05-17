import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    username?: string;
    email: string;
    password: string;
    name: string;
    mobile?: string;
    phone?: string;
    profilePic?: string;
    role: 'admin' | 'staff' | 'user';
    city?: string;
    state?: string;
    country?: string;
    assignedStaff?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default _default;
//# sourceMappingURL=User.d.ts.map