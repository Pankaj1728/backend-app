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

    static async getRecentlyJoinedStaff(since: Date): Promise<IUser[]> {
        return User.find({
            role: { $in: ['staff', 'admin'] },
            createdAt: { $gte: since }
        }).select('name email profilePic role createdAt').sort({ createdAt: -1 }).limit(10);
    }

    static async getUpcomingBirthdays(): Promise<IUser[]> {
        const users = await User.find({
            role: { $in: ['staff', 'admin'] },
            dateOfBirth: { $exists: true, $ne: null }
        }).select('name email profilePic role dateOfBirth');

        const today = new Date();
        const twoWeeksLater = new Date();
        twoWeeksLater.setDate(today.getDate() + 14);

        const upcomingBirthdays = users.filter(user => {
            if (!user.dateOfBirth) return false;
            
            const dob = new Date(user.dateOfBirth);
            const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
            const nextYearBirthday = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());

            return (thisYearBirthday >= today && thisYearBirthday <= twoWeeksLater) ||
                   (nextYearBirthday >= today && nextYearBirthday <= twoWeeksLater);
        }).sort((a, b) => {
            const dobA = new Date(a.dateOfBirth!);
            const dobB = new Date(b.dateOfBirth!);
            const thisYearA = new Date(today.getFullYear(), dobA.getMonth(), dobA.getDate());
            const thisYearB = new Date(today.getFullYear(), dobB.getMonth(), dobB.getDate());
            
            if (thisYearA < today) thisYearA.setFullYear(today.getFullYear() + 1);
            if (thisYearB < today) thisYearB.setFullYear(today.getFullYear() + 1);
            
            return thisYearA.getTime() - thisYearB.getTime();
        });

        return upcomingBirthdays.slice(0, 10);
    }
}
