import { dbConnect } from "@/lib/mongodb";
import Website from "@/models/Website";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();
    const { owner, templateId, websiteName, brandName, goal, content } = data;

    if (!owner || !templateId || !websiteName) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const website = await Website.create({
      owner,
      templateId,
      websiteName,
      brandName,
      goal,
      content: content || {}
    });

    return NextResponse.json({ success: true, data: website });
  } catch (error) {
    console.error("Error creating website:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || searchParams.get('ownerId');
    const slug = searchParams.get('slug');
    const status = searchParams.get('status');

    let query = {};
    if (userId) query.owner = userId;
    if (slug) query.slug = slug;
    if (status) query.status = status;

    if (!userId && !slug) {
      return NextResponse.json({ success: false, error: "Missing userId or slug" }, { status: 400 });
    }

    const websites = await Website.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: websites });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
