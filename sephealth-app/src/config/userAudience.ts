// User audience configuration for push messages
// These numbers represent estimated user counts for each audience type
// Update these based on your actual user base

export const USER_AUDIENCE_CONFIG = {
  'All Users': 1247,       // Total active users in your platform
  'Active Users': 850,     // Users who have been active in the last 30 days
  'New Users': 200,        // Users who joined in the last 7 days
  'Premium Users': 150     // Users with premium subscriptions
};

// Function to calculate recipients based on target audience
export function calculateRecipients(targetAudience: string[]): number {
  if (targetAudience.includes('All Users')) {
    return USER_AUDIENCE_CONFIG['All Users'];
  }
  
  let estimatedRecipients = 0;
  targetAudience.forEach(audience => {
    if (audience in USER_AUDIENCE_CONFIG) {
      estimatedRecipients += USER_AUDIENCE_CONFIG[audience as keyof typeof USER_AUDIENCE_CONFIG];
    }
  });
  
  return estimatedRecipients;
}

// Function to get audience description
export function getAudienceDescription(audience: string): string {
  const descriptions = {
    'All Users': 'All registered users in the platform',
    'Active Users': 'Users who have been active in the last 30 days',
    'New Users': 'Users who joined in the last 7 days',
    'Premium Users': 'Users with premium subscriptions'
  };
  
  return descriptions[audience as keyof typeof descriptions] || 'Unknown audience';
}