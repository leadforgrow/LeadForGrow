import mongoose from 'mongoose';
import { baseSchemaPlugin } from '../baseSchema.js';

const SocialLinkSchema = new mongoose.Schema(
  { platform: { type: String, enum: ['linkedin', 'twitter', 'facebook', 'instagram', 'website', 'other'] }, url: String },
  { _id: true }
);

const CompanySchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    domain: { type: String, trim: true, lowercase: true },
    industry: { type: String, trim: true },
    employeeCount: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+', ''], default: '' },
    annualRevenue: { type: Number, min: 0 },
    revenueCurrency: { type: String, default: 'INR' },
    website: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    socialLinks: [SocialLinkSchema],
    description: { type: String, trim: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    tags: [{ type: String, trim: true }],
    customFields: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    archived: { type: Boolean, default: false },
    logo: String,
  },
  { timestamps: true }
);

CompanySchema.plugin(baseSchemaPlugin);

CompanySchema.index({ businessId: 1, name: 1 });
CompanySchema.index({ businessId: 1, domain: 1 }, { sparse: true });
CompanySchema.index({ businessId: 1, industry: 1 });
CompanySchema.index({ businessId: 1, archived: 1, updatedAt: -1 });

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);
