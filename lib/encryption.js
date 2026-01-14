import crypto from 'crypto';

/**
 * Encryption Utility for Business Email Credentials
 * Uses AES-256-CBC encryption for storing SMTP passwords securely
 */

// Use environment variable or generate a secure key (MUST be 32 bytes for AES-256)
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    console.warn('[Encryption] No ENCRYPTION_KEY found in environment, using a random one. (Not recommended for production)');
    return crypto.randomBytes(32);
  }
  
  const buffer = Buffer.from(key, 'hex');
  if (buffer.length !== 32) {
    console.error(`[Encryption][ERROR] Invalid key length: ${buffer.length} bytes (expected 32). Key string length: ${key.length}`);
    // Return a random one for now to prevent crash, but this will break existing decryptions
    return crypto.randomBytes(32);
  }
  
  return buffer;
};

const ENCRYPTION_KEY = getEncryptionKey();
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypt a plaintext password
 * @param {string} text - The plaintext password
 * @returns {string} - Encrypted password in format: iv:encryptedData
 */
export function encrypt(text) {
  if (!text) return '';
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV + encrypted data (separated by :)
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('[Encryption] Error encrypting:', error.message);
    throw new Error('Failed to encrypt password');
  }
}

/**
 * Decrypt an encrypted password
 * @param {string} text - The encrypted password in format: iv:encryptedData
 * @returns {string} - Decrypted plaintext password
 */
export function decrypt(text) {
  if (!text) return '';
  
  try {
    const parts = text.split(':');
    if (parts.length !== 2) {
      console.warn('[Encryption] Password not in encrypted format, returning as-is (Potential legacy data)');
      return text;
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[Encryption] ❌ DECRYPTION FAILED. This usually happens if the ENCRYPTION_KEY was changed.');
    console.error('[Encryption] Error detail:', error.message);
    // DO NOT return the encrypted text, as it will be sent as a password and fail auth
    return null; 
  }
}

/**
 * Check if a string is encrypted
 * @param {string} text - The text to check
 * @returns {boolean} - True if encrypted format detected
 */
export function isEncrypted(text) {
  if (!text) return false;
  const parts = text.split(':');
  return parts.length === 2 && parts[0].length === 32 && /^[0-9a-f]+$/i.test(parts[0]);
}
