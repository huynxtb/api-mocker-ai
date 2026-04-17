import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const ENCODING: BufferEncoding = 'hex';

let cachedKey: Buffer | null = null;

function getEncryptionKey(): Buffer {
  if (cachedKey) return cachedKey;

  let key = process.env.ENCRYPTION_KEY;
  if (!key) {
    // Auto-generate and log warning
    key = crypto.randomBytes(32).toString('hex');
    process.env.ENCRYPTION_KEY = key;
    console.warn('ENCRYPTION_KEY not set — auto-generated for this session. Set ENCRYPTION_KEY env to persist across restarts.');
  }
  cachedKey = key.length === 64
    ? Buffer.from(key, 'hex')
    : crypto.createHash('sha256').update(key).digest();
  return cachedKey;
}

export function encrypt(plaintext: string): string {
  if (!plaintext) return '';

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', ENCODING);
  encrypted += cipher.final(ENCODING);

  const tag = cipher.getAuthTag();

  // Format: iv:tag:ciphertext
  return `${iv.toString(ENCODING)}:${tag.toString(ENCODING)}:${encrypted}`;
}

export function decrypt(ciphertext: string): string {
  if (!ciphertext) return '';

  if (!ciphertext.includes(':')) {
    return ciphertext;
  }

  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    return ciphertext;
  }

  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(parts[0]!, ENCODING);
    const tag = Buffer.from(parts[1]!, ENCODING);
    const encrypted = parts[2]!;

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, ENCODING, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch {
    return ciphertext;
  }
}

export function maskApiKey(key: string): string {
  if (!key) return '';
  const decrypted = decrypt(key);
  if (decrypted.length <= 12) return '****';
  return `${decrypted.substring(0, 4)}${'*'.repeat(Math.min(20, decrypted.length - 8))}${decrypted.substring(decrypted.length - 4)}`;
}
