import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const imageUrl = formData.get('imageUrl') as string | null;

    if (imageUrl) {
      return NextResponse.json({
        success: true,
        imageUrl: imageUrl.trim(),
      });
    }

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || 'image/jpeg';
      const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

      return NextResponse.json({
        success: true,
        imageUrl: base64Data,
        fileName: file.name,
      });
    }

    return NextResponse.json(
      { success: false, error: 'No image file or URL provided' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}
