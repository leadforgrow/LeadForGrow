import mongoose from 'mongoose';

/**
 * Invoice Model
 * 
 * Internal invoice tracking system (NOT payment processing).
 * Helps agencies track billing per client and reduce disputes.
 * 
 * ISOLATION: Separate collection, does not affect core billing.
 * IMMUTABILITY: Invoices are immutable once marked as 'paid'.
 */

const InvoiceSchema = new mongoose.Schema({
  // Agency & Client Reference
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true,
    index: true
  },
  
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  
  // Invoice Identity
  invoiceNumber: {
    type: String,
    required: true,
    index: true
    // Format: INV-YYYYMM-XXXXX (auto-generated)
    // NOTE: Unique per agency (enforced by compound index below)
  },
  
  // Financial Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    default: 'INR',
    uppercase: true
  },
  
  // Billing Period
  billingPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
    index: true
  },
  
  // Timestamps
  issuedAt: {
    type: Date
  },
  
  dueAt: {
    type: Date
  },
  
  paidAt: {
    type: Date
  },
  
  // Line Items (Optional)
  lineItems: [{
    description: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      default: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  }],

  // Professional Invoice Details (Snapshot at creation)
  agencyDetails: {
    name: String,
    address: String,
    phone: String,
    email: String,
    website: String
  },
  
  clientDetails: {
    name: String,
    address: String,
    email: String
  },
  
  projectTitle: {
    type: String,
    trim: true
  },
  
  // Notes
  notes: {
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

// Compound Indexes
InvoiceSchema.index({ agencyId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ agencyId: 1, status: 1 });
InvoiceSchema.index({ agencyId: 1, clientId: 1 });
InvoiceSchema.index({ agencyId: 1, createdAt: -1 });

// Pre-save Hook: Prevent modification of paid invoices
InvoiceSchema.pre('save', async function() {
  if (this.isModified() && !this.isNew) {
    const originalStatus = this._original?.status;
    if (originalStatus === 'paid' && this.status === 'paid') {
      const error = new Error('Cannot modify a paid invoice');
      error.code = 'INVOICE_IMMUTABLE';
      throw error;
    }
  }
});

// Methods
InvoiceSchema.methods.markAsSent = function() {
  if (this.status === 'draft') {
    this.status = 'sent';
    this.issuedAt = new Date();
  }
};

InvoiceSchema.methods.markAsPaid = function() {
  if (this.status !== 'paid') {
    this._original = { status: this.status };
    this.status = 'paid';
    this.paidAt = new Date();
  }
};

InvoiceSchema.methods.markAsOverdue = function() {
  if (this.status === 'sent' && this.dueAt && new Date() > this.dueAt) {
    this.status = 'overdue';
  }
};

InvoiceSchema.methods.cancel = function() {
  if (this.status !== 'paid') {
    this.status = 'cancelled';
  }
};

// Static Methods
InvoiceSchema.statics.generateInvoiceNumber = async function(agencyId) {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Find the last invoice for this agency in this month
  const lastInvoice = await this.findOne({
    agencyId,
    invoiceNumber: new RegExp(`^INV-${yearMonth}-[0-9a-f]{4}-`)
  }).sort({ invoiceNumber: -1 });
  
  let sequence = 1;
  const agencySuffix = agencyId.toString().slice(-4); // Use last 4 chars of agency ID for uniqueness
  
  if (lastInvoice) {
    const parts = lastInvoice.invoiceNumber.split('-');
    const lastSequence = parseInt(parts[parts.length - 1]);
    sequence = lastSequence + 1;
  }
  
  return `INV-${yearMonth}-${agencySuffix}-${String(sequence).padStart(5, '0')}`;
};

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
