import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import PushMessage from '../../../models/PushMessage';

// GET /api/push-messages - Get all messages with optional filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');
    
    // Build query
    const query: Record<string, unknown> = {};
    if (status && status !== 'all') {
      if (status === 'sent') {
        query.status = 'Delivered';
      } else if (status === 'scheduled') {
        query.status = 'Scheduled';
      } else if (status === 'drafts') {
        query.status = 'Draft';
      } else {
        query.status = status;
      }
    }
    
    const messages = await PushMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
    
    return NextResponse.json({
      success: true,
      data: messages,
      count: messages.length
    });
    
  } catch (error: unknown) {
    console.error('Error fetching push messages:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch messages',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/push-messages - Create a new message
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const { title, content, sendDate, sendTime, timezoneStrategy, targetAudience, status } = body;
    
    if (!title || !content) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Title and content are required' 
        },
        { status: 400 }
      );
    }
    
    if (status === 'Scheduled' && (!sendDate || !sendTime)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Send date and time are required for scheduled messages' 
        },
        { status: 400 }
      );
    }
    
    // Create new message
    const messageData = {
      title,
      content,
      sendDate: sendDate || '',
      sendTime: sendTime || '09:00',
      timezoneStrategy: timezoneStrategy || 'utc',
      targetAudience: targetAudience || ['All Users'],
      status: status || 'Draft'
    };
    
    const message = await PushMessage.create(messageData);
    
    return NextResponse.json({
      success: true,
      data: message,
      message: `Message ${status === 'Draft' ? 'saved as draft' : 'scheduled'} successfully`
    }, { status: 201 });
    
  } catch (error: unknown) {
    console.error('Error creating push message:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/push-messages - Delete messages (bulk delete with query params)
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    
    if (id) {
      // Delete single message by ID
      const deletedMessage = await PushMessage.findByIdAndDelete(id);
      
      if (!deletedMessage) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Message not found' 
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Message deleted successfully'
      });
    }
    
    if (status) {
      // Bulk delete by status
      const result = await PushMessage.deleteMany({ status });
      
      return NextResponse.json({
        success: true,
        message: `${result.deletedCount} messages deleted successfully`
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'ID or status parameter required' 
      },
      { status: 400 }
    );
    
  } catch (error: unknown) {
    console.error('Error deleting push message:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}