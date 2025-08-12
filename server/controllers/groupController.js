import Group from '../models/Group.js';
import User from '../models/User.js';
import Bill from '../models/Bill.js';

export const createGroup = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Group name is required.' });
  }
  const group = new Group({ name, createdBy: req.user._id, members: [req.user._id] });
  const createdGroup = await group.save();
  res.status(201).json(createdGroup);
};

export const getMyGroups = async (req, res) => {
    const groups = await Group.find({ members: req.user._id }).sort({ createdAt: -1 });
    res.json(groups);
};

export const getGroupById = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId)
            .populate('members', 'username _id avatar')
            .populate('createdBy', '_id') // <-- THIS IS THE CRITICAL FIX
            .populate({
                path: 'bills',
                options: { sort: { createdAt: -1 } },
                populate: { path: 'paidBy', select: 'username' }
            });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (!group.members.some(member => member._id.equals(req.user._id))) {
            return res.status(403).json({ message: 'User not authorized for this group' });
        }
        res.json(group);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


export const addMemberToGroup = async (req, res) => {
    const { userId } = req.body;
    const { groupId } = req.params;
    try {
        const group = await Group.findById(groupId);
        const user = await User.findById(userId);
        if (!group) { return res.status(404).json({ message: 'Group not found' }); }
        if (!user) { return res.status(404).json({ message: 'User not found' }); }
        if (!group.members.includes(req.user._id)) { return res.status(403).json({ message: 'Not authorized' });}
        if (group.members.includes(userId)) { return res.status(400).json({ message: 'User is already a member' }); }
        group.members.push(userId);
        await group.save();
        user.groups.push(groupId);
        await user.save();
        res.json(group);
    } catch (error) {
        res.status(500).json({ message: 'Server error while adding member' });
    }
};

export const addVirtualMember = async (req, res) => {
    const { name } = req.body;
    const { groupId } = req.params;
    if (!name) { return res.status(400).json({ message: 'Member name is required.' });}
    try {
        const group = await Group.findById(groupId);
        if (!group) { return res.status(404).json({ message: 'Group not found' });}
        group.virtualMembers.push({ name });
        await group.save();
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: 'Server error while adding virtual member' });
    }
};

export const deleteGroup = async (req, res) => {
    const { groupId } = req.params;
    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (group.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this group' });
        }

        await Bill.deleteMany({ group: groupId });
        await User.updateMany(
            { _id: { $in: group.members } },
            { $pull: { groups: groupId } }
        );
        await group.deleteOne();
        res.json({ message: 'Group deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while deleting group' });
    }
};

// --- THIS ENTIRE FUNCTION IS REPLACED ---
// @desc    Remove a member and handle their bill shares
export const removeMemberFromGroup = async (req, res) => {
    const { groupId, memberId } = req.params;
    const { resolution } = req.body; // 'resplit' or 'absorb'

    if (!['resplit', 'absorb'].includes(resolution)) {
        return res.status(400).json({ message: "Invalid bill resolution strategy provided." });
    }

    try {
        const group = await Group.findById(groupId);
        if (!group) { return res.status(404).json({ message: 'Group not found' }); }
        if (group.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to remove members' });
        }
        if (group.createdBy.toString() === memberId) {
            return res.status(400).json({ message: 'Group creator cannot be removed' });
        }

        // Find all bills this member is a part of
        const billsToUpdate = await Bill.find({
            group: groupId,
            'splits.participantId': memberId
        });

        for (const bill of billsToUpdate) {
            const memberShare = bill.splits.find(s => s.participantId.toString() === memberId);
            if (!memberShare) continue;

            const remainingSplits = bill.splits.filter(s => s.participantId.toString() !== memberId);
            
            if (resolution === 'resplit') {
                if (remainingSplits.length > 0) {
                    const amountToRedistribute = memberShare.amount / remainingSplits.length;
                    bill.splits = remainingSplits.map(split => ({
                        ...split.toObject(),
                        amount: split.amount + amountToRedistribute
                    }));
                } else {
                    // If they were the only one on the bill, the bill becomes 0
                    bill.amount = 0;
                    bill.splits = [];
                }
            } else { // 'absorb'
                bill.amount = bill.amount - memberShare.amount;
                bill.splits = remainingSplits;
            }
            await bill.save();
        }

        // Now, remove the member from the group
        group.members.pull(memberId);
        group.virtualMembers.pull(memberId);
        await User.updateOne({ _id: memberId }, { $pull: { groups: groupId } });
        
        await group.save();
        res.json({ message: 'Member removed and bills updated successfully.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while removing member' });
    }
};
