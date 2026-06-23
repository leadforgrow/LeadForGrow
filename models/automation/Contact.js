import mongoose from 'mongoose';
import { baseSchemaPlugin } from '../baseSchema.js';

const PhoneEntrySchema = new mongoose.Schema(
  { number: { type: String, required: true, trim: true }, label: { type: String, default: 'mobile' }, primary: { type: Boolean, default: false } },
  { _id: true }
);

const EmailEntrySchema = new mongoose.Schema(
  { address: { type: String, required: true, trim: true, lowercase: true }, label: { type: String, default: 'work' }, primary: { type: Boolean, default: false } },
  { _id: true }
);

const AddressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'primary' },
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    primary: { type: Boolean, default: false },
  },
  { _id: true }
);

const SocialProfileSchema = new mongoose.Schema(
  { platform: { type: String, enum: ['linkedin', 'twitter', 'facebook', 'instagram', 'website', 'other'] }, url: String },
  { _id: true }
);

const ContactSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    type: { type: String, enum: ['personal', 'business'], default: 'personal' },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true, default: '' },
    fullName: { type: String, trim: true },
    jobTitle: { type: String, trim: true },
    department: { type: String, trim: true },
    phones: [PhoneEntrySchema],
    emails: [EmailEntrySchema],
    addresses: [AddressSchema],
    socialProfiles: [SocialProfileSchema],
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    tags: [{ type: String, trim: true }],
    customFields: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    source: { type: String, default: 'manual' },
    archived: { type: Boolean, default: false },
    avatar: String,
    notes: String,
  },
  { timestamps: true }
);

ContactSchema.plugin(baseSchemaPlugin);

ContactSchema.pre('save', function setFullName() {
  this.fullName = [this.firstName, this.lastName].filter(Boolean).join(' ').trim();
});

ContactSchema.index({ businessId: 1, fullName: 1 });
ContactSchema.index({ businessId: 1, 'emails.address': 1 });
ContactSchema.index({ businessId: 1, 'phones.number': 1 });
ContactSchema.index({ businessId: 1, companyId: 1 });
ContactSchema.index({ businessId: 1, archived: 1, updatedAt: -1 });

export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
