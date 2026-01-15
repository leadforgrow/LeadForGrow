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

      // 4. Send Welcome Email (Asynchronous)
      const { sendResendEmail } = await import("@/lib/resend");
      const welcomeTemplate = `
        <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; color: #1e293b;">
          <div style="margin-bottom: 32px; text-align: center;">
            <div style="display: inline-block; padding: 12px; background: #6366f1; border-radius: 16px; margin-bottom: 16px;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <h1 style="font-size: 30px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.025em;">Welcome to LeadForGrow!</h1>
            <p style="font-size: 16px; color: #64748b; margin-top: 8px;">Your lead recovery engine is ready.</p>
          </div>
          
          <div style="background: #f8fafc; border-radius: 24px; padding: 32px; border: 1px solid #e2e8f0; margin-bottom: 32px;">
            <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px;">Hi ${email.split('@')[0]},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
              Thanks for joining the elite circle of businesses using AI to never miss a customer again. We've set up your dashboard for <strong>${companyName}</strong>.
            </p>
            
            <div style="margin-bottom: 32px;">
              <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                <div style="width: 24px; height: 24px; background: #e0e7ff; color: #4338ca; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; margin-right: 12px; flex-shrink: 0;">1</div>
                <p style="font-size: 14px; margin: 0; color: #334155;"><strong>Connect Your Site:</strong> Grab your form token and start capturing leads.</p>
              </div>
              <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                <div style="width: 24px; height: 24px; background: #e0e7ff; color: #4338ca; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; margin-right: 12px; flex-shrink: 0;">2</div>
                <p style="font-size: 14px; margin: 0; color: #334155;"><strong>Setup Automation:</strong> Configure instant email & WhatsApp responses.</p>
              </div>
              <div style="display: flex; align-items: flex-start;">
                <div style="width: 24px; height: 24px; background: #e0e7ff; color: #4338ca; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; margin-right: 12px; flex-shrink: 0;">3</div>
                <p style="font-size: 14px; margin: 0; color: #334155;"><strong>Recover 2x More:</strong> Let AI handle missed calls while you sleep.</p>
              </div>
            </div>
            
            <a href="https://leadforgrow.online/automation" style="display: block; text-align: center; background: #4f46e5; color: white; padding: 16px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);">
              Explore Your Dashboard →
            </a>
          </div>
          
          <div style="text-align: center; padding: 0 24px;">
            <p style="font-size: 14px; color: #94a3b8; margin-bottom: 8px;">Need help? Just reply to this email.</p>
            <p style="font-size: 12px; color: #cbd5e1;">© 2024 LeadForGrow. Built for high-growth teams.</p>
          </div>
        </div>
      `;

      // 4. Send Welcome Email (Awaited to ensure delivery)
      console.log('[Register] Sending welcome email to:', email);
      try {
        await sendResendEmail({
          to: email,
          from: 'LeadForGrow <info@leadforgrow.com>',
          subject: 'Welcome to LeadForGrow! 🚀',
          html: welcomeTemplate
        });
        console.log('[Register] Welcome email sent successfully');
      } catch (emailError) {
        console.error('[Register] Failed to send welcome email:', emailError);
        // Don't fail the registration if email fails, but log it
      }

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
