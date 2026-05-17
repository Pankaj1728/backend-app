"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.registerAdmin = void 0;
const userService_1 = require("../services/userService");
const auth_1 = require("../utils/auth");
const validation_1 = require("../utils/validation");
const registerAdmin = async (req, res) => {
    try {
        const { error } = validation_1.adminRegisterSchema.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }
        const { name, mobile, email, username, password } = req.body;
        const profilePic = req.file ? req.file.filename : undefined;
        const existingUser = await userService_1.UserService.findUserByEmail(email);
        if (existingUser) {
            res.status(400).json({ message: 'Email already exists' });
            return;
        }
        const user = await userService_1.UserService.createUser({
            name,
            mobile,
            email,
            username,
            password,
            profilePic,
            role: 'admin',
        });
        const token = (0, auth_1.generateToken)({ id: user._id, role: user.role });
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.registerAdmin = registerAdmin;
const login = async (req, res) => {
    try {
        const { error } = validation_1.loginSchema.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }
        const { email, password } = req.body;
        const user = await userService_1.UserService.findUserByEmail(email);
        if (!user || !(await (0, auth_1.comparePassword)(password, user.password))) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const token = (0, auth_1.generateToken)({ id: user._id, role: user.role });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
//# sourceMappingURL=authController.js.map