import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import TeamMember from '@/models/automation/TeamMember';
import User from '@/models/User';
import Business from '@/models/Business';
import bcrypt from 'bcryptjs';

// Helper to get user and business
async function getUserAndBusiness(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return { error: 'Authentication required', status: 401 };
  }

  await dbConnect();
  const user = await User.findById(userId);
  if (!user) {
    return { error: 'User not found', status: 404 };
  }

  const business = await Business.findById(user.businessId);
  if (!business) {
    return { error: 'Business not found', status: 404 };
  }

  return { user, business };
}

// GET - Fetch all team members for a business
export async function GET(request) {
  try {
    const result = await getUserAndBusiness(request);
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }

    const { business } = result;

    const members = await TeamMember.find({ businessId: business._id })
      .populate('userId', 'email firstName lastName phone lastActivityAt')
      .lean();

    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

// POST - Add a new team member
export async function POST(request) {
  try {
    const result = await getUserAndBusiness(request);
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }

    const { user, business } = result;
    const body = await request.json();
    const { email, firstName, lastName, phone, role, password } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Check quota
    const currentMemberCount = await TeamMember.countDocuments({ businessId: business._id });
    const maxMembers = business.quotas?.maxTeamMembers ?? 1;

    if (currentMemberCount >= maxMembers) {
      return NextResponse.json({
        success: false,
        error: `Team member limit reached (${maxMembers}). Please upgrade your plan.`,
        requiresUpgrade: true
      }, { status: 403 });
    }

    // Check if user already exists
    let targetUser = await User.findOne({ email: email.toLowerCase() });

    if (targetUser) {
      // Check if already in this business
      const existingMember = await TeamMember.findOne({
        userId: targetUser._id,
        businessId: business._id
      });
      if (existingMember) {
        return NextResponse.json({ success: false, error: 'User is already a team member' }, { status: 400 });
      }
    } else {
      // Create a new user for the team member
      const tempPassword = password || Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      targetUser = await User.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        businessId: business._id,
        firstName,
        lastName,
        phone,
        role: 'TEAM_MEMBER' // Fixed: matches User model enum
      });
      targetUser._tempPassword = tempPassword; // Attach for return
    }

    // Create TeamMember record
    const teamMember = await TeamMember.create({
      businessId: business._id,
      userId: targetUser._id,
      role: role || 'team_member',
      active: true
    });

    const populatedMember = await TeamMember.findById(teamMember._id)
      .populate('userId', 'email firstName lastName phone lastActivityAt')
      .lean();

    // Include temp password in response if newly created
    if (targetUser._tempPassword) {
      populatedMember.temporaryPassword = targetUser._tempPassword;
    }

    return NextResponse.json({ success: true, data: populatedMember }, { status: 201 });
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to add member' }, { status: 500 });
  }
}

// DELETE - Remove a team member
export async function DELETE(request) {
  try {
    const result = await getUserAndBusiness(request);
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Member ID required' }, { status: 400 });
    }

    // Ensure member belongs to this business
    const member = await TeamMember.findOne({ _id: memberId, businessId: result.business._id });
    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found or unauthorized' }, { status: 404 });
    }

    if (member.role === 'owner') {
      return NextResponse.json({ success: false, error: 'Cannot remove the account owner' }, { status: 400 });
    }

    await TeamMember.findByIdAndDelete(memberId);

    return NextResponse.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
