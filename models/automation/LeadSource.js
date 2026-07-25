import mongoose from 'mongoose';

const LeadSourceSchema = new mongoose.Schema({
  // Business Context (Multi-tenant)
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    enum: [
      'LeadForGrow Website Forms',
      'WhatsApp Button Clicks',
      'Call Request Button',
      'External Website Form'
    ]
  },
  type: {
    type: String,
    enum: ['form', 'whatsapp', 'call', 'external'],
    required: true
  },
  status: {
    type: String,
    enum: ['Connected', 'Needs Setup', 'Active'],
    default: 'Needs Setup'
  },
  config: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});


export default mongoose.models.LeadSource || mongoose.model('LeadSource', LeadSourceSchema);
