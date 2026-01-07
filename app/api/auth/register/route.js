import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import Business from "@/models/Business";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await dbConnect();
    const { companyName, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }
    
    if (!companyName) {
      return NextResponse.json({ success: false, error: "Company name is required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: "User already exists" }, { status: 400 });
    }

    // Use a transaction to ensure atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Create User first with a temporary businessId
      const hashedPassword = await bcrypt.hash(password, 10);
      const tempBusinessId = new mongoose.Types.ObjectId();
      
      const user = await User.create([{
        email,
        password: hashedPassword,
        businessId: tempBusinessId,
        role: 'owner'
      }], { session });

      // 2. Create Business with the user as owner
      const business = await Business.create([{
        businessName: companyName,
        ownerId: user[0]._id,
        plan: 'free',
        onboardingComplete: false,
        onboardingStep: 'business_details'
      }], { session });

      // 3. Update User with correct businessId
      user[0].businessId = business[0]._id;
      await user[0].save({ session });

      // Commit the transaction
      await session.commitTransaction();

      return NextResponse.json({ 
        success: true, 
        data: { 
          userId: user[0]._id,
          businessId: business[0]._id,
          email: user[0].email,
          role: 'owner',
          business: {
            name: business[0].businessName,
            plan: business[0].plan,
            onboardingComplete: business[0].onboardingComplete,
            onboardingStep: business[0].onboardingStep
          },
          token: "dummy-token-" + user[0]._id 
        } 
      });
    } catch (error) {
      // Rollback on error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
