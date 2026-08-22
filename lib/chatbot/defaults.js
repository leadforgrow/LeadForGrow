export const DEFAULT_CHATBOT_CONFIG = {
  enabled: true,
  published: false,
  appearance: {
    primaryColor: '#0f766e',
    position: 'right',
    botName: 'Support',
    subtitle: 'Typically replies in a few minutes',
    showBranding: true,
  },
  messages: {
    greeting: 'Hi there! 👋 Welcome to our site. May I know your name?',
    thankYou: 'Thank you! Our team will contact you shortly.',
    offlineMessage: 'We are currently away. Leave your details and we will get back to you.',
  },
  flow: {
    collectEmail: true,
    collectPhone: true,
    askSupportType: true,
    aiEnabled: false,
    questions: [
      'What services are you primarily interested in?',
      'How did you hear about us?',
      'What is your estimated budget for this project?',
      'How soon are you looking to get started?',
    ],
  },
  stats: {
    impressions: 0,
    conversationsStarted: 0,
    leadsCaptured: 0,
  },
};

export function mergeChatbotConfig(stored = {}) {
  return {
    enabled: stored.enabled ?? DEFAULT_CHATBOT_CONFIG.enabled,
    published: stored.published ?? DEFAULT_CHATBOT_CONFIG.published,
    appearance: { ...DEFAULT_CHATBOT_CONFIG.appearance, ...(stored.appearance || {}) },
    messages: { ...DEFAULT_CHATBOT_CONFIG.messages, ...(stored.messages || {}) },
    flow: {
      ...DEFAULT_CHATBOT_CONFIG.flow,
      ...(stored.flow || {}),
      questions: stored.flow?.questions?.length
        ? stored.flow.questions
        : DEFAULT_CHATBOT_CONFIG.flow.questions,
    },
    stats: { ...DEFAULT_CHATBOT_CONFIG.stats, ...(stored.stats || {}) },
    lastPublishedAt: stored.lastPublishedAt || null,
  };
}

export function getPublicChatbotConfig(business, config) {
  const merged = mergeChatbotConfig(config);
  if (!merged.enabled || !merged.published) {
    return { active: false };
  }
  return {
    active: true,
    businessName: business.businessName,
    appearance: merged.appearance,
    messages: merged.messages,
    flow: {
      collectEmail: merged.flow.collectEmail,
      collectPhone: merged.flow.collectPhone,
      askSupportType: merged.flow.askSupportType,
      aiEnabled: merged.flow.aiEnabled === true,
      questions: merged.flow.questions.filter(Boolean),
    },
  };
}
