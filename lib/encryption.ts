import crypto from 'crypto';

// Hash the ENCRYPTION_KEY to make sure it is exactly 32 bytes (256 bits) for AES-256
const ENCRYPTION_KEY = crypto.createHash('sha256')
  .update(process.env.ENCRYPTION_KEY || 'default-secret-key-change-me-in-production')
  .digest();

const IV_LENGTH = 16; // For AES-256-CBC, the IV size is always 16 bytes

export function encrypt(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  // Trả về định dạng: iv_hex:encrypted_hex
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
  if (!text) return '';
  try {
    const parts = text.split(':');
    if (parts.length !== 2) {
      // Tương thích ngược: Nếu mật khẩu không ở định dạng mã hóa (legacy plain text), trả về nguyên bản
      return text;
    }
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err) {
    console.error('Decryption failed, returning original text:', err);
    return text;
  }
}
