import Bill from '../models/Bill.js';
import Group from '../models/Group.js';
import User from '../models/User.js'; // ✅ Added import

// @desc    Create a new bill with custom splits
export const createBill = async (req, res) => {
  const { groupId, description, amount, splits } = req.body;
  const paidBy = req.user._id;
  const { io, userSocketMap } = req;

  try {
    // 1️⃣ Validate splits exist
    if (!splits || splits.length === 0) {
      return res.status(400).json({ message: 'At least one participant is required.' });
    }

    // 2️⃣ Validate total split equals bill amount
    const totalSplitAmount = splits.reduce((sum, split) => sum + (split.amount || 0), 0);
    if (Math.abs(totalSplitAmount - amount) > 0.01) {
      return res.status(400).json({ message: 'Sum of splits must equal the total bill amount' });
    }

    // 3️⃣ Get group and ensure user is a member
    const group = await Group.findById(groupId).populate('members', '_id username');
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (!group.members.some(m => m._id.equals(paidBy))) {
      // If the payer isn't in members, add them
      group.members.push(paidBy);
    }

    // 4️⃣ Prepare participant map (registered + virtual)
    const allParticipants = new Map();
    const registeredMembers = await User.find({ _id: { $in: group.members } }).select('_id username');
    registeredMembers.forEach(m => {
      allParticipants.set(m._id.toString(), { name: m.username, isRegistered: true });
    });
    group.virtualMembers.forEach(vm => {
      allParticipants.set(vm._id.toString(), { name: vm.name, isRegistered: false });
    });

    // 5️⃣ Ensure all split participants exist in group
    for (const split of splits) {
      if (!allParticipants.has(split.participantId)) {
        // Check if registered user exists
        const user = await User.findById(split.participantId).select('_id username');
        if (user) {
          allParticipants.set(user._id.toString(), { name: user.username, isRegistered: true });
          group.members.push(user._id); // add registered user to members
        } else {
          return res.status(400).json({ message: `Participant ${split.participantId} not found in group.` });
        }
      }
    }

    // 6️⃣ Build final splits array with names and registration flags
    const finalSplits = splits.map(split => {
      const participantInfo = allParticipants.get(split.participantId);
      return {
        participantId: split.participantId,
        participantName: participantInfo.name,
        isRegistered: participantInfo.isRegistered,
        amount: split.amount,
      };
    });

    // 7️⃣ Save bill
    const newBill = new Bill({ group: groupId, description, amount, paidBy, splits: finalSplits });
    await newBill.save();

    // 8️⃣ Link bill to group and save
    group.bills.push(newBill._id);
    await group.save();

    // 9️⃣ Notify members in real time
    group.members.forEach(member => {
      const socketId = userSocketMap.get(member._id.toString());
      if (socketId) {
        io.to(socketId).emit('settlementUpdated');
      }
    });

    res.status(201).json(newBill);
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({ message: 'Server error while creating bill' });
  }
};

// @desc    Delete a bill
export const deleteBill = async (req, res) => {
    const { io, userSocketMap } = req;
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) { return res.status(404).json({ message: 'Bill not found' }); }

        const group = await Group.findById(bill.group).populate('members');
        if (!group) { return res.status(404).json({ message: 'Associated group not found' }); }

        if (group.createdBy.toString() !== req.user._id.toString() && bill.paidBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this bill' });
        }

        await Group.updateOne({ _id: bill.group }, { $pull: { bills: bill._id } });
        await bill.deleteOne();

        // --- REAL-TIME NOTIFICATION ---
        group.members.forEach(member => {
            const socketId = userSocketMap.get(member._id.toString());
            if (socketId) {
                io.to(socketId).emit('settlementUpdated');
            }
        });

        res.json({ message: 'Bill removed successfully' });
    } catch (error) {
        console.error("Error deleting bill:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get details for a single bill
export const getBillDetails = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('group', 'name')
      .populate('paidBy', 'username email');

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    const group = await Group.findById(bill.group._id);
     if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this bill' });
    }

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all bills for a specific group
export const getGroupBills = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId);
        if (!group) { return res.status(404).json({ message: "Group not found" });}
        if (!group.members.includes(req.user._id)) { return res.status(403).json({ message: "Not authorized" }); }
        const bills = await Bill.find({ group: groupId }).populate('paidBy', 'username').sort({ createdAt: -1 });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};