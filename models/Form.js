import mongoose from 'mongoose';

const FormFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio'],
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    trim: true
  },
  options: [{
    type: String,
    trim: true
  }], // For select, radio, checkbox
  validation: {
    pattern: String,
    minLength: Number,
    maxLength: Number,
    message: String
  }
}, { _id: false });

const FormSchema = new mongoose.Schema({
  // Business Context
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  
  // Form Identity
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Secure Token for Submissions
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Form Configuration
  fields: {
    type: [FormFieldSchema],
    default: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'phone', label: 'Phone Number', type: 'phone', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: false },
      { name: 'message', label: 'Message', type: 'textarea', required: false }
    ]
  },
  
  // Embed Code (generated)
  embedCode: {
    type: String
  },
  
  // Status
  active: {
    type: Boolean,
    default: true
  },
  
  // Analytics
  submissionCount: {
    type: Number,
    default: 0
  },
  lastSubmissionAt: {
    type: Date
  },
  
  // Customization
  styling: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'custom'],
      default: 'light'
    },
    primaryColor: {
      type: String,
      default: '#4F46E5' // Indigo
    },
    buttonText: {
      type: String,
      default: 'Submit'
    }
  },
  
  // Success Configuration
  successMessage: {
    type: String,
    default: 'Thank you! We will get back to you soon.'
  },
  redirectUrl: {
    type: String,
    trim: true
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
FormSchema.index({ businessId: 1, active: 1 });
FormSchema.index({ token: 1 }, { unique: true });

// Auto-generate embed code before saving
FormSchema.pre('save', async function() {
  if (this.isNew || this.isModified('token') || this.isModified('fields')) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com';
    this.embedCode = `<!-- LeadForGrow Form -->
<div id="lfg-form-${this._id}"></div>
<script>
  (function() {
    const formData = ${JSON.stringify({
      token: this.token,
      fields: this.fields,
      styling: this.styling
    })};
    // Form rendering logic here
    console.log('LeadForGrow Form loaded:', formData);
  })();
</script>
<!-- End LeadForGrow Form -->`;
  }
});

// Method to increment submission count
FormSchema.methods.recordSubmission = async function() {
  this.submissionCount += 1;
  this.lastSubmissionAt = new Date();
  await this.save();
};

export default mongoose.models.Form || mongoose.model('Form', FormSchema);
