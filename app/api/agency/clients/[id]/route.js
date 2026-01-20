import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Client from '@/models/Client';
import { getClientWithOwnershipCheck } from '@/lib/agency/agencyGuards';

/**
 * GET /api/agency/clients/[id]
 * Get a specific client
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Get client with ownership check
    const client = await getClientWithOwnershipCheck(id, userId);
    if (client) {
      await client.populate('assignedTeam', 'firstName lastName email');
    }
    
    return NextResponse.json({
      success: true,
      client
    });
    
  } catch (error) {
    console.error('[Agency Client API] Error:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/agency/clients/[id]
 * Update a client
 */
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Get client with ownership check
    const client = await getClientWithOwnershipCheck(id, userId);
    
    // Parse request body
    const body = await request.json();
    const { clientName, industry, website, primaryContact, notes, status, assignedTeam, billing, healthScore, leadAssignment } = body;
    
    // Update fields
    if (clientName) client.clientName = clientName;
    if (industry !== undefined) client.industry = industry;
    if (website !== undefined) client.website = website;
    if (primaryContact) client.primaryContact = primaryContact;
    if (notes !== undefined) client.notes = notes;
    if (assignedTeam !== undefined) client.assignedTeam = assignedTeam;
    if (billing !== undefined) client.billing = billing;
    if (healthScore !== undefined) client.healthScore = healthScore;
    if (leadAssignment !== undefined) client.leadAssignment = leadAssignment;
    
    // Handle status changes
    if (status && status !== client.status) {
      if (status === 'active') {
        client.activate();
      } else if (status === 'paused') {
        client.pause();
      } else if (status === 'churned') {
        client.churn();
      }
    }
    
    await client.save();
    
    return NextResponse.json({
      success: true,
      client,
      message: 'Client updated successfully'
    });
    
  } catch (error) {
    console.error('[Agency Client API] Error:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/agency/clients/[id]
 * Delete a client (soft delete - mark as churned)
 */
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Get client with ownership check
    const client = await getClientWithOwnershipCheck(id, userId);
    
    // Soft delete - mark as churned
    client.churn();
    await client.save();
    
    return NextResponse.json({
      success: true,
      message: 'Client marked as churned'
    });
    
  } catch (error) {
    console.error('[Agency Client API] Error:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
