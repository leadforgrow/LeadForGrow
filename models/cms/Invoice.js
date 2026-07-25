import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CMS_Client',
    required: true,
    index: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue', 'Cancelled'],
    default: 'Pending'
  },
  dueDate: Date,
  paidAt: Date,
  billingPeriod: {
    start: Date,
    end: Date
  },
  description: String,
  items: [{
    description: String,
    amount: Number
  }]
}, {
  timestamps: true,
  collection: 'cms_invoices'
});

InvoiceSchema.index({ businessId: 1, status: 1 });
InvoiceSchema.index({ businessId: 1, clientId: 1 });
InvoiceSchema.index({ businessId: 1, createdAt: -1 });

export default mongoose.models.CMS_Invoice || mongoose.model('CMS_Invoice', InvoiceSchema);
