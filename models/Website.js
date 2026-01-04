import mongoose from 'mongoose';

const WebsiteSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateId: {
    type: String,
    required: true
  },
  websiteName: {
    type: String,
    required: true
  },
  brandName: {
    type: String
  },
  goal: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  content: {
    type: Object,
    default: {}
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Website || mongoose.model('Website', WebsiteSchema);
