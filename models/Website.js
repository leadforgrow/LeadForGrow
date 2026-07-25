import mongoose from 'mongoose';

const WebsiteSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
  },
  websiteName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'Healthcare',
      'Education',
      'Real Estate',
      'Professional Services',
      'Local Services',
      'Events',
      'Agencies',
      'E-commerce'
    ]
  },
  city: {
    type: String
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  contactMethod: {
    type: String,
    enum: ['call', 'whatsapp', 'email'],
    default: 'email'
  },
  goal: {
    type: String,
    enum: ['leads', 'calls', 'whatsapp', 'appointments'],
    default: 'leads'
  },
  services: [{
    name: String,
    description: String
  }],
  primaryColor: {
    type: String,
    default: '#4f46e5'
  },
  logo: {
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
  },
  customDomain: {
    type: String,
    unique: true,
    sparse: true
  },
  sections: [{
    id: String,
    type: {
      type: String,
      enum: ['hero', 'services', 'doctors', 'form', 'features', 'testimonials', 'footer', 'faq', 'projects', 'gallery', 'map', 'courses', 'faculty', 'agenda', 'results']
    },
    content: mongoose.Schema.Types.Mixed,
    active: {
      type: Boolean,
      default: true
    }
  }],
  settings: {
    fontFamily: { type: String, default: 'Inter' },
    borderRadius: { type: String, default: '1rem' },
    navbar: {
      items: [{ text: String, link: String }],
      ctaText: String,
      ctaLink: String,
      ctaColor: String,
      transparent: { type: Boolean, default: false },
      sticky: { type: Boolean, default: true }
    }
  },
  domainVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

WebsiteSchema.index({ owner: 1, createdAt: -1 });
WebsiteSchema.index({ businessId: 1 });

export default mongoose.models.Website || mongoose.model('Website', WebsiteSchema);
