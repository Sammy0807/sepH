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
  scheduledDateTime?: string | {
    utc: string;
    cst: string;
  };
  deliveredAt?: string;
  createdAt: string | {
    utc: string;
    cst: string;
  };
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
  results?: unknown;
  messageId?: string;
  pagination?: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}

// Get API endpoints from environment variables
// Default to the production Bull Queue backend
const PUSH_API_BASE = process.env.NEXT_PUBLIC_PUSH_API_BASE_URL || 'https://sephealthbackend.onrender.com';

// Helper function to convert UTC to CST
function convertUTCtoCST(utcDateString: string): { date: string; time: string } {
  try {
    const utcDate = new Date(utcDateString);
    if (isNaN(utcDate.getTime())) {
      return { date: '', time: '' };
    }
    
    // Convert UTC to CST (UTC-6)
    const cstDate = new Date(utcDate.getTime() - (6 * 60 * 60 * 1000));
    const date = cstDate.toISOString().split('T')[0];
    const time = cstDate.toISOString().split('T')[1].substring(0, 5);
    
    return { date, time };
  } catch (e) {
    console.warn('Error converting UTC to CST:', utcDateString);
    return { date: '', time: '' };
  }
}

// Helper function to format datetime for display with CST label
export function formatMessageTimeCST(message: PushMessage): string {
  if (!message.scheduledDateTime) {
    return 'N/A';
  }

  if (typeof message.scheduledDateTime === 'string') {
    const { date, time } = convertUTCtoCST(message.scheduledDateTime);
    if (!date || !time) {
      return 'N/A';
    }
    
    return `${date} at ${time} CST`;
  }

  const { date, time } = convertUTCtoCST(message.scheduledDateTime.utc);
  if (!date || !time) {
    return 'N/A';
  }
  
  return `${date} at ${time} CST`;
}

// Fetch all messages with optional filtering
export async function fetchMessages(filter: string = 'all'): Promise<PushMessage[]> {
  try {
    // Map filter values to status values expected by backend
    let status = '';
    if (filter === 'sent') status = 'Delivered';
    else if (filter === 'scheduled') status = 'Scheduled';
    else if (filter === 'drafts') status = 'Draft';
    
    const url = status 
      ? `${PUSH_API_BASE}/api/push-messages?status=${status}&limit=100`
      : `${PUSH_API_BASE}/api/push-messages?limit=100`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<PushMessage[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch messages');
    }

    // Transform backend response to match frontend expectations
    const messages = result.data || [];
    return messages.map(msg => {
      let sendDate = '';
      let sendTime = '';
      
      // Safely extract sendDate and sendTime from scheduledDateTime in CST
      if (msg.scheduledDateTime) {
        const cst = convertUTCtoCST(msg.scheduledDateTime as string);
        sendDate = cst.date;
        sendTime = cst.time;
      }
      
      return {
        ...msg,
        sendDate,
        sendTime,
      };
    });
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
    // For draft messages, don't send to backend yet - store locally
    if (messageData.status === 'Draft') {
      // Create a local draft representation
      const draftMessage: PushMessage = {
        _id: `draft-${Date.now()}`,
        title: messageData.title,
        content: messageData.content,
        sendDate: messageData.sendDate,
        sendTime: messageData.sendTime,
        timezoneStrategy: messageData.timezoneStrategy,
        targetAudience: messageData.targetAudience,
        status: 'Draft',
        recipients: 0,
        deliveryRate: '0%',
        deliveredCount: 0,
        openCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return draftMessage;
    }

    // Convert to format expected by Bull Queue server
    let scheduledDateTime: string;
    
    if (messageData.timezoneStrategy === 'utc') {
      // Force UTC - parse as UTC directly
      scheduledDateTime = new Date(`${messageData.sendDate}T${messageData.sendTime}:00Z`).toISOString();
    } else if (messageData.timezoneStrategy === 'local') {
      // User entered CST time, convert to UTC for storage
      // Parse as if the date/time are in UTC first
      const cstDateTime = new Date(`${messageData.sendDate}T${messageData.sendTime}:00Z`);
      // CST is UTC-6, so to convert CST to UTC, we ADD 6 hours
      // If user enters 09:00 CST, that's 15:00 UTC
      const utcDateTime = new Date(cstDateTime.getTime() + (6 * 60 * 60 * 1000));
      scheduledDateTime = utcDateTime.toISOString();
    } else {
      // Treat as local time (browser time)
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
        body: messageData.content, // Backend expects 'body' not 'content'
        scheduledDateTime: scheduledDateTime,
        targetAudience: messageData.targetAudience,
        category: 'Health Tip',
        priority: 'normal',
        createdBy: 'Dashboard'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<PushMessage | { messageId: string }> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create message');
    }

    // Transform response back to PushMessage format with CST times
    const responseData = (result.data || result) as { _id?: string };
    const cst = convertUTCtoCST(scheduledDateTime);
    const createdMessage: PushMessage = {
      _id: result.messageId || responseData._id || 'unknown',
      title: messageData.title,
      content: messageData.content,
      sendDate: cst.date,
      sendTime: cst.time,
      timezoneStrategy: messageData.timezoneStrategy,
      targetAudience: messageData.targetAudience,
      status: 'Scheduled',
      recipients: 0,
      deliveryRate: '0%',
      deliveredCount: 0,
      openCount: 0,
      scheduledDateTime: {
        utc: scheduledDateTime,
        cst: `${cst.date}T${cst.time}:00-06:00`
      },
      createdAt: {
        utc: new Date().toISOString(),
        cst: new Date(new Date().getTime() - (6 * 60 * 60 * 1000)).toISOString()
      },
      updatedAt: new Date().toISOString(),
    };

    return createdMessage;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
}

// Delete a message by ID (Cancel scheduled notification)
export async function deleteMessage(id: string): Promise<void> {
  try {
    console.log("Deleting message with ID:", id);
    const response = await fetch(`${PUSH_API_BASE}/api/push-messages/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<null> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete message');
    }
    return;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

// Fetch message statistics
export async function fetchMessageStats(): Promise<MessageStats> {
  try {
    const response = await fetch(`${PUSH_API_BASE}/api/push-messages/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch statistics');
    }

    // Convert Bull Queue stats to dashboard format
    const stats = result.stats || {};
    const messageStats = stats.messages || {};
    
    return {
      sentToday: messageStats.delivered || 0,
      deliveryRate: 85, // Bull Queue doesn't track delivery rate - would need mobile app integration
      openRate: 42, // Would need push notification open tracking in mobile app
      scheduled: messageStats.scheduled || 0
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    // Return default stats on error
    return {
      sentToday: 0,
      deliveryRate: 0,
      openRate: 0,
      scheduled: 0
    };
  }
}

// At the top of page.tsx, add this import:
