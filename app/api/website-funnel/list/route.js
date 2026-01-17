import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Website from "@/models/Website";
import Lead from "@/models/automation/Lead";
import Form from "@/models/Form";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    await dbConnect();
    
    // Fetch websites
    const websites = await Website.find({ owner: userId }).sort({ createdAt: -1 }).lean();

    // For each website, calculate lead count
    const websitesWithLeads = await Promise.all(websites.map(async (site) => {
      // Find all identifiers associated with this website's sections
      const identifiers = site.sections
        ?.filter(s => s.type === 'form' && (s.content?.formId || s.content?.formToken))
        ?.map(s => s.content.formId || s.content.formToken)
        .filter(Boolean);

      let leadCount = 0;
      if (identifiers && identifiers.length > 0) {
        // We need to resolve tokens to form IDs if they are not already IDs
        // Many older leads are stored by formId (ObjectId)
        const resolvedForms = await Form.find({
          $or: [
            { _id: { $in: identifiers.filter(id => mongoose.isValidObjectId(id)) } },
            { token: { $in: identifiers } }
          ]
        }).select('_id').lean();
        
        const formIds = resolvedForms.map(f => f._id);

        if (formIds.length > 0) {
          leadCount = await Lead.countDocuments({ 
            formId: { $in: formIds },
            archived: { $ne: true }
          });
        }
      }

      return {
        ...site,
        leadCount
      };
    }));

    return NextResponse.json({ success: true, websites: websitesWithLeads });
  } catch (error) {
    console.error('Error fetching websites:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
