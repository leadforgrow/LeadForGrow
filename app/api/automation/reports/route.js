import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Lead from '@/models/automation/Lead';
import Business from '@/models/Business';
import User from '@/models/User';
import { computeIntelligence } from '@/lib/server/intelligence';

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
          lastContactedAt: { $ne: null },
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

    // --- NEW: Daily Growth Trends ---
    const dailyTrends = await Lead.aggregate([
      {
        $match: {
          businessId: business._id,
          receivedAt: { $gte: periodDate },
          archived: false
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$receivedAt" } },
          leads: { $sum: 1 },
          conversions: {
            $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] }
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // --- NEW: Team Performance ---
    const teamPerformance = await Lead.aggregate([
      {
        $match: {
          businessId: business._id,
          receivedAt: { $gte: periodDate },
          assignedTo: { $ne: null },
          archived: false
        }
      },
      {
        $group: {
          _id: "$assignedTo",
          total: { $sum: 1 },
          converted: {
            $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] }
          },
          avgResponseTime: {
            $avg: {
              $cond: [
                { $gt: ["$lastContactedAt", null] },
                { $subtract: ["$lastContactedAt", "$receivedAt"] },
                null
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          name: {
            $cond: [
              { $and: [{ $gt: ["$userDetails.firstName", null] }, { $gt: ["$userDetails.lastName", null] }] },
              { $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"] },
              { $ifNull: ["$userDetails.firstName", "$userDetails.email"] }
            ]
          },
          email: "$userDetails.email",
          total: 1,
          converted: 1,
          avgResponseTime: 1,
          conversionRate: {
            $multiply: [
              { $cond: [{ $eq: ["$total", 0] }, 0, { $divide: ["$converted", "$total"] }] },
              100
            ]
          }
        }
      }
    ]);

    // --- NEW: Busiest Hours Heatmap ---
    const hourlyHeatmap = await Lead.aggregate([
      {
        $match: {
          businessId: business._id,
          receivedAt: { $gte: periodDate },
          archived: false
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: "$receivedAt" },
            day: { $dayOfWeek: "$receivedAt" }
          },
          count: { $sum: 1 }
        }
      }
    ]);

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
        recentLeads,
        dailyTrends,
        teamPerformance,
        hourlyHeatmap
      }
    });

  } catch (error) {
    console.error('CRITICAL REPORTS ERROR:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch reports',
      details: error.stack
    }, { status: 500 });
  }
}
