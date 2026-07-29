import mongoose from 'mongoose';

/**
 * ShareContact — a personal WhatsApp address book for sharing leads.
 * These are NOT team members and have no CRM access / assignment; they are
 * just saved name + WhatsApp number entries the user shares lead details with.
 */
const ShareContactSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    whatsapp: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ShareContactSchema.index({ businessId: 1, whatsapp: 1 }, { unique: true });

export default mongoose.models.ShareContact || mongoose.model('ShareContact', ShareContactSchema);
