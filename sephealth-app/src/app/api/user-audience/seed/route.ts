import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserAudience from '@/models/UserAudience';

// POST - Initialize user audience data with default values
export async function POST() {
  try {
    await connectDB();
    
    const initialData = [
      {
        audienceType: 'All Users',
        count: 1247,
        description: 'All registered users in the platform',
        metadata: {
          updateFrequency: 'daily',
          calculationMethod: 'automated'
        }
      },
      {
        audienceType: 'Active Users',
        count: 850,
        description: 'Users who have been active in the last 30 days',
        metadata: {
          updateFrequency: 'daily',
          calculationMethod: 'automated'
        }
      },
      {
        audienceType: 'New Users',
        count: 200,
        description: 'Users who joined in the last 7 days',
        metadata: {
          updateFrequency: 'daily',
          calculationMethod: 'automated'
        }
      },
      {
        audienceType: 'Premium Users',
        count: 150,
        description: 'Users with premium subscriptions',
        metadata: {
          updateFrequency: 'weekly',
          calculationMethod: 'automated'
        }
      }
    ];
    
    const results = [];
    
    for (const data of initialData) {
      // Check if audience type already exists
      const existing = await UserAudience.findOne({ audienceType: data.audienceType });
      
      if (!existing) {
        const newAudience = new UserAudience(data);
        await newAudience.save();
        results.push({ action: 'created', audienceType: data.audienceType });
      } else {
        results.push({ action: 'skipped', audienceType: data.audienceType, reason: 'already exists' });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'User audience data initialized successfully',
      data: results
    });
  } catch (error) {
    console.error('Error initializing user audience data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize user audience data' },
      { status: 500 }
    );
  }
}