import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import Subscription from '@/models/billing/Subscription';
import BillingInvoice from '@/models/billing/Invoice';
import { verifyRazorpayWebhook } from '@/lib/billing/razorpay';
import { applyPlanQuotas } from '@/lib/plans';

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    let event;
    try {
      event = verifyRazorpayWebhook(rawBody, signature);
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    await dbConnect();

    const entity = event.payload?.subscription?.entity || event.payload?.payment?.entity;
    const notes = entity?.notes || {};
    const businessId = notes.businessId;
    const planId = notes.planId || 'growth';

    switch (event.event) {
      case 'subscription.activated':
      case 'subscription.charged': {
        if (businessId) {
          await Business.findByIdAndUpdate(businessId, { plan: planId }, { new: true }).then(async (biz) => {
            if (biz) {
              applyPlanQuotas(biz, planId);
              await biz.save();
            }
          });

          await Subscription.findOneAndUpdate(
            { businessId },
            {
              businessId,
              plan: planId,
              status: 'active',
              provider: 'razorpay',
              razorpaySubscriptionId: entity.id,
              razorpayCustomerId: entity.customer_id,
              currentPeriodEnd: entity.current_end ? new Date(entity.current_end * 1000) : undefined,
            },
            { upsert: true }
          );
        }
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.halted': {
        if (entity?.id) {
          await Subscription.findOneAndUpdate(
            { razorpaySubscriptionId: entity.id },
            { status: 'canceled' }
          );
          if (businessId) await Business.findByIdAndUpdate(businessId, { plan: 'free' });
        }
        break;
      }

      case 'payment.failed': {
        if (businessId) {
          await Subscription.findOneAndUpdate({ businessId }, { status: 'past_due' });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.payload?.invoice?.entity;
        if (invoice && businessId) {
          await BillingInvoice.findOneAndUpdate(
            { externalId: invoice.id },
            {
              businessId,
              provider: 'razorpay',
              externalId: invoice.id,
              amount: (invoice.amount_paid || 0) / 100,
              currency: invoice.currency?.toUpperCase() || 'INR',
              status: 'paid',
              paidAt: new Date(),
            },
            { upsert: true }
          );
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Razorpay Webhook]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
