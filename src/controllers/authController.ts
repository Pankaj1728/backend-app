import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { comparePassword, generateToken } from '../utils/auth';
import { adminRegisterSchema, loginSchema } from '../utils/validation';
import { AuthRequest } from '../middlewares/auth';

export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { error } = adminRegisterSchema.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }

        const { name, mobile, email, username, password, dateOfBirth } = req.body;
        const profilePic = req.file ? req.file.filename : undefined;

        const existingUser = await UserService.findUserByEmail(email);
        if (existingUser) {
            res.status(400).json({ message: 'Email already exists' });
            return;
        }

        const user = await UserService.createUser({
            name,
            mobile,
            email,
            username,
            password,
            profilePic,
            dateOfBirth,
            role: 'admin',
        });

        const token = generateToken({ id: user._id, role: user.role });
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, profilePic: user.profilePic, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }

        const { email, password } = req.body;
        const user = await UserService.findUserByEmail(email);
        if (!user || !(await comparePassword(password, user.password))) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = generateToken({ id: user._id, role: user.role });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, profilePic: user.profilePic, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};