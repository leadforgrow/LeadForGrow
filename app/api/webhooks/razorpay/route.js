import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Bill from '@/models/automation/Bill';
import Business from '@/models/Business';
import { verifyRazorpaySignature } from '@/lib/payments/razorpay';
import { decrypt } from '@/lib/encryption';

/**
 * POST /api/webhooks/razorpay
 *
 * Razorpay hits this URL when a payment link changes state. We verify the
 * signature against the business's stored webhookSecret and — for the
 * events that matter — flip the corresponding bill to paid.
 *
 * Setup path (told to the user in the Payment settings screen):
 *   1. Razorpay dashboard → Settings → Webhooks → Create
 *   2. URL: https://leadforgrow.com/api/webhooks/razorpay
 *   3. Secret: whatever you paste into LFG's Razorpay Webhook Secret field
 *   4. Events: payment_link.paid, payment_link.expired, payment_link.cancelled
 *
 * Multi-tenant challenge: Razorpay doesn't tell us WHICH business the
 * event came from — same URL, different accounts. We use the notes we set
 * at link creation (businessId, billId) to route the event back to the
 * right business + bill without ambiguity. If notes are missing we still
 * try to look up by paymentLink.id which is globally unique.
 */
export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    // Parse the payload — even before signature verification we need to see
    // the notes to know which business to look up the secret for.
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: 'Malformed payload' }, { status: 400 });
    }

    const event = payload.event || '';
    const link = payload.payload?.payment_link?.entity || payload.payload?.order?.entity || {};
    const notes = link.notes || {};
    const businessIdFromNotes = notes.businessId;

    await dbConnect();

    // Resolve which business this event belongs to
    let business = null;
    if (businessIdFromNotes) {
      business = await Business.findById(businessIdFromNotes).select('integrationCredentials.razorpay businessName').lean();
    } else if (link.id) {
      // Fallback — locate the bill by the payment link id
      const bill = await Bill.findOne({ 'paymentLink.id': link.id }).select('businessId').lean();
      if (bill) business = await Business.findById(bill.businessId).select('integrationCredentials.razorpay businessName').lean();
    }
    if (!business) return NextResponse.json({ success: false, error: 'Business not resolved' }, { status: 404 });

    const encryptedSecret = business.integrationCredentials?.razorpay?.webhookSecret;
    if (!encryptedSecret) {
      // We're not configured to verify — reject rather than silently trust
      return NextResponse.json({ success: false, error: 'Webhook secret not configured' }, { status: 400 });
    }
    let webhookSecret;
    try { webhookSecret = decrypt(encryptedSecret); }
    catch { return NextResponse.json({ success: false, error: 'Bad webhook secret' }, { status: 500 }); }

    if (!verifyRazorpaySignature({ rawBody, signature, webhookSecret })) {
      return NextResponse.json({ success: false, error: 'Signature mismatch' }, { status: 401 });
    }

    // ── Route the event ────────────────────────────────────────────────
    const bill = await Bill.findOne({
      businessId: business._id,
      'paymentLink.id': link.id,
    });
    if (!bill) return NextResponse.json({ success: true, ignored: 'unknown_bill' });

    if (event === 'payment_link.paid' && bill.status !== 'paid') {
      bill.status = 'paid';
      bill.paidAt = new Date();
      bill.paymentNote = 'Paid via Razorpay Payment Link';
      if (bill.paymentLink) {
        bill.paymentLink.status = 'paid';
        bill.paymentLink.paidAt = new Date();
      }
      await bill.save();
    } else if (event === 'payment_link.cancelled') {
      if (bill.paymentLink) bill.paymentLink.status = 'cancelled';
      await bill.save();
    } else if (event === 'payment_link.expired') {
      if (bill.paymentLink) bill.paymentLink.status = 'expired';
      await bill.save();
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Razorpay webhook]', err);
    return NextResponse.json({ success: false, error: 'Handler failed' }, { status: 500 });
  }
}
