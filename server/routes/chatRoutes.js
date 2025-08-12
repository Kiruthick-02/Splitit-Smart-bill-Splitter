import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getGroupMessages } from '../controllers/chatController.js';

const router = express.Router();

// @route   GET /api/chat/:groupId
// @desc    Get all historical messages for a specific group chat
router.get('/:groupId', protect, getGroupMessages);

export default router;