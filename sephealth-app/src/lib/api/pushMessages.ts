// API utility functions for push messages

export interface PushMessage {
  _id: string;
  title: string;
  content: string;
  sendDate: string;
  sendTime: string;
  timezoneStrategy: string;
  targetAudience: string[];
  status: string;
  recipients: number;
  deliveryRate: string;
  deliveredCount: number;
  openCount: number;
  scheduledDateTime?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageStats {
  sentToday: number;
  deliveryRate: number;
  openRate: number;
  scheduled: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: string;
}

// Get API endpoints from environment variables
const PUSH_API_BASE = process.env.NEXT_PUBLIC_PUSH_API_BASE_URL || 'http://localhost:3001';

// Fetch all messages with optional filtering
export async function fetchMessages(filter: string = 'all'): Promise<PushMessage[]> {
  try {
    const url = filter === 'all' 
      ? `${PUSH_API_BASE}/api/push-messages`
      : `${PUSH_API_BASE}/api/push-messages?status=${filter}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<PushMessage[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch messages');
    }

    return result.data || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

// Create a new message
export async function createMessage(messageData: {
  title: string;
  content: string;
  sendDate: string;
  sendTime: string;
  timezoneStrategy: string;
  targetAudience: string[];
  status: string;
}): Promise<PushMessage> {
  try {
    // Convert to format expected by Bull Queue server
    // Handle timezone properly - don't force UTC if user expects local time
    let scheduledDateTime: string;
    
    if (messageData.timezoneStrategy === 'utc') {
      // Force UTC
      scheduledDateTime = new Date(`${messageData.sendDate}T${messageData.sendTime}:00.000Z`).toISOString();
    } else {
      // Treat as local time
      const localDateTime = new Date(`${messageData.sendDate}T${messageData.sendTime}:00`);
      scheduledDateTime = localDateTime.toISOString();
    }
    
    // Validate the scheduled time is in the future
    const scheduledTime = new Date(scheduledDateTime);
    const now = new Date();
    
    if (scheduledTime <= now) {
      throw new Error(`Scheduled time must be in the future. Scheduled: ${scheduledTime.toLocaleString()}, Current: ${now.toLocaleString()}`);
    }
    
    const response = await fetch(`${PUSH_API_BASE}/api/push-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: messageData.title,
        body: messageData.content, // Note: server expects 'body' not 'content'
        scheduledDateTime: scheduledDateTime,
        targetAudience: messageData.targetAudience,
        category: 'Health Tip',
        priority: 'normal',
        createdBy: 'Dashboard'
      }),
    });

    const result: ApiResponse<PushMessage> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create message');
    }

    return result.data as PushMessage;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
}

// Delete a message by ID (Cancel scheduled notification)
export async function deleteMessage(id: string): Promise<void> {
  try {
    const response = await fetch(`${PUSH_API_BASE}/api/notifications/cancel/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<null> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete message');
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

// Fetch message statistics
export async function fetchMessageStats(): Promise<MessageStats> {
  try {
    const response = await fetch(`${PUSH_API_BASE}/api/queue/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch statistics');
    }

    // Convert Bull Queue stats to dashboard format
    const queueStats = result.queue || {};
    const dbStats = result.database || {};
    
    return {
      sentToday: dbStats.totalMessages || 0,
      deliveryRate: 85, // Mock for now - could calculate from message history
      openRate: 42, // Mock for now - would need tracking in mobile app
      scheduled: queueStats.delayed || dbStats.scheduledMessages || 0
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
}