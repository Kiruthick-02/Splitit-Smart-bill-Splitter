import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createBill,
  getBillDetails,
  getGroupBills,
  deleteBill,
} from '../controllers/billController.js';

const router = express.Router();

// @route   /api/bills
router.route('/')
    .post(protect, createBill);

// @route   /api/bills/group/:groupId
router.route('/group/:groupId')
    .get(protect, getGroupBills);

// @route   /api/bills/:id
router.route('/:id')
    .get(protect, getBillDetails)
    .delete(protect, deleteBill);

export default router;