import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { getClientWithOwnershipCheck } from '@/lib/agency/agencyGuards';
import { withAgencyAuth } from '@/lib/agency/withAgencyAuth';

export const GET = withAgencyAuth(async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const client = await getClientWithOwnershipCheck(id, req.user.userId);
    if (client) await client.populate('assignedTeam', 'firstName lastName email');
    return NextResponse.json({ success: true, client });
  } catch (error) {
    const status = error.message.includes('Unauthorized') || error.message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
});

export const PATCH = withAgencyAuth(async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const client = await getClientWithOwnershipCheck(id, req.user.userId);
    const body = await req.json();

    const fields = ['clientName', 'industry', 'website', 'primaryContact', 'notes', 'assignedTeam', 'billing', 'healthScore', 'leadAssignment'];
    for (const key of fields) {
      if (body[key] !== undefined) client[key] = body[key];
    }

    if (body.status && body.status !== client.status) {
      if (body.status === 'active') client.activate();
      else if (body.status === 'paused') client.pause();
      else if (body.status === 'churned') client.churn();
    }

    await client.save();
    return NextResponse.json({ success: true, client, message: 'Client updated successfully' });
  } catch (error) {
    const status = error.message.includes('Unauthorized') || error.message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
});

export const DELETE = withAgencyAuth(async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const client = await getClientWithOwnershipCheck(id, req.user.userId);
    client.churn();
    await client.save();
    return NextResponse.json({ success: true, message: 'Client marked as churned' });
  } catch (error) {
    const status = error.message.includes('Unauthorized') || error.message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
});
