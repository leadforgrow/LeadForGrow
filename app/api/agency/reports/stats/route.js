import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Lead from '@/models/automation/Lead';
import Client from '@/models/Client';
import Invoice from '@/models/Invoice';
import { getAgencyForUser } from '@/lib/agency/agencyGuards';
import { getCurrentUsage } from '@/lib/agency/usageReader';

export async function GET(request) {
  try {
    await dbConnect();
    
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const agency = await getAgencyForUser(userId);
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const filterClientId = searchParams.get('clientId');
    const filterDays = parseInt(searchParams.get('days')) || 14;

    // Base match for leads
    const leadMatch = { agencyId: agency._id };
    if (filterClientId && filterClientId !== 'all') {
      leadMatch.clientId = new mongoose.Types.ObjectId(filterClientId);
    }

    // 1. Get Top Clients by Lead Count
    const topClients = await Lead.aggregate([
      { $match: { agencyId: agency._id } },
      { $group: { 
          _id: '$clientId', 
          leadCount: { $sum: 1 },
          convertedCount: { 
            $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } 
          }
      }},
      { $sort: { leadCount: -1 } },
      { $limit: 10 }
    ]);

    // Populate client names
    const populatedTopClients = await Promise.all(
      topClients.map(async (item) => {
        const client = await Client.findById(item._id).select('clientName industry');
        return {
          name: client?.clientName || 'Unknown Client',
          industry: client?.industry || 'Service',
          leads: item.leadCount,
          conversions: item.convertedCount,
          conversionRate: item.leadCount > 0 
            ? Math.round((item.convertedCount / item.leadCount) * 100) 
            : 0,
          growth: 15
        };
      })
    );

    // 2. Daily Lead Spikes (Filtered by range and client)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - filterDays);

    const dailyStats = await Lead.aggregate([
      { $match: { 
          ...leadMatch,
          receivedAt: { $gte: startDate }
      }},
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$receivedAt" } },
          count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // 3. Global Stats
    const totalLeads = await Lead.countDocuments(leadMatch);
    const activeClients = await Client.countDocuments({ agencyId: agency._id, status: 'active' });
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const leadsThisMonth = await Lead.countDocuments({ 
      ...leadMatch, 
      receivedAt: { $gte: startOfMonth } 
    });

    const conversionRate = totalLeads > 0 
      ? Math.round((await Lead.countDocuments({ ...leadMatch, status: 'converted' }) / totalLeads) * 100)
      : 0;

    // 4. Financial Tracking
    const invoiceStats = await Invoice.aggregate([
      { $match: { agencyId: agency._id, status: { $ne: 'cancelled' } } },
      { $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
      }}
    ]);
    const revenueTracked = invoiceStats[0]?.totalAmount || 0;

    // 5. Recent Leads
    const recentLeads = await Lead.find(leadMatch)
      .sort({ receivedAt: -1 })
      .limit(10)
      .populate('clientId', 'clientName')
      .lean();

    return NextResponse.json({
      success: true,
      stats: {
        totalLeads,
        activeClients,
        leadsThisMonth,
        conversionRate: conversionRate + "%",
        avgResponseTime: "4.8m", 
        revenueTracked
      },
      topClients: populatedTopClients,
      dailyStats: dailyStats.map(d => ({ date: d._id, count: d.count })),
      recentLeads: recentLeads.map(l => ({
        _id: l._id,
        clientName: l.clientId?.clientName || 'Unknown',
        name: l.name,
        email: l.email,
        phone: l.phone,
        status: l.status,
        receivedAt: l.receivedAt,
        source: l.source
      }))
    });

  } catch (error) {
    console.error('[Agency Reports API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
