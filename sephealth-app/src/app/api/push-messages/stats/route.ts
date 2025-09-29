import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import PushMessage from '../../../../models/PushMessage';

// GET /api/push-messages/stats - Get message statistics
export async function GET() {
  try {
    await connectDB();
    
    // Calculate statistics manually
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count messages sent today
    const sentToday = await PushMessage.countDocuments({
      status: 'Delivered',
      deliveredAt: { $gte: today, $lt: tomorrow }
    });

    // Count scheduled messages
    const scheduled = await PushMessage.countDocuments({
      status: 'Scheduled'
    });

    // Calculate delivery and open rates
    const deliveryStats = await PushMessage.aggregate([
      {
        $match: { status: 'Delivered' }
      },
      {
        $group: {
          _id: null,
          totalRecipients: { $sum: '$recipients' },
          totalDelivered: { $sum: '$deliveredCount' },
          totalOpened: { $sum: '$openCount' }
        }
      }
    ]);

    let deliveryRate = 0;
    let openRate = 0;

    if (deliveryStats.length > 0) {
      const { totalRecipients, totalDelivered, totalOpened } = deliveryStats[0];
      deliveryRate = totalRecipients > 0 ? Math.round((totalDelivered / totalRecipients) * 100) : 0;
      openRate = totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0;
    }

    const stats = {
      sentToday,
      deliveryRate,
      openRate,
      scheduled
    };
    
    return NextResponse.json({
      success: true,
      data: stats
    });
    
  } catch (error: unknown) {
    console.error('Error fetching push message statistics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}