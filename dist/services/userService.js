"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../utils/auth");
class UserService {
    static async createUser(userData) {
        if (userData.password) {
            userData.password = await (0, auth_1.hashPassword)(userData.password);
        }
        const user = new User_1.default(userData);
        return user.save();
    }
    static async findUserByEmail(email) {
        return User_1.default.findOne({ email });
    }
    static async findUserById(id) {
        return User_1.default.findById(id);
    }
    static async getUsersByStaff(staffId) {
        return User_1.default.find({ assignedStaff: staffId, role: 'user' });
    }
    static async getAllStaff() {
        return User_1.default.find({ role: 'staff' });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=userService.js.map