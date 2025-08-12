import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getUserProfile,
  updateUserProfile,
  getUsers,
  uploadProfileAvatar,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/', protect, getUsers);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

// This route now accepts JSON with a base64 image string, not form-data
router.put('/profile/avatar', protect, uploadProfileAvatar);

export default router;