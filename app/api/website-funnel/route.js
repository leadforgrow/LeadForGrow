import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Website from "@/models/Website";
import User from "@/models/User";
import Business from "@/models/Business";
import { defaultContent } from "@/app/components/templates/content/defaultContent";

export async function POST(request) {
  try {
    await dbConnect();
    const { userId, ...data } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Generate a basic slug from name
    let slug = data.websiteName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    // Ensure uniqueness within a simple check or more complex logic later
    const existing = await Website.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 5)}`;
    }

    const website = await Website.create({
      owner: userId,
      businessId: user.businessId,
      websiteName: data.websiteName,
      category: data.category,
      city: data.city,
      phone: data.phone,
      email: data.email,
      contactMethod: data.contactMethod,
      slug: slug,
      status: 'draft',
      primaryColor: data.primaryColor || '#4f46e5',
      sections: defaultContent[data.category]?.sections || [],
      settings: defaultContent[data.category]?.settings || {
        fontFamily: 'Inter',
        borderRadius: '1rem',
        navbar: { items: [], ctaText: 'Contact Us', ctaLink: '#contact' }
      }
    });

    return NextResponse.json({ success: true, websiteId: website._id, website });
  } catch (error) {
    console.error('Error in website funnel:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await dbConnect();
    const { websiteId, ...data } = await request.json();

    if (!websiteId) {
      return NextResponse.json({ success: false, error: 'Website ID is required' }, { status: 400 });
    }

    const website = await Website.findByIdAndUpdate(
      websiteId,
      { $set: data },
      { new: true }
    );

    if (!website) {
       return NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, website });
  } catch (error) {
    console.error('Error updating website funnel:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
