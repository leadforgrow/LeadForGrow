/**
 * Meta WhatsApp Cloud API - Attribution Parser
 * Extracts Click-to-WhatsApp (CTWA) ad metadata from incoming webhook payloads.
 */

export function parseWhatsAppReferral(message) {
    const referral = message.referral;
    
    if (!referral) {
        return {
            isAd: false,
            source: 'whatsapp',
            sourceDetails: 'Organic WhatsApp Message'
        };
    }

    const {
        source_url,
        source_id,
        source_type,
        headline,
        body,
        media_type,
        video_url,
        image_url
    } = referral;

    // Detect platform from source_url
    let platform = 'facebook_ad';
    if (source_url && source_url.includes('instagram.com')) {
        platform = 'instagram_ad';
    }

    return {
        isAd: true,
        source: platform,
        sourceDetails: `Ad: ${headline || source_id}`,
        adMetadata: {
            adId: source_id,
            adHeadline: headline,
            adSourceType: source_type,
            referralData: {
                source_url,
                body,
                media_type,
                video_url,
                image_url
            }
        }
    };
}

/**
 * Extracts contact information and message data from the webhook payload.
 */
export function extractWhatsAppPayload(payload) {
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    
    if (!value || !value.messages) return null;

    const message = value.messages[0];
    const contact = value.contacts?.[0];
    
    return {
        businessId: value.metadata?.display_phone_number, // The business number receiving the message
        fromPhone: message.from,
        fromName: contact?.profile?.name || 'WhatsApp User',
        messageId: message.id,
        timestamp: new Date(parseInt(message.timestamp) * 1000),
        text: message.text?.body || '',
        referral: message.referral || null,
        rawMessage: message
    };
}
