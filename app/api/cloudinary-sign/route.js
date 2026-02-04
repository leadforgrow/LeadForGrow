import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dhveue7bg',
  api_key: '279161859452692',
  api_secret: '3DOF_1kZ-0cDIToUws29S2KNsXw',
});

export async function POST(request) {
  try {
    const timestamp = Math.round((new Date).getTime() / 1000);
    
    // We can sign specific parameters if needed, or just timestamp for general upload
    const signature = cloudinary.utils.api_sign_request({
      timestamp: timestamp,
      // upload_preset: '...', // If using a specific signed preset, add here
    }, '3DOF_1kZ-0cDIToUws29S2KNsXw');
    
    return NextResponse.json({ 
      success: true, 
      signature,
      timestamp,
      apiKey: '279161859452692',
      cloudName: 'dhveue7bg'
    });
  } catch (error) {
    console.error('Cloudinary signature generation failed:', error);
    return NextResponse.json({ success: false, error: 'Signature generation failed' }, { status: 500 });
  }
}
