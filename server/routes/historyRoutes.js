import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getSettlementHistory } from '../controllers/historyController.js';

const router = express.Router();

router.route('/').get(protect, getSettlementHistory);

export default router;