import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserAudience from '@/models/UserAudience';

// GET - Fetch all user audiences
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    
    const filter = activeOnly ? { isActive: true } : {};
    const audiences = await UserAudience.find(filter).sort({ audienceType: 1 });
    
    return NextResponse.json({
      success: true,
      data: audiences,
      count: audiences.length
    });
  } catch (error) {
    console.error('Error fetching user audiences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user audiences' },
      { status: 500 }
    );
  }
}

// POST - Create or update user audience
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { audienceType, count, description, metadata } = body;
    
    // Validation
    if (!audienceType || count === undefined || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: audienceType, count, description' },
        { status: 400 }
      );
    }
    
    if (count < 0) {
      return NextResponse.json(
        { success: false, error: 'Count cannot be negative' },
        { status: 400 }
      );
    }
    
    // Check if audience type already exists
    const existingAudience = await UserAudience.findOne({ audienceType });
    
    if (existingAudience) {
      // Update existing
      existingAudience.count = count;
      existingAudience.description = description;
      if (metadata) {
        existingAudience.metadata = { ...existingAudience.metadata, ...metadata };
      }
      await existingAudience.save();
      
      return NextResponse.json({
        success: true,
        message: 'User audience updated successfully',
        data: existingAudience
      });
    } else {
      // Create new
      const newAudience = new UserAudience({
        audienceType,
        count,
        description,
        metadata: metadata || {}
      });
      
      await newAudience.save();
      
      return NextResponse.json({
        success: true,
        message: 'User audience created successfully',
        data: newAudience
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating/updating user audience:', error);
    
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { success: false, error: 'Audience type already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create/update user audience' },
      { status: 500 }
    );
  }
}

// PUT - Update specific user audience
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { audienceType, count, description, isActive, metadata } = body;
    
    if (!audienceType) {
      return NextResponse.json(
        { success: false, error: 'Audience type is required' },
        { status: 400 }
      );
    }
    
    const audience = await UserAudience.findOne({ audienceType });
    
    if (!audience) {
      return NextResponse.json(
        { success: false, error: 'User audience not found' },
        { status: 404 }
      );
    }
    
    // Update fields if provided
    if (count !== undefined) audience.count = count;
    if (description !== undefined) audience.description = description;
    if (isActive !== undefined) audience.isActive = isActive;
    if (metadata !== undefined) {
      audience.metadata = { ...audience.metadata, ...metadata };
    }
    
    await audience.save();
    
    return NextResponse.json({
      success: true,
      message: 'User audience updated successfully',
      data: audience
    });
  } catch (error) {
    console.error('Error updating user audience:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user audience' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user audience
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const audienceType = searchParams.get('audienceType');
    
    if (!audienceType) {
      return NextResponse.json(
        { success: false, error: 'Audience type is required' },
        { status: 400 }
      );
    }
    
    const deletedAudience = await UserAudience.findOneAndDelete({ audienceType });
    
    if (!deletedAudience) {
      return NextResponse.json(
        { success: false, error: 'User audience not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'User audience deleted successfully',
      data: deletedAudience
    });
  } catch (error) {
    console.error('Error deleting user audience:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user audience' },
      { status: 500 }
    );
  }
}