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

// Fetch all messages with optional filtering
export async function fetchMessages(filter: string = 'all'): Promise<PushMessage[]> {
  try {
    const response = await fetch(`/api/push-messages?status=${filter}`, {
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
    const response = await fetch('/api/push-messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
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

// Delete a message by ID
export async function deleteMessage(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/push-messages?id=${id}`, {
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
    const response = await fetch('/api/push-messages/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<MessageStats> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch statistics');
    }

    return result.data || { sentToday: 0, deliveryRate: 0, openRate: 0, scheduled: 0 };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
}