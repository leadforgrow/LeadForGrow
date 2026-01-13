import crypto from 'crypto';

/**
 * lib/encryption.js
 * AES-256-GCM encryption utility for secure credential storage.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

// Secret key must be 32 bytes.
// In production, this MUST be set via environment variable.
const SECRET_KEY = process.env.ENCRYPTION_SECRET || 'lfg_default_secret_32_bytes_long_'; 

/**
 * Encrypts cleartext into a base64 encoded string containing [IV][Tag][EncryptedContent]
 * @param {string} text Cleartext to encrypt
 * @returns {string|null} Base64 encoded encrypted data
 */
export function encrypt(text) {
  if (!text) return null;
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY.slice(0, 32)), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const tag = cipher.getAuthTag().toString('base64');
    
    // Format: IV:Tag:EncryptedContent
    return `${iv.toString('base64')}:${tag}:${encrypted}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
}

/**
 * Decrypts a base64 encoded string back into cleartext
 * @param {string} encryptedData Data in format [IV]:[Tag]:[EncryptedContent]
 * @returns {string|null} Decrypted cleartext
 */
export function decrypt(encryptedData) {
  if (!encryptedData) return null;
  
  try {
    const [ivBase64, tagBase64, encryptedText] = encryptedData.split(':');
    
    if (!ivBase64 || !tagBase64 || !encryptedText) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(ivBase64, 'base64');
    const tag = Buffer.from(tagBase64, 'base64');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY.slice(0, 32)), iv);
    
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}
