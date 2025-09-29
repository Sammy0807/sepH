import mongoose from 'mongoose';

const UserAudienceSchema = new mongoose.Schema({
  audienceType: {
    type: String,
    required: [true, 'Audience type is required'],
    unique: true,
    enum: ['All Users', 'Active Users', 'New Users', 'Premium Users'],
    trim: true
  },
  count: {
    type: Number,
    required: [true, 'User count is required'],
    min: [0, 'Count cannot be negative'],
    default: 0
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    updateFrequency: {
      type: String,
      enum: ['manual', 'daily', 'weekly', 'monthly'],
      default: 'manual'
    },
    lastCalculatedAt: {
      type: Date
    },
    calculationMethod: {
      type: String,
      enum: ['manual', 'automated', 'query-based'],
      default: 'manual'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted count
UserAudienceSchema.virtual('formattedCount').get(function() {
  return this.count.toLocaleString();
});

// Virtual for time since last update
UserAudienceSchema.virtual('timeSinceUpdate').get(function() {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - this.lastUpdated.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Updated recently';
  if (diffInHours < 24) return `Updated ${diffInHours} hours ago`;
  if (diffInHours < 48) return 'Updated yesterday';
  return `Updated ${Math.floor(diffInHours / 24)} days ago`;
});

// Index for efficient querying (audienceType already has unique index)
UserAudienceSchema.index({ isActive: 1, audienceType: 1 });

// Pre-save middleware to update lastUpdated
UserAudienceSchema.pre('save', function(next) {
  if (this.isModified('count')) {
    this.lastUpdated = new Date();
  }
  next();
});

// Static method to get all active audience counts
UserAudienceSchema.statics.getActiveCounts = async function() {
  const audiences = await this.find({ isActive: true }).sort({ audienceType: 1 });
  
  const counts: Record<string, number> = {};
  audiences.forEach((audience: { audienceType: string; count: number }) => {
    counts[audience.audienceType] = audience.count;
  });
  
  return counts;
};

// Static method to calculate recipients based on target audience
UserAudienceSchema.statics.calculateRecipients = async function(targetAudience: string[]) {
  if (targetAudience.includes('All Users')) {
    const allUsers = await this.findOne({ audienceType: 'All Users', isActive: true });
    return allUsers ? allUsers.count : 0;
  }
  
  const audiences = await this.find({ 
    audienceType: { $in: targetAudience }, 
    isActive: true 
  });
  
  return audiences.reduce((total: number, audience: { count: number }) => total + audience.count, 0);
};

// Static method to get audience statistics
UserAudienceSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: '$count' },
        audienceCount: { $sum: 1 },
        lastUpdated: { $max: '$lastUpdated' }
      }
    }
  ]);

  return stats[0] || { totalUsers: 0, audienceCount: 0, lastUpdated: new Date() };
};

export default mongoose.models.UserAudience || mongoose.model('UserAudience', UserAudienceSchema);