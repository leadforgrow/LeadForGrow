/**
 * Generate instant Google Meet link
 * Prioritizes permanent room from environment variable
 */
export const generateGoogleMeetLink = () => {
  // First, check if there's a permanent room URL in environment
  const permanentRoom = process.env.GOOGLE_MEET_ROOM_URL;
  
  if (permanentRoom && permanentRoom !== 'https://meet.google.com/new') {
    console.log(`[Google Meet] Using permanent room: ${permanentRoom}`);
    return permanentRoom;
  }
  
  // Fallback to instant meeting link
  const instantMeetLink = 'https://meet.google.com/new';
  console.log(`[Google Meet] Using instant meeting link: ${instantMeetLink}`);
  
  return instantMeetLink;
};

/**
 * Get permanent Google Meet room URL
 */
export const getGoogleMeetPersonalRoom = () => {
  return process.env.GOOGLE_MEET_ROOM_URL || 'https://meet.google.com/new';
};
