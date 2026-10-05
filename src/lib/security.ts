import crypto from 'crypto';

// Server-side secret key for signing tokens and sessions
const APP_SECRET = process.env.APP_SECRET || process.env.NEXTAUTH_SECRET || 'vindu_cloud_kitchen_sec_key_2026_98d7f8a9e4b3c2d1e0f';

/**
 * Timing-safe string comparison to prevent side-channel timing attacks
 */
export function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');
    if (bufA.length !== bufB.length) {
      // Compare against itself to maintain constant time execution
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically secure HMAC-SHA256 signature for a payload string
 */
export function signPayload(payloadStr: string): string {
  return crypto
    .createHmac('sha256', APP_SECRET)
    .update(payloadStr)
    .digest('base64url');
}

/**
 * Create a signed token containing a JSON payload with an expiration time
 */
export function createSignedToken<T extends Record<string, any>>(payload: T, expiresInSeconds = 60 * 60 * 24 * 7): string {
  const tokenData = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };
  const payloadB64 = Buffer.from(JSON.stringify(tokenData)).toString('base64url');
  const signature = signPayload(payloadB64);
  return `${payloadB64}.${signature}`;
}

/**
 * Verify and decode a signed token
 */
export function verifySignedToken<T extends Record<string, any>>(token: string): T | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSig = signPayload(payloadB64);

  if (!timingSafeCompare(signature, expectedSig)) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const data = JSON.parse(jsonStr);

    // Check expiration
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return data as T;
  } catch {
    return null;
  }
}

/**
 * Password Hashing with PBKDF2 (SHA-512) and salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `pbkdf2$100000$${salt}$${hash}`;
}

/**
 * Verify password against stored hash (supports both PBKDF2 hashes and plain text for backward compatibility)
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;

  if (storedHash.startsWith('pbkdf2$')) {
    const parts = storedHash.split('$');
    if (parts.length === 4) {
      const iterations = parseInt(parts[1], 10);
      const salt = parts[2];
      const expectedHash = parts[3];
      const actualHash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
      return timingSafeCompare(actualHash, expectedHash);
    }
  }

  // Fallback for legacy plain text comparison with constant-time equality
  return timingSafeCompare(password, storedHash);
}

/**
 * Sanitize string against XSS and control characters
 */
export function sanitizeString(input: unknown, maxLength = 1000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>'"&]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case "'": return '&#39;';
        case '"': return '&quot;';
        case '&': return '&amp;';
        default: return char;
      }
    })
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate and sanitize an Indian phone number (10 digits, optional +91 or 0 prefix)
 */
export function validateAndFormatPhone(phone: string): { valid: boolean; formatted: string } {
  if (!phone || typeof phone !== 'string') return { valid: false, formatted: '' };
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const match = cleaned.match(/^(?:\+91|91|0)?([6-9]\d{9})$/);
  if (match && match[1]) {
    return { valid: true, formatted: `+91 ${match[1]}` };
  }
  return { valid: false, formatted: '' };
}

/**
 * Validate an Indian 6-digit Pincode
 */
export function validatePincode(pincode: string): boolean {
  if (!pincode || typeof pincode !== 'string') return false;
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
}

/**
 * Validate Email address format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

/**
 * Validate Date in YYYY-MM-DD format
 */
export function validateDateString(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

/**
 * Magic number validation for uploaded image buffers
 */
export function validateImageMagicBytes(buffer: Buffer): { valid: boolean; mimeType: string } {
  if (!buffer || buffer.length < 12) return { valid: false, mimeType: '' };

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, mimeType: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, mimeType: 'image/png' };
  }

  // WebP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, mimeType: 'image/webp' };
  }

  // GIF: GIF87a or GIF89a
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return { valid: true, mimeType: 'image/gif' };
  }

  return { valid: false, mimeType: '' };
}

/**
 * Validate that an external URL does not target private or internal networks (SSRF defense)
 */
export function isSafeExternalUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const host = parsed.hostname.toLowerCase();

    // Block localhost, loopbacks, internal hostnames
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host.endsWith('.local') ||
      host.endsWith('.internal')
    ) {
      return false;
    }

    // Block private IPv4 ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16 (AWS metadata)
    const ipMatch = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipMatch) {
      const octet1 = parseInt(ipMatch[1], 10);
      const octet2 = parseInt(ipMatch[2], 10);
      if (octet1 === 10) return false;
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return false;
      if (octet1 === 192 && octet2 === 168) return false;
      if (octet1 === 169 && octet2 === 254) return false; // AWS / GCP metadata IP
      if (octet1 === 127) return false;
      if (octet1 === 0) return false;
    }

    return true;
  } catch {
    return false;
  }
}
