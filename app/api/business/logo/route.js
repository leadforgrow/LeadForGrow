import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import { withPlanAccess } from '@/lib/accessControl';

/**
 * POST /api/business/logo
 * Upload the business's own logo (branded on bills, receipts, PDFs).
 * Stored on Business.logo as a Cloudinary URL — falls back to /public in dev.
 *
 * Accepts image/png, image/jpeg, image/webp. Max 2MB — anything bigger and
 * the PDF embed bloats + slow to fetch. Overwrites the previous logo (single
 * logo per business, no versioning).
 */
/**
 * GET /api/business/logo — return the current business logo URL (or null).
 * Used by the bill editor to show a preview + "Change" button.
 */
export const GET = withPlanAccess('automation', async (req) => {
  try {
    await dbConnect();
    const business = await Business.findById(req.user.businessId).select('logo').lean();
    return NextResponse.json({ success: true, data: { logo: business?.logo || null } });
  } catch (err) {
    console.error('[Business] logo get:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch logo' }, { status: 500 });
  }
});

export const POST = withPlanAccess('automation', async (req) => {
  try {
    await dbConnect();
    const businessId = req.user.businessId;

    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }
    const type = file.type || '';
    if (!/^image\/(png|jpe?g|webp)$/i.test(type)) {
      return NextResponse.json({ success: false, error: 'Logo must be PNG, JPG or WebP' }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Logo must be under 2 MB' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadLogo({ buffer, file, businessId, req });

    await Business.updateOne({ _id: businessId }, { $set: { logo: url } });
    return NextResponse.json({ success: true, data: { logo: url } });
  } catch (err) {
    console.error('[Business] logo upload:', err);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
});

/**
 * DELETE /api/business/logo — remove the current logo. PDFs revert to
 * name-only header. Doesn't purge the Cloudinary file (cheap enough to
 * leave; if we care about storage costs later, add a queued cleanup).
 */
export const DELETE = withPlanAccess('automation', async (req) => {
  try {
    await dbConnect();
    await Business.updateOne({ _id: req.user.businessId }, { $unset: { logo: '' } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Business] logo delete:', err);
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
  }
});

async function uploadLogo({ buffer, file, businessId, req }) {
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    const { v2: cloudinary } = await import('cloudinary');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const uploaded = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `lfg/${businessId}/branding`,
          public_id: 'logo',
          resource_type: 'image',
          overwrite: true,
          // Auto-optimise: keeps the file small so the PDF embed stays snappy
          transformation: [{ width: 400, height: 400, crop: 'limit', quality: 'auto:good' }],
        },
        (err, result) => (err ? reject(err) : resolve(result)),
      ).end(buffer);
    });
    return uploaded.secure_url;
  }

  // Dev fallback
  const { writeFile, mkdir } = await import('fs/promises');
  const path = await import('path');
  const dir = path.join(process.cwd(), 'public', 'uploads', 'branding');
  await mkdir(dir, { recursive: true });
  const ext = (file.name || 'logo.png').match(/\.[a-z0-9]+$/i)?.[0] || '.png';
  const filename = `${businessId}-logo${ext}`;
  await writeFile(path.join(dir, filename), buffer);
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}/uploads/branding/${filename}`;
}
