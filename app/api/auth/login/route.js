import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import Business from "@/models/Business";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Fetch PRIMARY Business information first
    let workspace = null;
    if (user.businessId) {
      const business = await Business.findById(user.businessId);
      if (business) {
        workspace = {
          id: business._id,
          name: business.businessName,
          plan: business.plan,
          type: 'business',
          onboardingComplete: business.onboardingComplete,
          onboardingStep: business.onboardingStep,
          agencyId: user.agencyId || null // Capability attached to business
        };
      }
    }

    // Fallback if businessId is missing but user exists (legacy support)
    if (!workspace && user.agencyId) {
      const agency = (await import("@/models/Agency")).default;
      const agencyDoc = await agency.findById(user.agencyId);
      if (agencyDoc) {
        workspace = {
          id: agencyDoc.businessId || 'legacy',
          agencyId: agencyDoc._id,
          name: agencyDoc.agencyName,
          plan: 'agency',
          type: 'business'
        };
      }
    }

    if (!workspace) {
      return NextResponse.json({ success: false, error: "Business account not found. Please contact support." }, { status: 500 });
    }

    const { generateToken } = await import("@/lib/auth");
    const token = generateToken(user);

    return NextResponse.json({
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        business: workspace, // Keeping 'business' key for frontend compatibility
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
