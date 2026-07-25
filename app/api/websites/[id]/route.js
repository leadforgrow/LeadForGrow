import { dbConnect } from "@/lib/mongodb";
import Website from "@/models/Website";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

/** Owner or a member of the same business may access a website. */
function canAccess(user, website) {
  if (String(website.owner) === String(user.userId)) return true;
  if (user.businessId && website.businessId && String(website.businessId) === String(user.businessId)) return true;
  return false;
}

export const GET = withAuth()(async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const website = await Website.findById(id);

    if (!website) {
      return NextResponse.json({ success: false, error: "Website not found" }, { status: 404 });
    }
    if (!canAccess(req.user, website)) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: website });
  } catch (error) {
    console.error('[Websites] GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch website' }, { status: 500 });
  }
});

export const PUT = withAuth()(async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const data = await req.json();

    // Never allow ownership/tenant reassignment through this endpoint
    delete data.owner;
    delete data.businessId;

    const existing = await Website.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Website not found" }, { status: 404 });
    }
    if (!canAccess(req.user, existing)) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    const website = await Website.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return NextResponse.json({ success: true, data: website });
  } catch (error) {
    console.error('[Websites] PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update website' }, { status: 500 });
  }
});

export const DELETE = withAuth()(async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;

    const existing = await Website.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Website not found" }, { status: 404 });
    }
    if (!canAccess(req.user, existing)) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    await Website.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Website deleted successfully" });
  } catch (error) {
    console.error('[Websites] DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete website' }, { status: 500 });
  }
});
