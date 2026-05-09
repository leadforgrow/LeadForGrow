/**
 * Parses Meta WhatsApp Webhook payload into a normalized object
 */
export function parseMetaWebhook(payload) {
  try {
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const metadata = value?.metadata;
    const contact = value?.contacts?.[0];
    const message = value?.messages?.[0];

    if (!message) return null;

    const normalized = {
      businessPhoneNumber: metadata?.display_phone_number,
      phoneNumberId: metadata?.phone_number_id,
      senderName: contact?.profile?.name,
      senderId: message?.from, // The wa_id
      messageId: message?.id,
      timestamp: new Date(parseInt(message?.timestamp) * 1000),
      type: message?.type,
      raw: message,
      referral: null
    };

    // Extract Message Content
    switch (message.type) {
      case 'text':
        normalized.body = message.text?.body;
        break;
      case 'image':
      case 'video':
      case 'audio':
      case 'document':
      case 'sticker':
        const media = message[message.type];
        normalized.body = message.caption || `Sent a ${message.type}`;
        normalized.mediaId = media?.id;
        normalized.mimeType = media?.mime_type;
        normalized.fileName = media?.filename || (message.type === 'image' ? 'image.jpg' : 'file');
        break;
      case 'button':
        normalized.body = message.button?.text;
        break;
      case 'interactive':
        const interactive = message.interactive;
        normalized.body = interactive.button_reply?.title || interactive.list_reply?.title;
        break;
      default:
        normalized.body = `Received ${message.type} message`;
    }

    // Extract Referral Data (AD ATTRIBUTION)
    if (message.referral) {
      normalized.referral = {
        sourceType: message.referral.source_type,
        adId: message.referral.ad_id,
        headline: message.referral.headline,
        body: message.referral.body,
        sourceUrl: message.referral.source_url,
        mediaType: message.referral.image?.media_type || message.referral.video?.media_type
      };
    }

    return normalized;
  } catch (error) {
    console.error('[Parser] Error parsing Meta payload:', error);
    return null;
  }
}
