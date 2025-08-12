import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, trim: true },
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema);