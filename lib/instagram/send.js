import Business from '@/models/Business';

/**
 * Send Instagram DM via Meta Graph API
 */
export async function sendInstagramMessage(business, recipientId, text) {
  const igUserId = business.integrationCredentials?.instagram?.pageId
    || business.integrationCredentials?.instagram?.igUserId
    || business.integrationCredentials?.facebookAds?.pageId;
  const token = business.integrationCredentials?.instagram?.accessToken
    || business.integrationCredentials?.facebookAds?.accessToken
    || business.integrationCredentials?.facebookAds?.pageAccessToken;

  if (!igUserId || !token || !recipientId) {
    return { success: false, error: 'Instagram not configured' };
  }

  const url = `https://graph.facebook.com/v21.0/${igUserId}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return { success: false, error: data.error?.message || 'Instagram send failed' };
  }

  return { success: true, messageId: data.message_id };
}

export async function sendInstagramMedia(business, recipientId, { mediaUrl, messageType }) {
  const igUserId = business.integrationCredentials?.instagram?.pageId
    || business.integrationCredentials?.instagram?.igUserId
    || business.integrationCredentials?.facebookAds?.pageId;
  const token = business.integrationCredentials?.instagram?.accessToken
    || business.integrationCredentials?.facebookAds?.accessToken;

  if (!igUserId || !token || !recipientId) {
    return { success: false, error: 'Instagram not configured' };
  }

  const attachmentType = messageType === 'video' ? 'video' : 'image';
  const url = `https://graph.facebook.com/v21.0/${igUserId}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: {
        attachment: {
          type: attachmentType,
          payload: { url: mediaUrl },
        },
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return { success: false, error: data.error?.message || 'Instagram media send failed' };
  }

  return { success: true, messageId: data.message_id };
}

export default { sendInstagramMessage, sendInstagramMedia };
