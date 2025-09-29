import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserAudience from '@/models/UserAudience';

// GET - Get user audience statistics
export async function GET() {
  try {
    await connectDB();
    
    // Calculate stats manually
    const audiences = await UserAudience.find({ isActive: true });
    const totalUsers = audiences.reduce((sum, audience) => sum + audience.count, 0);
    const lastUpdated = audiences.reduce((latest, audience) => 
      audience.lastUpdated > latest ? audience.lastUpdated : latest, 
      new Date(0)
    );
    
    const audienceBreakdown: Record<string, number> = {};
    audiences.forEach(audience => {
      audienceBreakdown[audience.audienceType] = audience.count;
    });
    
    const stats = {
      totalUsers,
      audienceCount: audiences.length,
      lastUpdated
    };
    
    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        audienceBreakdown
      }
    });
  } catch (error) {
    console.error('Error fetching user audience statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user audience statistics' },
      { status: 500 }
    );
  }
}