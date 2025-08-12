import express from 'express';
import { 
    createGroup, 
    getMyGroups, 
    getGroupById,
    addMemberToGroup,
    addVirtualMember,
    deleteGroup,
    removeMemberFromGroup
} from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createGroup)
    .get(protect, getMyGroups);
    
// This route now correctly uses :groupId
router.route('/:groupId')
    .get(protect, getGroupById)
    .delete(protect, deleteGroup);

router.route('/:groupId/members')
    .put(protect, addMemberToGroup);

// --- THIS ROUTE IS CHANGED FROM DELETE TO POST ---
router.route('/:groupId/members/:memberId')
    .post(protect, removeMemberFromGroup);

router.route('/:groupId/virtual-members')
    .post(protect, addVirtualMember);

export default router;