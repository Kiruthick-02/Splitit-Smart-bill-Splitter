import Chat from '../models/Chat.js';
import Group from '../models/Group.js';

// @desc    Get all messages for a group
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this chat' });
    }

    const messages = await Chat.find({ group: groupId })
      .populate('sender', 'username avatar _id') // <-- THIS LINE IS FIXED
      .sort({ createdAt: 'asc' });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

// @desc    Post a new message (can be called by Socket.IO handler)
export const postMessage = async ({ groupId, senderId, messageText }) => {
    try {
        const message = new Chat({
            group: groupId,
            sender: senderId,
            message: messageText,
        });

        const savedMessage = await message.save();
        // Populate sender details before returning to the socket event
        return await savedMessage.populate('sender', 'username avatar _id');
    } catch (error) {
        console.error('Error saving chat message:', error);
        return null;
    }
};