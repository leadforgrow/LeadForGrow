import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { withAgencyAuth } from '@/lib/agency/withAgencyAuth';

export const GET = withAgencyAuth(async (req) => {
  try {
    await dbConnect();
    const agency = req.agency;

    const team = await User.find({ agencyId: agency._id }).select('-password').sort({ createdAt: -1 });

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error('[Agency Team API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const POST = withAgencyAuth(async (req) => {
  try {
    await dbConnect();
    const agency = req.agency;

    const currentMemberCount = await User.countDocuments({ agencyId: agency._id });
    if (currentMemberCount >= agency.limits.maxTeamSeats) {
      return NextResponse.json(
        {
          error: `Team seat limit reached (${agency.limits.maxTeamSeats}). Please upgrade your plan.`,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, firstName, lastName, phone, role } = body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const tempPassword = crypto.randomBytes(12).toString('base64url');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const newMember = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: role || 'member',
      agencyId: agency._id,
      active: true,
    });

    return NextResponse.json(
      {
        success: true,
        member: {
          _id: newMember._id,
          email: newMember.email,
          firstName: newMember.firstName,
          lastName: newMember.lastName,
          role: newMember.role,
        },
        tempPassword,
        message: 'Team member added. Share the temporary password securely.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Agency Team API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
