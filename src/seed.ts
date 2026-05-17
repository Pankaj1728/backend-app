import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import { hashPassword } from './utils/auth';

dotenv.config();

const seedUsers = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            console.error('❌ MONGO_URI is not defined in .env');
            process.exit(1);
        }

        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        const usersToCreate = [
            {
                name: 'Vaibhaw Admin',
                email: 'imvaibhaw@gmail.com',
                password: 'admin@123',
                role: 'admin' as const,
                username: 'vaibhaw_admin'
            },
            {
                name: 'Vaibhaw User',
                email: 'imvaibhaw100@gmail.com',
                password: 'user@123',
                role: 'user' as const,
                username: 'vaibhaw_user'
            }
        ];

        for (const userData of usersToCreate) {
            const existingUser = await User.findOne({ email: userData.email });
            
            if (existingUser) {
                console.log(`ℹ️ User ${userData.email} already exists. Updating password...`);
                existingUser.password = await hashPassword(userData.password);
                existingUser.role = userData.role;
                existingUser.name = userData.name;
                await existingUser.save();
                console.log(`✅ User ${userData.email} updated.`);
            } else {
                console.log(`👤 Creating user ${userData.email}...`);
                const hashedPassword = await hashPassword(userData.password);
                const user = new User({
                    ...userData,
                    password: hashedPassword
                });
                await user.save();
                console.log(`✅ User ${userData.email} created.`);
            }
        }

        console.log('\n✨ Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedUsers();
