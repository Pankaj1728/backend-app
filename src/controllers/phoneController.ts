import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import PhoneNumber from '../models/PhoneNumber';
import { UserService } from '../services/userService';
import { ActivityService } from '../services/activityService';
import fs from 'fs';
import csvParser from 'csv-parser';
import mongoose from 'mongoose';

// Upload CSV and assign phone numbers to staff
export const uploadPhoneNumbers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { staffId } = req.body;
        const csvFile = req.file;

        if (!csvFile) {
            res.status(400).json({ message: 'CSV file is required' });
            return;
        }

        if (!staffId) {
            res.status(400).json({ message: 'Staff ID is required' });
            return;
        }

        // Verify staff exists
        const staff = await UserService.findUserById(staffId);
        if (!staff || staff.role !== 'staff') {
            res.status(400).json({ message: 'Invalid staff member' });
            return;
        }

        const phoneNumbers: string[] = [];
        const filePath = csvFile.path;

        // Parse CSV file
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (row) => {
                    // Try to find phone number in common column names
                    const phone = row.phone || row.mobile || row.phoneNumber || row.number || row.Phone || row.Mobile || row['Phone Number'];
                    if (phone) {
                        // Clean the phone number (remove spaces, dashes, etc.)
                        const cleanedPhone = phone.toString().replace(/[^\d+]/g, '');
                        if (cleanedPhone) {
                            phoneNumbers.push(cleanedPhone);
                        }
                    }
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // Delete the uploaded file
        fs.unlinkSync(filePath);

        if (phoneNumbers.length === 0) {
            res.status(400).json({ message: 'No valid phone numbers found in CSV' });
            return;
        }

        // Remove duplicates
        const uniquePhoneNumbers = [...new Set(phoneNumbers)];

        // Check for existing phone numbers assigned to this staff
        const existingNumbers = await PhoneNumber.find({
            phoneNumber: { $in: uniquePhoneNumbers },
            assignedStaff: staffId,
        });

        const existingPhoneSet = new Set(existingNumbers.map(p => p.phoneNumber));
        const newPhoneNumbers = uniquePhoneNumbers.filter(p => !existingPhoneSet.has(p));

        if (newPhoneNumbers.length === 0) {
            res.status(400).json({ message: 'All phone numbers already assigned to this staff' });
            return;
        }

        // Create phone number records
        const phoneRecords = newPhoneNumbers.map(phone => ({
            phoneNumber: phone,
            assignedStaff: staffId,
            assignedBy: req.user!._id,
            status: 'pending',
        }));

        await PhoneNumber.insertMany(phoneRecords);

        // Log activity
        await ActivityService.logActivity(
            'contact_assigned',
            req.user!,
            `Assigned ${newPhoneNumbers.length} contacts to ${staff.name} via CSV upload`,
            { id: staff._id.toString(), name: staff.name },
            { count: newPhoneNumbers.length, fileName: csvFile.originalname }
        );

        res.status(201).json({
            message: 'Phone numbers uploaded successfully',
            totalUploaded: uniquePhoneNumbers.length,
            newNumbers: newPhoneNumbers.length,
            duplicates: uniquePhoneNumbers.length - newPhoneNumbers.length,
        });
    } catch (error: any) {
        console.error('Upload phone numbers error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add single phone number manually
export const addSinglePhoneNumber = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { staffId, phoneNumber } = req.body;

        if (!staffId) {
            res.status(400).json({ message: 'Staff ID is required' });
            return;
        }

        if (!phoneNumber) {
            res.status(400).json({ message: 'Phone number is required' });
            return;
        }

        // Verify staff exists
        const staff = await UserService.findUserById(staffId);
        if (!staff || staff.role !== 'staff') {
            res.status(400).json({ message: 'Invalid staff member' });
            return;
        }

        // Clean the phone number
        const cleanedPhone = phoneNumber.toString().replace(/[^\d+]/g, '');

        if (!cleanedPhone) {
            res.status(400).json({ message: 'Invalid phone number' });
            return;
        }

        // Check if phone number already assigned to this staff
        const existingNumber = await PhoneNumber.findOne({
            phoneNumber: cleanedPhone,
            assignedStaff: staffId,
        });

        if (existingNumber) {
            res.status(400).json({ message: 'Phone number already assigned to this staff' });
            return;
        }

        // Create phone number record
        const phoneRecord = new PhoneNumber({
            phoneNumber: cleanedPhone,
            assignedStaff: staffId,
            assignedBy: req.user!._id,
            status: 'pending',
        });

        await phoneRecord.save();

        // Log activity
        await ActivityService.logActivity(
            'contact_assigned',
            req.user!,
            `Manually assigned contact ${cleanedPhone} to ${staff.name}`,
            { id: staff._id.toString(), name: staff.name },
            { phoneNumber: cleanedPhone }
        );

        res.status(201).json({
            message: 'Phone number added successfully',
            phoneNumber: phoneRecord,
        });
    } catch (error: any) {
        console.error('Add single phone number error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get pending phone numbers for staff
export const getPendingPhoneNumbers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const staffId = req.user!._id;

        const pendingNumbers = await PhoneNumber.find({
            assignedStaff: staffId,
            status: 'pending',
        }).sort({ createdAt: 1 });

        res.json({ phoneNumbers: pendingNumbers });
    } catch (error: any) {
        console.error('Get pending phone numbers error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get completed phone numbers for staff
export const getCompletedPhoneNumbers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const staffId = req.user!._id;

        const completedNumbers = await PhoneNumber.find({
            assignedStaff: staffId,
            status: 'completed',
        }).sort({ completedAt: -1 });

        res.json({ phoneNumbers: completedNumbers });
    } catch (error: any) {
        console.error('Get completed phone numbers error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Mark phone number as completed
export const markPhoneComplete = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { callResult, remarks, interestedUserName, interestedUserEmail, interestedUserState, interestedUserPincode, interestedUserInfo } = req.body;

        if (!callResult) {
            res.status(400).json({ message: 'Call result is required' });
            return;
        }

        // Validate interested user details if callResult is 'interested'
        if (callResult === 'interested') {
            if (!interestedUserName || !interestedUserEmail || !interestedUserState || !interestedUserPincode) {
                res.status(400).json({ message: 'User details are required for interested calls' });
                return;
            }
        }

        const phoneNumber = await PhoneNumber.findOne({
            _id: id,
            assignedStaff: req.user!._id,
            status: 'pending',
        });

        if (!phoneNumber) {
            res.status(404).json({ message: 'Phone number not found or already completed' });
            return;
        }

        phoneNumber.status = 'completed';
        phoneNumber.callResult = callResult;
        phoneNumber.remarks = remarks || '';

        // Save interested user details if provided
        if (callResult === 'interested') {
            phoneNumber.interestedUserName = interestedUserName;
            phoneNumber.interestedUserEmail = interestedUserEmail;
            phoneNumber.interestedUserState = interestedUserState;
            phoneNumber.interestedUserPincode = interestedUserPincode;
            phoneNumber.interestedUserInfo = interestedUserInfo || '';
        }

        phoneNumber.completedAt = new Date();

        await phoneNumber.save();

        // Log activity
        await ActivityService.logActivity(
            'contact_completed',
            req.user!,
            `Completed contact ${phoneNumber.phoneNumber} with result: ${callResult}`,
            undefined,
            { phoneNumber: phoneNumber.phoneNumber, callResult }
        );

        res.json({ message: 'Phone number marked as completed', phoneNumber });
    } catch (error: any) {
        console.error('Mark phone complete error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all completed phone numbers (Admin only)
export const getAllCompletedPhoneNumbers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const completedNumbers = await PhoneNumber.find({ status: 'completed' })
            .populate('assignedStaff', 'name email username')
            .populate('assignedBy', 'name email')
            .sort({ completedAt: -1 });

        res.json({ phoneNumbers: completedNumbers });
    } catch (error: any) {
        console.error('Get all completed phone numbers error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get staff statistics (Admin only)
export const getStaffStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { staffId } = req.params;
        const { startDate, endDate } = req.query;

        // Build query filter
        const baseFilter: any = { assignedStaff: staffId };
        const completedFilter: any = { assignedStaff: staffId, status: 'completed' };

        // Add date filtering if provided
        if (startDate || endDate) {
            const dateFilter: any = {};
            if (startDate) {
                dateFilter.$gte = new Date(startDate as string);
            }
            if (endDate) {
                // Set end date to end of day
                const end = new Date(endDate as string);
                end.setHours(23, 59, 59, 999);
                dateFilter.$lte = end;
            }
            completedFilter.completedAt = dateFilter;
        }

        const total = await PhoneNumber.countDocuments(baseFilter);
        const completed = await PhoneNumber.countDocuments(completedFilter);
        const pending = await PhoneNumber.countDocuments({ assignedStaff: staffId, status: 'pending' });

        res.json({
            total,
            completed,
            pending,
            completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
        });
    } catch (error: any) {
        console.error('Get staff statistics error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all staff with their stats (Admin only)
export const getAllStaffStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { startDate, endDate } = req.query;
        const staffMembers = await UserService.getAllStaff();

        const statsPromises = staffMembers.map(async (staff) => {
            const baseFilter: any = { assignedStaff: staff._id };
            const completedFilter: any = { assignedStaff: staff._id, status: 'completed' };

            // Add date filtering if provided
            if (startDate || endDate) {
                const dateFilter: any = {};
                if (startDate) {
                    dateFilter.$gte = new Date(startDate as string);
                }
                if (endDate) {
                    // Set end date to end of day
                    const end = new Date(endDate as string);
                    end.setHours(23, 59, 59, 999);
                    dateFilter.$lte = end;
                }
                completedFilter.completedAt = dateFilter;
            }

            const total = await PhoneNumber.countDocuments(baseFilter);
            const completed = await PhoneNumber.countDocuments(completedFilter);
            const pending = await PhoneNumber.countDocuments({ assignedStaff: staff._id, status: 'pending' });

            return {
                staffId: staff._id,
                staffName: staff.name,
                staffEmail: staff.email,
                total,
                completed,
                pending,
                completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
            };
        });

        const stats = await Promise.all(statsPromises);

        res.json({ statistics: stats });
    } catch (error: any) {
        console.error('Get all staff statistics error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get detailed staff data with completed, pending contacts and assignment history
export const getStaffDetailedData = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { staffId } = req.params;
        const { startDate, endDate } = req.query;

        // Build date filter if provided
        const dateFilter: any = {};
        if (startDate || endDate) {
            if (startDate) {
                dateFilter.$gte = new Date(startDate as string);
            }
            if (endDate) {
                const end = new Date(endDate as string);
                end.setHours(23, 59, 59, 999);
                dateFilter.$lte = end;
            }
        }

        // Get completed contacts
        const completedQuery: any = { assignedStaff: staffId, status: 'completed' };
        if (Object.keys(dateFilter).length > 0) {
            completedQuery.completedAt = dateFilter;
        }

        const completedContacts = await PhoneNumber.find(completedQuery)
            .sort({ completedAt: -1 })
            .limit(100)
            .lean();

        // Get pending contacts
        const pendingContacts = await PhoneNumber.find({
            assignedStaff: staffId,
            status: 'pending'
        })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        // Get assignment history - group by date
        const assignmentHistory = await PhoneNumber.aggregate([
            {
                $match: {
                    assignedStaff: new mongoose.Types.ObjectId(staffId as string)
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 },
                    date: { $first: "$createdAt" }
                }
            },
            {
                $sort: { date: -1 }
            },
            {
                $limit: 30
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: 1
                }
            }
        ]);

        res.json({
            completedContacts,
            pendingContacts,
            assignmentHistory,
            summary: {
                totalCompleted: completedContacts.length,
                totalPending: pendingContacts.length,
            }
        });
    } catch (error: any) {
        console.error('Get staff detailed data error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Remove/Undo completed phone number (Admin only)
export const removeCompletedPhone = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Find the phone number
        const phoneNumber = await PhoneNumber.findById(id);
        if (!phoneNumber) {
            res.status(404).json({ message: 'Phone number not found' });
            return;
        }

        // Reset to pending status
        phoneNumber.status = 'pending';
        phoneNumber.callResult = undefined;
        phoneNumber.remarks = undefined;
        phoneNumber.completedAt = undefined;
        phoneNumber.interestedUserName = undefined;
        phoneNumber.interestedUserEmail = undefined;
        phoneNumber.interestedUserState = undefined;
        phoneNumber.interestedUserPincode = undefined;
        phoneNumber.interestedUserInfo = undefined;

        await phoneNumber.save();
        // Log activity
        const assignedStaff = await UserService.findUserById(phoneNumber.assignedStaff.toString());
        await ActivityService.logActivity(
            'contact_undone',
            req.user!,
            `Moved contact ${phoneNumber.phoneNumber} back to pending for ${assignedStaff?.name || 'staff'}`,
            assignedStaff ? { id: assignedStaff._id.toString(), name: assignedStaff.name } : undefined,
            { phoneNumber: phoneNumber.phoneNumber }
        );
        res.json({
            message: 'Phone number moved back to pending queue',
            phoneNumber
        });
    } catch (error: any) {
        console.error('Remove completed phone error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
