import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    provider: { type: String, enum: ['stripe', 'razorpay', 'manual'], default: 'manual' },
    externalId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['draft', 'open', 'paid', 'void', 'uncollectible'],
      default: 'open',
    },
    pdfUrl: String,
    hostedUrl: String,
    periodStart: Date,
    periodEnd: Date,
    paidAt: Date,
    lineItems: [
      {
        description: String,
        amount: Number,
        quantity: { type: Number, default: 1 },
      },
    ],
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

InvoiceSchema.index({ businessId: 1, createdAt: -1 });
InvoiceSchema.index({ externalId: 1 }, { sparse: true });

export default mongoose.models.BillingInvoice ||
  mongoose.model('BillingInvoice', InvoiceSchema);
