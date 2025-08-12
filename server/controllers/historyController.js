import Settlement from '../models/Settlement.js';

// @desc    Get all historical (non-pending) settlements for a user
// @route   GET /api/history
// @access  Private
export const getSettlementHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        const history = await Settlement.find({
            $or: [{ payer: userId }, { payee: userId }],
            status: { $in: ['paid', 'rejected'] } // Only get 'paid' or 'rejected'
        })
        .populate('payer payee', 'username avatar')
        .sort({ updatedAt: -1 }); // Sort by when they were last updated

        // Filter out any records where a user (payer or payee) has been deleted
        const validHistory = history.filter(item => item.payer && item.payee);

        res.json(validHistory);
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ message: "Server error fetching settlement history." });
    }
};