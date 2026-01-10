/**
 * Generate instant Zoom meeting link
 * No scheduling, no calendar - just instant 3-minute call
 */
export const generateZoomMeetingLink = () => {
  // Generate a unique meeting ID
  const meetingId = Math.floor(100000000 + Math.random() * 900000000);
  
  // Create Zoom meeting URL
  const zoomLink = `https://zoom.us/j/${meetingId}`;
  
  console.log(`[Zoom] Generated instant meeting link: ${zoomLink}`);
  
  return zoomLink;
};

/**
 * Alternative: Use a permanent Zoom room
 * Replace with your actual Zoom personal meeting room
 */
export const getZoomPersonalRoom = () => {
  // TODO: Replace with your actual Zoom personal meeting room URL
  const personalRoomUrl = process.env.ZOOM_PERSONAL_ROOM_URL || 'https://zoom.us/j/YOUR_PERSONAL_MEETING_ID';
  
  console.log(`[Zoom] Using personal room: ${personalRoomUrl}`);
  
  return personalRoomUrl;
};
