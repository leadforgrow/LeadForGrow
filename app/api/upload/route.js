import { NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/auth';
import { withRateLimit } from '@/lib/rateLimit';

async function uploadHandler(req) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      {
        success: false,
        error: 'Local uploads disabled in production. Use Cloudinary via /api/cloudinary-sign.',
      },
      { status: 403 }
    );
  }

  try {
    const { writeFile, mkdir } = await import('fs/promises');
    const path = await import('path');

    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${file.name.replace(/\.[^/.]+$/, '')}-${uniqueSuffix}${path.extname(file.name)}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ success: true, url: `/uploads/${filename}`, filename });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}

export const POST = withTenantAuth(withRateLimit(20, 60, uploadHandler));
