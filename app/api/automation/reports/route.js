import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Lead from '@/models/automation/Lead';
import User from '@/models/User';
import Business from '@/models/Business';

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

// GET - Fetch analytics and reports
export async function GET(request) {
  try {
    const result = await getUserAndBusiness(request);
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
    
    const { business } = result;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30';
    
    const periodDate = new Date();
    periodDate.setDate(periodDate.getDate() - parseInt(period));
    
    // Total leads in period
    const totalLeads = await Lead.countDocuments({
      businessId: business._id,
      receivedAt: { $gte: periodDate },
      archived: false
    });
    
    // Leads by status
    const leadsByStatus = await Lead.aggregate([
      {
        $match: {
          businessId: business._id,
          receivedAt: { $gte: periodDate },
          archived: false
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statusCounts = {
      new: 0,
      contacted: 0,
      'follow-up': 0,
      converted: 0,
      lost: 0
    };
    
    leadsByStatus.forEach(item => {
      statusCounts[item._id] = item.count;
    });
    
    // Leads by source
    const leadsBySource = await Lead.aggregate([
      {
        $match: {
          businessId: business._id,
          receivedAt: { $gte: periodDate },
          archived: false
        }
      },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Average response time (for contacted leads)
    const responseTimeData = await Lead.aggregate([
      {
        $match: {
          businessId: business._id,
          lastContactedAt: { $exists: true },
          receivedAt: { $gte: periodDate }
        }
      },
      {
        $project: {
          responseTime: {
            $subtract: ['$lastContactedAt', '$receivedAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]);
    
    const avgResponseTimeMs = responseTimeData[0]?.avgResponseTime || 0;
    const avgResponseTimeHours = Math.round(avgResponseTimeMs / (1000 * 60 * 60) * 10) / 10;
    
    // Leads not contacted yet
    const notContactedCount = await Lead.countDocuments({
      businessId: business._id,
      status: 'new',
      archived: false
    });
    
    // Recent converted/contacted leads
    const recentLeads = await Lead.find({
      businessId: business._id,
      status: { $in: ['converted', 'contacted'] },
      archived: false
    })
    .sort({ lastContactedAt: -1, convertedAt: -1 })
    .limit(5)
    .select('name status serviceInterest convertedAt lastContactedAt')
    .lean();

    // Conversion rate
    const conversionRate = totalLeads > 0 
      ? Math.round((statusCounts.converted / totalLeads) * 100 * 10) / 10
      : 0;
    
    return NextResponse.json({
      success: true,
      data: {
        period: parseInt(period),
        totalLeads,
        statusCounts,
        converted: statusCounts.converted || 0,
        lost: statusCounts.lost || 0,
        leadsBySource,
        avgResponseTimeHours,
        notContactedCount,
        conversionRate,
        recentLeads
      }
    });
    
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reports' }, { status: 500 });
  }
}
