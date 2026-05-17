import { IUser } from '../models/User';
export declare class UserService {
    static createUser(userData: Partial<IUser>): Promise<IUser>;
    static findUserByEmail(email: string): Promise<IUser | null>;
    static findUserById(id: string): Promise<IUser | null>;
    static getUsersByStaff(staffId: string): Promise<IUser[]>;
    static getAllStaff(): Promise<IUser[]>;
}
//# sourceMappingURL=userService.d.ts.map