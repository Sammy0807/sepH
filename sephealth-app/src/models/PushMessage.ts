import mongoose from 'mongoose';

const PushMessageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Message title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxLength: [1000, 'Content cannot exceed 1000 characters']
  },
  sendDate: {
    type: String,
    required: [true, 'Send date is required']
  },
  sendTime: {
    type: String,
    required: [true, 'Send time is required'],
    default: '09:00'
  },
  timezoneStrategy: {
    type: String,
    required: true,
    enum: ['utc', 'local', 'major'],
    default: 'utc'
  },
  targetAudience: [{
    type: String,
    enum: ['All Users', 'Active Users', 'New Users', 'Premium Users'],
    required: true
  }],
  status: {
    type: String,
    required: true,
    enum: ['Draft', 'Scheduled', 'Delivered', 'Failed'],
    default: 'Draft'
  },
  recipients: {
    type: Number,
    default: 0,
    min: 0
  },
  deliveryRate: {
    type: String,
    default: '-'
  },
  deliveredCount: {
    type: Number,
    default: 0,
    min: 0
  },
  openCount: {
    type: Number,
    default: 0,
    min: 0
  },
  scheduledDateTime: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  createdBy: {
    type: String,
    default: 'Admin'
  },
  notes: {
    type: String,
    maxLength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating open rate
PushMessageSchema.virtual('openRate').get(function() {
  if (this.deliveredCount === 0) return 0;
  return Math.round((this.openCount / this.deliveredCount) * 100);
});

// Virtual for calculating actual delivery rate
PushMessageSchema.virtual('actualDeliveryRate').get(function() {
  if (this.recipients === 0) return 0;
  return Math.round((this.deliveredCount / this.recipients) * 100);
});

// Index for efficient querying
PushMessageSchema.index({ status: 1, createdAt: -1 });
PushMessageSchema.index({ sendDate: 1, sendTime: 1 });

// Pre-save middleware to calculate recipients based on target audience
PushMessageSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('targetAudience')) {
    try {
      // Import UserAudience model to calculate recipients from database
      const UserAudience = mongoose.models.UserAudience || 
        (await import('./UserAudience')).default;
      
      // Calculate recipients manually
      if (this.targetAudience.includes('All Users')) {
        const allUsers = await UserAudience.findOne({ audienceType: 'All Users', isActive: true });
        this.recipients = allUsers ? allUsers.count : 0;
      } else {
        const audiences = await UserAudience.find({ 
          audienceType: { $in: this.targetAudience }, 
          isActive: true 
        });
        this.recipients = audiences.reduce((total, audience) => total + audience.count, 0);
      }
    } catch (error) {
      console.error('Error calculating recipients:', error);
      // Fallback to 0 if calculation fails
      this.recipients = 0;
    }
  }
  
  // Set scheduled datetime if status is scheduled
  if (this.status === 'Scheduled' && this.sendDate && this.sendTime) {
    const [hours, minutes] = this.sendTime.split(':');
    const scheduledDate = new Date(this.sendDate);
    scheduledDate.setUTCHours(parseInt(hours), parseInt(minutes), 0, 0);
    this.scheduledDateTime = scheduledDate;
  }
  
  next();
});

// Static method to get message statistics
PushMessageSchema.statics.getStatistics = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const stats = await this.aggregate([
    {
      $facet: {
        sentToday: [
          {
            $match: {
              status: 'Delivered',
              deliveredAt: { $gte: today, $lt: tomorrow }
            }
          },
          { $count: 'count' }
        ],
        scheduled: [
          {
            $match: { status: 'Scheduled' }
          },
          { $count: 'count' }
        ],
        totalDelivered: [
          {
            $match: { status: 'Delivered' }
          },
          {
            $group: {
              _id: null,
              totalRecipients: { $sum: '$recipients' },
              totalDelivered: { $sum: '$deliveredCount' },
              totalOpened: { $sum: '$openCount' }
            }
          }
        ]
      }
    }
  ]);

  const result = stats[0];
  const sentToday = result.sentToday[0]?.count || 0;
  const scheduled = result.scheduled[0]?.count || 0;
  
  let deliveryRate = 0;
  let openRate = 0;
  
  if (result.totalDelivered[0]) {
    const { totalRecipients, totalDelivered, totalOpened } = result.totalDelivered[0];
    deliveryRate = totalRecipients > 0 ? Math.round((totalDelivered / totalRecipients) * 100) : 0;
    openRate = totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0;
  }

  return {
    sentToday,
    deliveryRate,
    openRate,
    scheduled
  };
};

export default mongoose.models.PushMessage || mongoose.model('PushMessage', PushMessageSchema);