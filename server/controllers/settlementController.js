import Group from '../models/Group.js';
import User from '../models/User.js';
import Settlement from '../models/Settlement.js';
import { simplifyDebts } from '../utils/calculateSettlement.js';

export const getOverallSettlements = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const userGroups = await Group.find({ members: userId })
      .populate({
        path: 'bills',
        populate: [
          { path: 'paidBy', select: '_id username avatar' },
          { path: 'splits.participantId', select: '_id username name avatar' }
        ]
      })
      .populate('members', '_id username avatar')
      .populate('virtualMembers', '_id name');

    const allSettlements = await Settlement.find({
      $or: [{ payer: userId }, { payee: userId }],
    }).populate('payer payee group', 'username avatar _id name');

    const allTransactions = [];
    const allParticipantIds = new Set();

    // Step 1: Calculate balances for each group
    for (const group of userGroups) {
      const groupBalances = new Map();

      const participantsInGroup = [
        ...group.members.map(m => m._id.toString()),
        ...(group.virtualMembers?.map(vm => vm._id.toString()) || [])
      ];
      participantsInGroup.forEach(pId => groupBalances.set(pId, 0));

      for (const bill of group.bills) {
        if (!bill.paidBy || !bill.splits) continue;

        const payerId = bill.paidBy._id.toString();
        groupBalances.set(payerId, (groupBalances.get(payerId) || 0) + bill.amount);

        for (const split of bill.splits) {
          const participantId = split.participantId?._id?.toString() || split.participantId?.toString();
          if (!participantId) continue;
          if (!groupBalances.has(participantId)) groupBalances.set(participantId, 0);
          groupBalances.set(participantId, groupBalances.get(participantId) - split.amount);
        }
      }

      const groupTransactions = simplifyDebts(groupBalances);
      groupTransactions.forEach(t => {
        allTransactions.push({ ...t, groupId: group._id, groupName: group.name });
        allParticipantIds.add(t.from);
        allParticipantIds.add(t.to);
      });
    }

    // Step 2: Participant details
    const participantDetailsMap = new Map();
    const registeredUsers = await User.find({ _id: { $in: [...allParticipantIds] } })
      .select('_id username avatar');
    registeredUsers.forEach(u => participantDetailsMap.set(u._id.toString(), u));

    for (const group of userGroups) {
      group.virtualMembers?.forEach(vm => {
        if (allParticipantIds.has(vm._id.toString())) {
          participantDetailsMap.set(vm._id.toString(), {
            _id: vm._id.toString(),
            username: vm.name,
            name: vm.name,
            avatar: null
          });
        }
      });
    }

    const validSettlements = allSettlements.filter(s => s.payer && s.payee);

    // Step 3: Debts — skip if settlement already paid
    const debts = allTransactions
      .filter(t => t.from === userId)
      .filter(t => {
        return !validSettlements.some(
          s => s.status === 'paid' &&
               s.payer._id.toString() === t.from &&
               s.payee._id.toString() === t.to &&
               s.group?._id?.toString() === t.groupId.toString()
        );
      })
      .map(t => ({
        id: `${t.from}-${t.to}-${t.groupId}`,
        payee: participantDetailsMap.get(t.to) || { username: "Unknown", name: "Unknown" },
        amount: t.amount,
        groupId: t.groupId,
        groupName: t.groupName
      }));

    // Step 4: Credits — skip if settlement already paid
    const credits = allTransactions
      .filter(t => t.to === userId)
      .filter(t => {
        return !validSettlements.some(
          s => s.status === 'paid' &&
               s.payer._id.toString() === t.from &&
               s.payee._id.toString() === t.to &&
               s.group?._id?.toString() === t.groupId.toString()
        );
      })
      .map(t => ({
        id: `${t.from}-${t.to}-${t.groupId}`,
        payer: participantDetailsMap.get(t.from) || { username: "Unknown", name: "Unknown" },
        amount: t.amount,
        groupName: t.groupName
      }));

    res.json({ debts, credits, allSettlements: validSettlements });

  } catch (error) {
    console.error("Error in getOverallSettlements:", error);
    res.status(500).json({ message: 'Server error calculating settlements.' });
  }
};

export const createSettlement = async (req, res) => {
  const { payeeId, amount, groupId } = req.body;
  const payerId = req.user._id;

  if (payerId.toString() === payeeId) {
    return res.status(400).json({ message: "Payer and payee cannot be the same." });
  }

  const existingSettlement = await Settlement.findOne({
    payer: payerId,
    payee: payeeId,
    status: 'pending'
  });
  if (existingSettlement) {
    return res.status(400).json({ message: 'A settlement request to this user is already pending.' });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found to create settlement." });
    }
    const newSettlement = new Settlement({
      payer: payerId,
      payee: payeeId,
      amount: amount,
      group: groupId,
      groupName: group.name
    });
    const savedSettlement = await newSettlement.save();
    res.status(201).json(savedSettlement);
  } catch (error) {
    console.error("Error creating settlement:", error);
    res.status(500).json({ message: "Failed to create settlement request." });
  }
};

// UPDATED: Update settlement status with socket emit for immediate UI update
export const updateSettlementStatus = async (req, res) => {
  const { settlementId } = req.params;
  const { status } = req.body;
  const { io, userSocketMap } = req;

  console.log('Updating settlement:', settlementId, 'with status:', status); // Debug log

  try {
    const settlement = await Settlement.findById(settlementId).populate('payer payee group');
    if (!settlement) {
      console.log('Settlement not found');
      return res.status(404).json({ message: 'Settlement not found' });
    }

    console.log('Current user:', req.user._id, 'Payee:', settlement.payee._id); // Debug log
    if (settlement.payee._id.toString() !== req.user._id.toString()) {
      console.log('Unauthorized access');
      return res.status(403).json({ message: 'Not authorized to update this settlement' });
    }

    if (settlement.status !== 'pending') {
      console.log('Settlement already decided:', settlement.status);
      return res.status(400).json({ message: `Settlement already marked as ${settlement.status}` });
    }

    settlement.status = status?.toLowerCase() || 'paid';
    await settlement.save();

    console.log('Settlement updated to:', settlement.status); // Debug log

    // Emit socket event to payer and payee for instant UI refresh
    const participants = [
      settlement.payer._id.toString(),
      settlement.payee._id.toString()
    ];

    participants.forEach(userId => {
      const socketId = userSocketMap.get(userId);
      if (socketId) {
        io.to(socketId).emit('settlementUpdated', {
          settlementId,
          status: settlement.status,
          payerId: settlement.payer._id.toString(),
          payeeId: settlement.payee._id.toString(),
          groupId: settlement.group._id.toString()
        });
        console.log(`Emitted settlementUpdated to ${userId}`); // Debug log
      }
    });

    res.json({ message: 'Settlement status updated successfully', settlement });

  } catch (error) {
    console.error('Error updating settlement status:', error);
    res.status(500).json({ message: 'Server error while updating settlement' });
  }
};