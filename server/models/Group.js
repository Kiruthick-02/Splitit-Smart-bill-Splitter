// Paste this entire block of code into the file, overwriting what's there.
import mongoose from 'mongoose';

const virtualMemberSchema = new mongoose.Schema({
  // We give each virtual member a unique ID to track them in bills
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  name: { type: String, required: true, trim: true },
});

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bill' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // This is the new array for guest members
  virtualMembers: [virtualMemberSchema]
}, { timestamps: true });

export default mongoose.model('Group', groupSchema);