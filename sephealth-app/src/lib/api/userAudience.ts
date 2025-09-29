// Types for User Audience
export interface UserAudience {
  _id: string;
  audienceType: 'All Users' | 'Active Users' | 'New Users' | 'Premium Users';
  count: number;
  description: string;
  lastUpdated: string;
  isActive: boolean;
  metadata: {
    updateFrequency: 'manual' | 'daily' | 'weekly' | 'monthly';
    lastCalculatedAt?: string;
    calculationMethod: 'manual' | 'automated' | 'query-based';
  };
  formattedCount: string;
  timeSinceUpdate: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAudienceStats {
  totalUsers: number;
  audienceCount: number;
  lastUpdated: string;
  audienceBreakdown: Record<string, number>;
}

export interface UserAudienceResponse {
  success: boolean;
  data: UserAudience[];
  count: number;
}

export interface UserAudienceStatsResponse {
  success: boolean;
  data: UserAudienceStats;
}

export interface CreateUserAudienceRequest {
  audienceType: string;
  count: number;
  description: string;
  metadata?: {
    updateFrequency?: 'manual' | 'daily' | 'weekly' | 'monthly';
    calculationMethod?: 'manual' | 'automated' | 'query-based';
  };
}

// API Functions
export async function fetchUserAudiences(activeOnly = true): Promise<UserAudience[]> {
  const response = await fetch(`/api/user-audience?active=${activeOnly}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch user audiences');
  }
  
  const result: UserAudienceResponse = await response.json();
  
  if (!result.success) {
    throw new Error('Failed to fetch user audiences');
  }
  
  return result.data;
}

export async function fetchUserAudienceStats(): Promise<UserAudienceStats> {
  const response = await fetch('/api/user-audience/stats');
  
  if (!response.ok) {
    throw new Error('Failed to fetch user audience statistics');
  }
  
  const result: UserAudienceStatsResponse = await response.json();
  
  if (!result.success) {
    throw new Error('Failed to fetch user audience statistics');
  }
  
  return result.data;
}

export async function createOrUpdateUserAudience(data: CreateUserAudienceRequest): Promise<UserAudience> {
  const response = await fetch('/api/user-audience', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create/update user audience');
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to create/update user audience');
  }
  
  return result.data;
}

export async function updateUserAudience(data: Partial<CreateUserAudienceRequest> & { audienceType: string }): Promise<UserAudience> {
  const response = await fetch('/api/user-audience', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update user audience');
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to update user audience');
  }
  
  return result.data;
}

export async function deleteUserAudience(audienceType: string): Promise<void> {
  const response = await fetch(`/api/user-audience?audienceType=${encodeURIComponent(audienceType)}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete user audience');
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete user audience');
  }
}

// Helper function to get audience counts for recipient calculation
export async function getAudienceCounts(): Promise<Record<string, number>> {
  const audiences = await fetchUserAudiences(true);
  const counts: Record<string, number> = {};
  
  audiences.forEach(audience => {
    counts[audience.audienceType] = audience.count;
  });
  
  return counts;
}

// Helper function to calculate recipients based on target audience
export async function calculateRecipientsFromDB(targetAudience: string[]): Promise<number> {
  const counts = await getAudienceCounts();
  
  if (targetAudience.includes('All Users')) {
    return counts['All Users'] || 0;
  }
  
  return targetAudience.reduce((total, audience) => {
    return total + (counts[audience] || 0);
  }, 0);
}