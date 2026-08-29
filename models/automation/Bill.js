import mongoose from 'mongoose';

/**
 * Bill — a lightweight, WhatsApp-shippable customer invoice.
 *
 * NOT a GST-compliant tax invoice: no HSN codes, no IRN, no e-invoice
 * portal integration. The name "invoice" in Indian SMB parlance usually
 * means "a nice-looking bill I can send to the customer" — that's this
 * model. If a business needs GST-compliant tax invoices they keep using
 * Vyapar / Zoho Books alongside LFG.
 *
 * Optional GST fields exist for display-only (owner types their GSTIN,
 * picks a tax rate, the PDF shows the tax line) — no compliance validation,
 * no filing, no HSN codes. Intentional scope guard.
 */

const LineItemSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  quantity:    { type: Number, default: 1, min: 0 },
  rate:        { type: Number, default: 0, min: 0 },     // per-unit price
  amount:      { type: Number, default: 0, min: 0 },     // quantity * rate — precomputed at save
}, { _id: true });

const BillSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  // The bill number surfaced to the customer, e.g. "PG-2026-001".
  // Auto-generated at create time from a per-business counter — sequential
  // per business (not global) so businesses don't leak volume to each other.
  billNumber: { type: String, required: true, trim: true },

  // Optional CRM linkage — populated when a bill is generated from a chat /
  // deal, empty when created standalone. Enables "show all bills for this
  // lead" and auto-fill on the create form.
  leadId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', index: true },
  dealId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', index: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },

  // Customer snapshot at bill time. Duplicated rather than joined so a
  // renamed / deleted lead doesn't retroactively change a historic bill.
  customerName:  { type: String, required: true, trim: true },
  customerPhone: { type: String, trim: true },
  customerEmail: { type: String, trim: true },

  // Line items + totals — server recomputes at save so client can't lie.
  lineItems: {
    type: [LineItemSchema],
    validate: (arr) => Array.isArray(arr) && arr.length > 0,
  },
  subtotal: { type: Number, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0 },        // absolute rupees off
  taxRate:  { type: Number, default: 0, min: 0, max: 100 }, // percentage, applied after discount
  taxAmount:{ type: Number, default: 0, min: 0 },        // subtotal-discount × taxRate/100
  total:    { type: Number, default: 0, min: 0 },

  notes:     { type: String, trim: true, maxlength: 1000 }, // "Thanks for your business!" free text
  currency:  { type: String, default: 'INR', enum: ['INR'] },

  // Display-only GST info — no compliance work, just prints on the PDF.
  gstNumber: { type: String, trim: true },

  // Lifecycle
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'paid', 'void'],
    default: 'draft',
    index: true,
  },
  pdfUrl: { type: String, trim: true },   // Cloudinary URL, set after first PDF generation

  sentAt:      { type: Date },
  paidAt:      { type: Date },
  paymentNote: { type: String, trim: true }, // "UPI ref 4xxxxx" or "Cash" when marked paid

  // Razorpay Payment Link — populated when the owner clicks "Send payment
  // link". We never touch money; the link takes the customer straight to
  // Razorpay's hosted page and settles directly to the business's bank.
  paymentLink: {
    id:        { type: String, trim: true },      // Razorpay plink_… id
    shortUrl:  { type: String, trim: true },      // rzp.io/i/xxxx
    status:    { type: String, trim: true },      // created / partially_paid / paid / cancelled / expired (mirrors Razorpay)
    createdAt: { type: Date },
    paidAt:    { type: Date },
    lastAmount:{ type: Number },                  // amount the link was generated for, in rupees
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

BillSchema.index({ businessId: 1, createdAt: -1 });
BillSchema.index({ businessId: 1, status: 1, createdAt: -1 });
BillSchema.index({ businessId: 1, billNumber: 1 }, { unique: true });

// Server-side total math — do NOT trust whatever total the client sent.
// Same reason the /register endpoint re-validates password policy: the
// client is UX, not authority.
BillSchema.pre('save', function recalcTotals() {
  let subtotal = 0;
  for (const item of this.lineItems || []) {
    const q = Number(item.quantity) || 0;
    const r = Number(item.rate) || 0;
    item.amount = Math.round(q * r * 100) / 100;
    subtotal += item.amount;
  }
  this.subtotal = Math.round(subtotal * 100) / 100;

  const discount = Math.max(0, Math.min(Number(this.discount) || 0, this.subtotal));
  this.discount = Math.round(discount * 100) / 100;

  const afterDiscount = this.subtotal - this.discount;
  const taxRate = Math.max(0, Math.min(Number(this.taxRate) || 0, 100));
  this.taxAmount = Math.round(afterDiscount * (taxRate / 100) * 100) / 100;

  this.total = Math.round((afterDiscount + this.taxAmount) * 100) / 100;
});

export default mongoose.models.Bill || mongoose.model('Bill', BillSchema);
