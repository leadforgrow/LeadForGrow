import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },

  // Multi-tenant: User belongs to a Business or an Agency
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: false
  },
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: false
  },

  // User Role within the Business
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'AGENCY_OWNER', 'CLIENT_ADMIN', 'TEAM_MEMBER', 'VIEW_ONLY', 'super', 'owner', 'admin', 'team_member', 'user'],
    default: 'team_member'
  },

  // Personal Information
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },

  // User Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false }
    },
    language: { type: String, default: 'en' }
  },

  // Status
  active: {
    type: Boolean,
    default: true
  },

  // Last Activity (for round-robin assignment)
  lastActivityAt: {
    type: Date,
    default: Date.now
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Indexes (email unique index is auto-created by unique:true)
UserSchema.index({ businessId: 1, role: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.email.split('@')[0];
});

export default mongoose.models.User || mongoose.model('User', UserSchema);


