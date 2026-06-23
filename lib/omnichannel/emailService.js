import { sendBusinessEmail } from '@/lib/businessMailer';
import EmailAccount from '@/models/omnichannel/EmailAccount';
import EmailThread from '@/models/omnichannel/EmailThread';
import { dbConnect } from '@/lib/mongodb';
import { recordChannelMessage } from '@/lib/omnichannel/conversationService';

export async function sendChannelEmail({ business, lead, conversation, subject, body, replyToMessageId, cc, bcc, attachments = [], isHtml = false }) {
  await dbConnect();

  const to = lead.email || conversation?.participantEmail;
  if (!to) {
    return { success: false, error: 'No email address for recipient' };
  }

  let account = await EmailAccount.findOne({ businessId: business._id, isDefault: true });
  if (!account && business.integrationCredentials?.email) {
    const creds = business.integrationCredentials.email;
    account = {
      email: creds.fromEmail || creds.username,
      smtp: creds,
      signature: creds.signature,
    };
  }

  const html = isHtml
    ? `${body}${account?.signature ? `<br><br>${account.signature}` : ''}`
    : `${body.replace(/\n/g, '<br>')}${account?.signature ? `<br><br>${account.signature}` : ''}`;

  const result = await sendBusinessEmail(business, {
    to,
    subject,
    html,
    text: isHtml ? body.replace(/<[^>]+>/g, '') : body,
    cc: cc?.map((c) => c.email || c).filter(Boolean),
    bcc: bcc?.map((c) => c.email || c).filter(Boolean),
    attachments: attachments.map((a) => ({
      filename: a.fileName || a.filename,
      path: a.url,
      contentType: a.mimeType,
    })),
  });

  if (!result.success) {
    return { success: false, error: result.error || 'Email send failed' };
  }

  const messageId = `email_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  let thread = conversation?.emailThreadId
    ? await EmailThread.findById(conversation.emailThreadId)
    : null;

  if (!thread) {
    thread = await EmailThread.create({
      businessId: business._id,
      emailAccountId: account?._id,
      conversationId: conversation?._id,
      leadId: lead._id,
      subject,
      participants: [{ email: to, name: lead.name }],
      externalThreadId: messageId,
      lastMessageAt: new Date(),
      messageCount: 1,
    });
  } else {
    thread.messageCount += 1;
    thread.lastMessageAt = new Date();
    await thread.save();
  }

  return { success: true, messageId, threadId: thread._id };
}

export async function ingestInboundEmail(businessId, {
  from,
  fromName,
  subject,
  body,
  html,
  externalMessageId,
  threadId,
  timestamp = new Date(),
}) {
  const { matchCustomer } = await import('@/lib/omnichannel/customerMatching');
  const matched = await matchCustomer(businessId, {
    email: from,
    name: fromName,
    channel: 'email',
    createIfMissing: true,
  });

  const { recordChannelMessage } = await import('@/lib/omnichannel/conversationService');

  let thread = threadId
    ? await EmailThread.findOne({ businessId, externalThreadId: threadId })
    : null;

  if (!thread) {
    thread = await EmailThread.create({
      businessId,
      emailAccountId: null,
      leadId: matched.lead._id,
      subject,
      participants: [{ email: from, name: fromName }],
      externalThreadId: threadId || externalMessageId,
      lastMessageAt: timestamp,
      messageCount: 1,
    });
  }

  const { message, conversation } = await recordChannelMessage({
    businessId,
    channel: 'email',
    leadId: matched.lead._id,
    contactId: matched.contact?._id,
    companyId: matched.company?._id,
    dealId: matched.deal?._id,
    messageId: externalMessageId || `email_in_${Date.now()}`,
    direction: 'incoming',
    type: 'email',
    content: {
      body: body || html?.replace(/<[^>]+>/g, '') || '',
      participantId: from,
      participantEmail: from,
      participantName: fromName,
    },
    timestamp,
    subject,
    emailThreadId: thread._id,
  });

  return { message, conversation, lead: matched.lead };
}

export default { sendChannelEmail, ingestInboundEmail };
