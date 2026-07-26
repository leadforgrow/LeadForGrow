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

    // Resolve reply content across all interactive types.
    // - text:        message.text.body
    // - button:      template quick-reply → message.button.text
    // - interactive: button_reply / list_reply → title (+ id)
    let text = '';
    let buttonId = null;
    let listId = null;

    switch (message.type) {
        case 'text':
            text = message.text?.body || '';
            break;
        case 'button':
            // Template quick-reply button
            text = message.button?.text || '';
            buttonId = message.button?.payload || null;
            break;
        case 'interactive': {
            const interactive = message.interactive || {};
            if (interactive.button_reply) {
                text = interactive.button_reply.title || '';
                buttonId = interactive.button_reply.id || null;
            } else if (interactive.list_reply) {
                text = interactive.list_reply.title || '';
                listId = interactive.list_reply.id || null;
            }
            break;
        }
        default:
            text = message.text?.body || message.caption || '';
    }

    return {
        businessId: value.metadata?.display_phone_number, // The business number receiving the message
        fromPhone: message.from,
        fromName: contact?.profile?.name || 'WhatsApp User',
        messageId: message.id,
        timestamp: new Date(parseInt(message.timestamp) * 1000),
        type: message.type || 'text',
        text,
        buttonId,
        listId,
        referral: message.referral || null,
        rawMessage: message
    };
}
