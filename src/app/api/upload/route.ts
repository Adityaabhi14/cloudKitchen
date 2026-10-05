import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimiter';
import { validateImageMagicBytes, isSafeExternalUrl, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce Admin Authentication
    const auth = requireAdminAuth(req, 'MANAGE_MENU');
    if ('errorResponse' in auth) return auth.errorResponse;

    // 2. Rate limiting check
    const rateLimit = checkRateLimit(req, RATE_LIMITS.UPLOAD);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: `Upload rate limit exceeded. Retry in ${rateLimit.resetInSeconds}s.` },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const imageUrl = formData.get('imageUrl') as string | null;

    // 3. Handle external image URL with SSRF protection
    if (imageUrl) {
      const cleanUrl = imageUrl.trim();
      if (!isSafeExternalUrl(cleanUrl)) {
        return NextResponse.json(
          { success: false, error: 'Invalid or unsafe image URL. Localhost, private IPs, and non-HTTP protocols are forbidden.' },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        imageUrl: cleanUrl,
      });
    }

    // 4. Handle binary file upload
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: 'File size exceeds maximum allowed limit of 5 MB.' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Verify binary magic numbers to prevent disguised executables / SVGs
      const magicValidation = validateImageMagicBytes(buffer);
      if (!magicValidation.valid) {
        return NextResponse.json(
          { success: false, error: 'Invalid file format. Only authentic JPEG, PNG, WebP, and GIF images are permitted.' },
          { status: 400 }
        );
      }

      const safeFileName = sanitizeString(file.name.replace(/[^a-zA-Z0-9._-]/g, '_'), 80);
      const base64Data = `data:${magicValidation.mimeType};base64,${buffer.toString('base64')}`;

      return NextResponse.json({
        success: true,
        imageUrl: base64Data,
        fileName: safeFileName,
      });
    }

    return NextResponse.json(
      { success: false, error: 'No valid image file or URL provided' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Image upload failed processing' },
      { status: 500 }
    );
  }
}
