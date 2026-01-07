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

    // Fetch business information
    const business = await Business.findById(user.businessId);
    if (!business) {
      return NextResponse.json({ success: false, error: "Business not found. Please contact support." }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        userId: user._id,
        businessId: business._id,
        email: user.email,
        role: user.role,
        business: {
          name: business.businessName,
          plan: business.plan,
          onboardingComplete: business.onboardingComplete,
          onboardingStep: business.onboardingStep
        },
        token: "dummy-token-" + user._id 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
