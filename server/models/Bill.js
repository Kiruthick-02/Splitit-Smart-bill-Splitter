// Paste this entire block of code into the file, overwriting what's there.
import mongoose from 'mongoose';

// This new schema allows splits to reference either a real User or a virtual member
const splitSchema = new mongoose.Schema({
  participantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  participantName: { type: String, required: true }, // Store the name for easy access
  isRegistered: { type: Boolean, default: false }, // Flag to know if it's a real user
  amount: { type: Number, required: true },
  isSettled: { type: Boolean, default: false }
}, { _id: false });


const billSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  // The person who PAYS for the bill must be a registered user
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  splits: [splitSchema] // Use the new, more flexible schema
}, { timestamps: true });

export default mongoose.model('Bill', billSchema);