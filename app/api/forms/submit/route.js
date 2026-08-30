import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Form from '@/models/Form';
import { ingestLead } from '@/lib/leadProcessor';
import { linkConsentToLead } from '@/lib/consent/server';
import {
  ensureMasterContactFormBinding,
  isMasterContactFormToken,
} from '@/lib/publicForms.server';

// Utility for CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-user-id',
};

import { withRateLimit } from '@/lib/rateLimit';

/**
 * POST /api/forms/submit
 * Universal endpoint for LeadForGrow Form Submissions (Native & Embedded)
 */
export const POST = withRateLimit(5, 60, async function (request) {
  try {
    const body = await request.json();
    const { token, ...formData } = body;

    const {
      visitorId,
      cookieConsent,
      analyticsAllowed,
      marketingAllowed,
      consentVersion,
      consentDecidedAt,
      ...leadFields
    } = formData;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Form token is required' }, {
        status: 400,
        headers: corsHeaders
      });
    }

    await dbConnect();

    // For the reserved LeadForGrow "master" token, self-heal the Form <-> Business
    // binding so leadforgrow.com submissions always land in the LeadForGrow inbox,
    // even if the DB was seeded/imported from another environment.
    if (isMasterContactFormToken(token)) {
      const healed = await ensureMasterContactFormBinding(token);
      if (healed.status === 'repointed' || healed.status === 'created') {
        console.log(`[Form Submit] Master token binding ${healed.status} to LeadForGrow business.`);
      } else if (healed.status === 'missing_business') {
        console.error(
          '[Form Submit] Cannot self-heal master contact form: LeadForGrow business not found.'
        );
      }
    }

    // 1. Resolve Form and Business via token
    console.log('[Form Submit Debug] Received token:', token);
    const form = await Form.findOne({ token, active: true });
    console.log('[Form Submit Debug] Query result:', form ? `Found form: ${form.name}` : 'Form NOT FOUND');

    if (!form) {
      console.log('[Form Submit Debug] 404 Error: Invalid or inactive form');
      return NextResponse.json({ success: false, error: 'Invalid or inactive form' }, {
        status: 404,
        headers: corsHeaders
      });
    }

    // 2. Extract client metadata
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const sourcePage = request.headers.get('referer') || '';

    // 3. Hand off to the Unified Ingestion Engine
    const workspaceId = form.businessId || form.clientId;
    const consentMeta = {
      visitorId: visitorId || null,
      cookieConsent: cookieConsent || 'unknown',
      analyticsAllowed: analyticsAllowed === true,
      marketingAllowed: marketingAllowed === true,
      consentVersion: consentVersion || null,
      consentDecidedAt: consentDecidedAt || null,
      suppressMarketingAutomation: cookieConsent === 'denied' || marketingAllowed === false,
    };

    const result = await ingestLead(leadFields, workspaceId, {
      source: 'form',
      sourceDetails: `Form: ${form.name}`,
      formId: form._id,
      ipAddress,
      sourcePage,
      extra: {
        formName: form.name,
        formToken: token,
        ...consentMeta,
      },
    });

    if (result?.leadId && visitorId) {
      await linkConsentToLead({
        token,
        visitorId,
        leadId: result.leadId,
        email: leadFields.email,
        phone: leadFields.phone,
      });
    }

    // 4. Update form analytics
    await form.recordSubmission();

    // 5. Response (Generic to prevent leaking internal business data)
    return NextResponse.json({
      success: true,
      message: form.successMessage || 'Thank you! We have received your inquiry.',
      redirectUrl: form.redirectUrl || null
    }, {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('[Form Submission API] Error:', error);

    // Known ingestLead failures map to clear 4xx responses instead of a generic 500.
    const msg = error?.message || '';
    const knownClientErrors = [
      'Workspace not found',
      'Business is inactive',
      'Agency is inactive or not found',
      'Monthly lead limit reached',
      'Agency monthly lead limit reached',
      'Lead must have either email or phone number',
    ];
    if (knownClientErrors.includes(msg)) {
      return NextResponse.json(
        { success: false, error: msg },
        { status: 400, headers: corsHeaders }
      );
    }

    // In non-production, surface the real error to speed up debugging.
    const isProd = process.env.NODE_ENV === 'production';
    return NextResponse.json(
      {
        success: false,
        error: isProd ? 'Submission failed. Please try again later.' : msg || 'Submission failed.',
      },
      { status: 500, headers: corsHeaders }
    );
  }
});

/**
 * OPTIONS - Handle CORS for embedded forms
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-user-id',
    },
  });
}
