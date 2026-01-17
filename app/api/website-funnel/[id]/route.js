import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Website from "@/models/Website";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const website = await Website.findById(id);
    if (!website) {
      return NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, website });
  } catch (error) {
    console.error('Error fetching website:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
