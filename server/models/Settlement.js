import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  // --- ADD THIS LINE ---
  groupName: { type: String, required: true }, // Denormalize for history
  payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  payee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'rejected'],
    default: 'pending' 
  },
}, { timestamps: true });

export default mongoose.model('Settlement', settlementSchema);