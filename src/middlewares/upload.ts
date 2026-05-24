import multer from 'multer';
import path from 'path';

import os from 'os';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = process.env.VERCEL ? os.tmpdir() : 'uploads/';
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});