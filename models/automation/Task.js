import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  // Business Context (Multi-tenant)
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  
  // Related Lead
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  
  // Task Details
  type: {
    type: String,
    enum: ['call', 'whatsapp', 'email', 'meeting', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Scheduling
  dueDate: {
    type: Date,
    required: true
  },
  
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  completedAt: {
    type: Date
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Notes
  notes: {
    type: String,
    trim: true
  },
  
  // Automation
  autoSend: {
    type: Boolean,
    default: false
  },
  messageContent: {
    type: String,
    trim: true
  },
  
  // Reminder
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
TaskSchema.index({ businessId: 1, status: 1, dueDate: 1 });
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ leadId: 1 });

// Virtual for overdue status
TaskSchema.virtual('isOverdue').get(function() {
  return this.status === 'pending' && this.dueDate < new Date();
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);

