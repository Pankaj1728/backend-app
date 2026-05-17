import { Response } from 'express';
import { UserService } from '../services/userService';
import { ActivityService } from '../services/activityService';
import { addStaffSchema, addUserSchema } from '../utils/validation';
import { AuthRequest } from '../middlewares/auth';
import { sendEmail, generateStaffWelcomeEmail, generateAdminNotificationEmail, generatePasswordChangeEmail, generateAdminPasswordChangeNotification } from '../utils/emailService';

export const addStaff = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { error } = addStaffSchema.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }

        const { username, email, password, name, phone, dateOfBirth } = req.body;
        const profilePic = req.file ? req.file.filename : undefined;

        const existingEmail = await UserService.findUserByEmail(email);
        if (existingEmail) {
            res.status(400).json({ message: 'Email already exists' });
            return;
        }

        if (username) {
            const existingUsername = await UserService.findUserByUsername(username);
            if (existingUsername) {
                res.status(400).json({ message: 'Username already exists' });
                return;
            }
        }

        const staff = await UserService.createUser({
            username,
            email,
            password,
            name,
            phone,
            profilePic,
            dateOfBirth,
            role: 'staff',
        });

        // Log activity
        await ActivityService.logActivity(
            'staff_created',
            req.user!,
            `Created new staff member: ${name} (${email})`,
            { id: staff._id.toString(), name: staff.name },
            { email, username }
        );

        const staffEmailPromise = sendEmail({
            to: email,
            subject: '🎉 Welcome to CRM Team - Your Account is Ready!',
            html: generateStaffWelcomeEmail({
                name,
                email,
                username,
            }),
        });
        const adminEmail = req.user?.email;
        const adminName = req.user?.name || 'Admin';
        const adminEmailPromise = adminEmail ? sendEmail({
            to: adminEmail,
            subject: 'New Staff Member Added Successfully',
            html: generateAdminNotificationEmail({
                name,
                email,
                username,
            }, adminName),
        }) : Promise.resolve();
        Promise.all([staffEmailPromise, adminEmailPromise])
            .catch(err => console.error('Email sending failed:', err));

        res.status(201).json({ message: 'Staff added successfully', staff: { id: staff._id, name: staff.name, email: staff.email } });
    } catch (error: any) {
        console.error('Add staff error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const addUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { error } = addUserSchema.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }

        const { name, email, mobile, city, state, country, assignedStaff } = req.body;

        const existingUser = await UserService.findUserByEmail(email);
        if (existingUser) {
            res.status(400).json({ message: 'Email already exists' });
            return;
        }

        const staff = await UserService.findUserById(assignedStaff);
        if (!staff || staff.role !== 'staff') {
            res.status(400).json({ message: 'Invalid staff assignment' });
            return;
        }

        const user = await UserService.createUser({
            name,
            email,
            mobile,
            city,
            state,
            country,
            assignedStaff,
            role: 'user',
            password: Math.random().toString(36).slice(-8),
        });

        // Log activity
        await ActivityService.logActivity(
            'user_created',
            req.user!,
            `Created new user: ${name} (${email}) assigned to ${staff.name}`,
            { id: staff._id.toString(), name: staff.name },
            { userName: name, userEmail: email }
        );

        res.status(201).json({ message: 'User added successfully', user: { id: user._id, name: user.name, email: user.email } });
    } catch (error: any) {
        console.error('Add user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        if (req.user.role === 'admin') {
            const allUsers = await UserService.getAllUsers();
            const staff = await UserService.getAllStaff();
            res.json({ users: allUsers, staff });
        } else if (req.user.role === 'staff') {
            const users = await UserService.getUsersByStaff(req.user._id);
            res.json({ users });
        } else {
            res.status(403).json({ message: 'Forbidden' });
        }
    } catch (error: any) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const editStaff = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { username, email, name, phone, password, oldPassword, dateOfBirth } = req.body;
        const profilePic = req.file ? req.file.filename : undefined;
        if (req.user?.role === 'staff' && req.user.id !== id) {
            res.status(403).json({ message: 'You can only edit your own profile' });
            return;
        }

        const staff = await UserService.findUserById(id);
        if (!staff || (staff.role !== 'staff' && staff.role !== 'admin')) {
            res.status(404).json({ message: 'Staff not found' });
            return;
        }

        if (email && email !== staff.email) {
            const existingEmail = await UserService.findUserByEmail(email);
            if (existingEmail) {
                res.status(400).json({ message: 'Email already exists' });
                return;
            }
        }

        if (username && username !== staff.username) {
            const existingUsername = await UserService.findUserByUsername(username);
            if (existingUsername) {
                res.status(400).json({ message: 'Username already exists' });
                return;
            }
        }

        const updateData: any = { name, username, phone };
        if (req.user?.role === 'admin') {
            updateData.email = email;
        }
        if (dateOfBirth) {
            updateData.dateOfBirth = dateOfBirth;
        }

        if (password) {
            if (!oldPassword) {
                res.status(400).json({ message: 'Old password is required to set new password' });
                return;
            }

            const { comparePassword } = await import('../utils/auth');
            const isOldPasswordValid = await comparePassword(oldPassword, staff.password);

            if (!isOldPasswordValid) {
                res.status(400).json({ message: 'Old password is incorrect' });
                return;
            }

            updateData.password = password;
            const changedBy = req.user?.role === 'admin' ? 'Administrator' : 'Self';

            // Log activity
            await ActivityService.logActivity(
                'password_changed',
                req.user!,
                `Password changed for ${staff.name}`,
                { id: staff._id.toString(), name: staff.name },
                { changedBy }
            );

            const staffEmailPromise = sendEmail({
                to: staff.email,
                subject: '🔐 Password Changed Successfully',
                html: generatePasswordChangeEmail({
                    name: staff.name,
                    email: staff.email,
                    changedBy,
                }),
            });

            if (req.user?.role === 'staff') {
                const adminUsers = await UserService.getAllAdmins();
                const adminEmailPromises = adminUsers.map((admin: any) =>
                    sendEmail({
                        to: admin.email,
                        subject: '🔔 Staff Password Change Alert',
                        html: generateAdminPasswordChangeNotification({
                            name: staff.name,
                            email: staff.email,
                            changedBy,
                        }, admin.name),
                    })
                );

                Promise.all([staffEmailPromise, ...adminEmailPromises])
                    .catch((err: any) => console.error('Email sending failed:', err));
            } else {
                staffEmailPromise
                    .catch((err: any) => console.error('Email sending failed:', err));
            }
        }

        if (profilePic) {
            updateData.profilePic = profilePic;
        }

        const updatedStaff = await UserService.updateUser(id, updateData);

        // Log activity for profile update (only if password not changed, to avoid duplicate)
        if (!password) {
            await ActivityService.logActivity(
                'profile_updated',
                req.user!,
                `Updated profile for ${staff.name}`,
                { id: staff._id.toString(), name: staff.name },
                { updatedFields: Object.keys(updateData) }
            );
        }

        res.json({ message: 'Staff updated successfully', staff: updatedStaff });
    } catch (error: any) {
        console.error('Edit staff error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const editUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { name, email, mobile, city, state, country, assignedStaff, dateOfBirth } = req.body;

        const user = await UserService.findUserById(id);
        if (!user || user.role !== 'user') {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (email && email !== user.email) {
            const existingUser = await UserService.findUserByEmail(email);
            if (existingUser) {
                res.status(400).json({ message: 'Email already exists' });
                return;
            }
        }

        if (assignedStaff) {
            const staff = await UserService.findUserById(assignedStaff);
            if (!staff || staff.role !== 'staff') {
                res.status(400).json({ message: 'Invalid staff assignment' });
                return;
            }
        }

        const updatedUser = await UserService.updateUser(id, { name, email, mobile, city, state, country, assignedStaff, dateOfBirth });
        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error: any) {
        console.error('Edit user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getStaffById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        // Fetch the profile being requested
        const profile = await UserService.findUserById(id);
        if (!profile || (profile.role !== 'staff' && profile.role !== 'admin')) {
            res.status(404).json({ message: 'Profile not found' });
            return;
        }

        // Staff can view:
        // - Their own profile
        // - Admin profiles
        // - Other staff profiles (read-only)
        // Admin can view all profiles

        res.json({ staff: profile });
    } catch (error: any) {
        console.error('Get staff error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const user = await UserService.findUserById(id);
        if (!user || user.role !== 'user') {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ user });
    } catch (error: any) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// Get recently joined staff (last 7 days)
export const getRecentlyJoinedStaff = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentStaff = await UserService.getRecentlyJoinedStaff(sevenDaysAgo);

        res.json({ staff: recentStaff });
    } catch (error: any) {
        console.error('Get recently joined staff error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get upcoming birthdays (next 2 weeks)
export const getUpcomingBirthdays = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const today = new Date();
        const twoWeeksLater = new Date();
        twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);

        console.log('Fetching upcoming birthdays between:', today, 'and', twoWeeksLater);
        const upcomingBirthdays = await UserService.getUpcomingBirthdays();
        console.log('Upcoming birthdays count:', upcomingBirthdays.length);
        console.log('Upcoming birthdays data:', JSON.stringify(upcomingBirthdays, null, 2));

        res.json({ birthdays: upcomingBirthdays });
    } catch (error: any) {
        console.error('Get upcoming birthdays error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const deleteStaff = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const staff = await UserService.findUserById(id);
        if (!staff || staff.role !== 'staff') {
            res.status(404).json({ message: 'Staff not found' });
            return;
        }

        await UserService.deleteUser(id);
        res.json({ message: 'Staff deleted successfully' });
    } catch (error: any) {
        console.error('Delete staff error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const user = await UserService.findUserById(id);
        if (!user || user.role !== 'user') {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        await UserService.deleteUser(id);
        res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};