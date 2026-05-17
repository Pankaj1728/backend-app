import express from 'express';
import { editStaff, editUser } from '../controllers/userController';
import { authenticate, authorize } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = express.Router();

router.use(authenticate);

router.put('/staff/:id', authorize('admin'), upload.single('profilePic'), editStaff);
router.put('/user/:id', authorize('admin'), editUser);

export default router;