import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { withAuth } from '@/lib/auth';
import { requireEnv } from '@/lib/env';

function getCloudinaryConfig() {
  return {
    cloud_name: requireEnv('CLOUDINARY_CLOUD_NAME'),
    api_key: requireEnv('CLOUDINARY_API_KEY'),
    api_secret: requireEnv('CLOUDINARY_API_SECRET'),
  };
}

export const POST = withAuth()(async () => {
  try {
    const config = getCloudinaryConfig();
    cloudinary.config(config);

    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request({ timestamp }, config.api_secret);

    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      apiKey: config.api_key,
      cloudName: config.cloud_name,
    });
  } catch (error) {
    console.error('Cloudinary signature generation failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Signature generation failed' },
      { status: 500 }
    );
  }
});
