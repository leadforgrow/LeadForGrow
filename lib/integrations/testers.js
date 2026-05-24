import { decrypt } from '@/lib/encryption';

export async function testIntegration(integrationId, credentials, business) {
  const start = Date.now();

  try {
    switch (integrationId) {
      case 'whatsapp-cloud':
        return await testWhatsAppMeta(credentials, business);
      case 'interakt':
        return await testInterakt(credentials);
      case 'meta-ads':
        return await testMetaAds(credentials);
      case 'stripe':
        return await testStripe(credentials);
      case 'razorpay':
        return await testRazorpay(credentials);
      case 'webhooks':
        return testWebhooks(credentials, business);
      case 'calendly':
        return await testCalendly(credentials);
      default:
        return await validateOnly(integrationId, credentials, start);
    }
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Connection test failed',
      durationMs: Date.now() - start
    };
  }
}

async function testWhatsAppMeta(credentials, business) {
  const start = Date.now();
  const phoneNumberId = credentials.phoneNumberId;
  const token = credentials.accessToken?.includes(':')
    ? decrypt(credentials.accessToken)
    : credentials.accessToken;

  if (!phoneNumberId || !token) {
    return { success: false, message: 'Phone Number ID and Access Token are required', durationMs: Date.now() - start };
  }

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}?fields=display_phone_number,verified_name`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();

  if (!res.ok) {
    return { success: false, message: data.error?.message || 'Meta API validation failed', durationMs: Date.now() - start };
  }

  return {
    success: true,
    message: `Connected to ${data.verified_name || data.display_phone_number || 'WhatsApp Business'}`,
    durationMs: Date.now() - start,
    accountInfo: { label: data.verified_name, phone: data.display_phone_number, externalId: phoneNumberId }
  };
}

async function testInterakt(credentials) {
  const start = Date.now();
  const apiKey = credentials.apiKey?.includes(':') ? decrypt(credentials.apiKey) : credentials.apiKey;
  if (!apiKey) return { success: false, message: 'API Key is required', durationMs: Date.now() - start };

  const res = await fetch('https://api.interakt.ai/v1/public/track/organization/', {
    headers: { Authorization: `Basic ${apiKey}` }
  });

  if (res.status === 401 || res.status === 403) {
    return { success: false, message: 'Invalid Interakt API key', durationMs: Date.now() - start };
  }

  return {
    success: true,
    message: 'Interakt API key validated',
    durationMs: Date.now() - start,
    accountInfo: { label: credentials.workspaceId || 'Interakt', externalId: credentials.workspaceId }
  };
}

async function testMetaAds(credentials) {
  const start = Date.now();
  const token = credentials.accessToken?.includes(':') ? decrypt(credentials.accessToken) : credentials.accessToken;
  const pageId = credentials.pageId;

  if (!token || !pageId) {
    return { success: false, message: 'Page ID and Access Token are required', durationMs: Date.now() - start };
  }

  const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=name,id`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();

  if (!res.ok) {
    return { success: false, message: data.error?.message || 'Meta Ads validation failed', durationMs: Date.now() - start };
  }

  return {
    success: true,
    message: `Connected to page: ${data.name}`,
    durationMs: Date.now() - start,
    accountInfo: { label: data.name, externalId: data.id }
  };
}

async function testStripe(credentials) {
  const start = Date.now();
  const secretKey = credentials.secretKey?.includes(':') ? decrypt(credentials.secretKey) : credentials.secretKey;
  if (!secretKey?.startsWith('sk_')) {
    return { success: false, message: 'Invalid Stripe secret key format', durationMs: Date.now() - start };
  }

  const res = await fetch('https://api.stripe.com/v1/balance', {
    headers: { Authorization: `Bearer ${secretKey}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { success: false, message: err.error?.message || 'Stripe authentication failed', durationMs: Date.now() - start };
  }

  return { success: true, message: 'Stripe account verified', durationMs: Date.now() - start };
}

async function testRazorpay(credentials) {
  const start = Date.now();
  const keyId = credentials.keyId;
  const keySecret = credentials.keySecret?.includes(':') ? decrypt(credentials.keySecret) : credentials.keySecret;

  if (!keyId || !keySecret) {
    return { success: false, message: 'Key ID and Key Secret are required', durationMs: Date.now() - start };
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const res = await fetch('https://api.razorpay.com/v1/payments?count=1', {
    headers: { Authorization: `Basic ${auth}` }
  });

  if (res.status === 401) {
    return { success: false, message: 'Invalid Razorpay credentials', durationMs: Date.now() - start };
  }

  return { success: true, message: 'Razorpay credentials verified', durationMs: Date.now() - start };
}

function testWebhooks(credentials, business) {
  const start = Date.now();
  if (!business.webhookSecret) {
    return { success: false, message: 'Generate a webhook secret first (connect to enable)', durationMs: Date.now() - start };
  }
  return {
    success: true,
    message: 'Inbound webhook endpoint is configured',
    durationMs: Date.now() - start
  };
}

async function testCalendly(credentials) {
  const start = Date.now();
  const token = credentials.personalAccessToken?.includes(':')
    ? decrypt(credentials.personalAccessToken)
    : credentials.personalAccessToken;

  if (!token) return { success: false, message: 'Personal Access Token is required', durationMs: Date.now() - start };

  const res = await fetch('https://api.calendly.com/users/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();

  if (!res.ok) {
    return { success: false, message: data.message || 'Calendly authentication failed', durationMs: Date.now() - start };
  }

  return {
    success: true,
    message: `Connected as ${data.resource?.name || 'Calendly user'}`,
    durationMs: Date.now() - start,
    accountInfo: { label: data.resource?.name, externalId: data.resource?.uri }
  };
}

async function validateOnly(integrationId, credentials, start) {
  const { validateCredentials } = await import('./catalog');
  const { valid, errors } = validateCredentials(integrationId, credentials);
  if (!valid) {
    return { success: false, message: errors.join(', '), durationMs: Date.now() - start };
  }
  return {
    success: true,
    message: 'Credentials saved and validated (provider test pending)',
    durationMs: Date.now() - start
  };
}

export async function syncIntegration(integrationId, integration, business) {
  // Placeholder for future sync jobs — updates metadata
  return {
    success: true,
    message: `Sync queued for ${integrationId}`,
    recordsProcessed: 0
  };
}
