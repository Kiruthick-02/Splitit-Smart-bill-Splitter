import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
    getOverallSettlements,
    createSettlement,
    updateSettlementStatus
} from '../controllers/settlementController.js';

const router = express.Router();

// Get settlements overview & create a new settlement request
router.route('/')
    .get(protect, getOverallSettlements)
    .post(protect, createSettlement);

// Update settlement status (Accept/Reject)
router.route('/:settlementId')
  .put(protect, updateSettlementStatus);


export default router;
