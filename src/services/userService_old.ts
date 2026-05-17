import User, { IUser } from '../models/User';
import { hashPassword } from '../utils/auth';

export class UserService {
    static async createUser(userData: Partial<IUser>): Promise<IUser> {
        if (userData.password) {
            userData.password = await hashPassword(userData.password);
        }
        const user = new User(userData);
        return user.save();
    }

    static async findUserByEmail(email: string): Promise<IUser | null> {
        return User.findOne({ email });
    }

    static async findUserByUsername(username: string): Promise<IUser | null> {
        return User.findOne({ username });
    }

    static async findUserById(id: string): Promise<IUser | null> {
        return User.findById(id);
    }

    static async getUsersByStaff(staffId: string): Promise<IUser[]> {
        return User.find({ assignedStaff: staffId, role: 'user' });
    }

    static async getAllStaff(): Promise<IUser[]> {
        return User.find({ role: 'staff' });
    }

    static async getAllAdmins(): Promise<IUser[]> {
        return User.find({ role: 'admin' });
    }

    static async getAllUsers(): Promise<IUser[]> {
        return User.find({ role: 'user' });
    }

    static async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        if (updateData.password) {
            updateData.password = await hashPassword(updateData.password);
        }
        return User.findByIdAndUpdate(id, updateData, { new: true });
    }

    static async deleteUser(id: string): Promise<IUser | null> {
        return User.findByIdAndDelete(id);
    }
}