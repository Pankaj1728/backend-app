import express from 'express';
import {
    uploadPhoneNumbers,
    addSinglePhoneNumber,
    getPendingPhoneNumbers,
    getCompletedPhoneNumbers,
    markPhoneComplete,
    getAllCompletedPhoneNumbers,
    getStaffStatistics,
    getAllStaffStatistics,
    getStaffDetailedData,
    removeCompletedPhone,
} from '../controllers/phoneController';
import { authenticate, authorize } from '../middlewares/auth';
import multer from 'multer';
import path from 'path';

const router = express.Router();

router.use(authenticate);

// Configure multer for CSV upload
const csvStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/csv');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const csvUpload = multer({
    storage: csvStorage,
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname).toLowerCase() === '.csv') {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Admin routes
router.post('/upload', authorize('admin'), csvUpload.single('csvFile'), uploadPhoneNumbers);
router.post('/', authorize('admin'), addSinglePhoneNumber);
router.get('/completed/all', authorize('admin'), getAllCompletedPhoneNumbers);
router.get('/statistics', authorize('admin'), getAllStaffStatistics);
router.get('/statistics/:staffId', authorize('admin'), getStaffStatistics);
router.get('/detailed/:staffId', authorize('admin'), getStaffDetailedData);
router.delete('/:id/remove', authorize('admin'), removeCompletedPhone);

// Staff routes
router.get('/pending', authorize('staff'), getPendingPhoneNumbers);
router.get('/completed', authorize('staff'), getCompletedPhoneNumbers);
router.put('/:id/complete', authorize('staff'), markPhoneComplete);

export default router;
