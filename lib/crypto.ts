import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM tiêu chuẩn dùng 12 bytes cho IV

// Lấy key từ biến môi trường (32 bytes = 64 ký tự hex)
const getEncryptionKey = (): Buffer => {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error('ENCRYPTION_KEY is not defined in environment variables');
  }
  
  const key = Buffer.from(keyHex, 'hex');
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters)');
  }
  
  return key;
};

/**
 * Mã hóa một chuỗi văn bản (ví dụ: API Key)
 * Định dạng trả về: iv:authTag:encryptedText
 */
export function encrypt(text: string): string {
  if (!text) return text;

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Nối các phần lại với dấu ':'
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Giải mã chuỗi đã mã hóa
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText;

  // Nếu không đúng định dạng (không có 2 dấu 2 chấm), có thể là chuỗi plaintext cũ, ném lỗi hoặc trả về nguyên gốc.
  // Ở đây chọn cách an toàn: nếu không có định dạng đúng thì ném lỗi để tránh rò rỉ hoặc dùng nhầm
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    // Có thể chuỗi này là plaintext cũ. Nếu muốn tương thích ngược, return encryptedText.
    // Nhưng vì ta đã quyết định mã hóa mạnh tay, nếu không đúng format thì không cho dùng.
    throw new Error('Invalid encrypted text format');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
