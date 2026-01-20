import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getAgencyForUser } from '@/lib/agency/agencyGuards';

/**
 * GET /api/agency/team
 * List all team members for an agency
 */
export async function GET(request) {
  try {
    await dbConnect();
    
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get agency for user
    const agency = await getAgencyForUser(userId);
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }
    
    // Find all users with this agencyId
    const team = await User.find({ agencyId: agency._id })
      .select('-password')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      team
    });
    
  } catch (error) {
    console.error('[Agency Team API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/agency/team
 * Add a new team member
 */
export async function POST(request) {
  try {
    await dbConnect();
    
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get agency for user
    const agency = await getAgencyForUser(userId);
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }
    
    // Check limits (Seat limits)
    const currentMemberCount = await User.countDocuments({ agencyId: agency._id });
    if (currentMemberCount >= agency.limits.maxTeamSeats) {
      return NextResponse.json({ 
        error: `Team seat limit reached (${agency.limits.maxTeamSeats}). Please upgrade your plan.`
      }, { status: 403 });
    }
    
    const body = await request.json();
    const { email, firstName, lastName, phone, role } = body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }
    
    // Create new user (temporary password LFGTeam123!)
    const hashedPassword = await bcrypt.hash('LFGTeam123!', 10);
    
    const newMember = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: role || 'member',
      agencyId: agency._id,
      active: true
    });
    
    return NextResponse.json({
      success: true,
      member: {
        _id: newMember._id,
        email: newMember.email,
        firstName: newMember.firstName,
        lastName: newMember.lastName,
        role: newMember.role
      },
      message: 'Team member added successfully. Temporary password: LFGTeam123!'
    }, { status: 201 });
    
  } catch (error) {
    console.error('[Agency Team API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
