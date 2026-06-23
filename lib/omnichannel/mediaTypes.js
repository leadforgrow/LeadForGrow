const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg'];
const AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/webm', 'audio/mp4'];
const DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
];

export const ALLOWED_MIME_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES, ...AUDIO_TYPES, ...DOC_TYPES];

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export function mimeToMessageType(mime = '', fileName = '') {
  const m = mime.toLowerCase();
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (IMAGE_TYPES.includes(m) || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
  if (VIDEO_TYPES.includes(m) || ['mp4', 'mov', 'webm', 'avi'].includes(ext)) return 'video';
  if (AUDIO_TYPES.includes(m) || ['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(ext)) return 'audio';
  if (m === 'application/pdf' || ext === 'pdf') return 'document';
  return 'document';
}

export function whatsappMediaType(messageType) {
  if (messageType === 'image') return 'image';
  if (messageType === 'video') return 'video';
  if (messageType === 'audio') return 'audio';
  return 'document';
}

export function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
