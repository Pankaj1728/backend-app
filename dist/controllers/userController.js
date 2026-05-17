"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.addUser = exports.addStaff = void 0;
const userService_1 = require("../services/userService");
const validation_1 = require("../utils/validation");
const addStaff = async (req, res) => {
    try {
        const { error } = validation_1.addStaffSchema.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }
        const { username, email, password, name, phone } = req.body;
        const profilePic = req.file ? req.file.filename : undefined;
        const existingUser = await userService_1.UserService.findUserByEmail(email);
        if (existingUser) {
            res.status(400).json({ message: 'Email already exists' });
            return;
        }
        const staff = await userService_1.UserService.createUser({
            username,
            email,
            password,
            name,
            phone,
            profilePic,
            role: 'staff',
        });
        res.status(201).json({ message: 'Staff added successfully', staff: { id: staff._id, name: staff.name, email: staff.email } });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.addStaff = addStaff;
const addUser = async (req, res) => {
    try {
        const { error } = validation_1.addUserSchema.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }
        const { name, email, mobile, city, state, country, assignedStaff } = req.body;
        const existingUser = await userService_1.UserService.findUserByEmail(email);
        if (existingUser) {
            res.status(400).json({ message: 'Email already exists' });
            return;
        }
        const staff = await userService_1.UserService.findUserById(assignedStaff);
        if (!staff || staff.role !== 'staff') {
            res.status(400).json({ message: 'Invalid staff assignment' });
            return;
        }
        const user = await userService_1.UserService.createUser({
            name,
            email,
            mobile,
            city,
            state,
            country,
            assignedStaff,
            role: 'user',
        });
        res.status(201).json({ message: 'User added successfully', user: { id: user._id, name: user.name, email: user.email } });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.addUser = addUser;
const getUsers = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const staff = await userService_1.UserService.getAllStaff();
            res.json({ staff });
        }
        else if (req.user.role === 'staff') {
            const users = await userService_1.UserService.getUsersByStaff(req.user._id);
            res.json({ users });
        }
        else {
            res.status(403).json({ message: 'Forbidden' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getUsers = getUsers;
//# sourceMappingURL=userController.js.map