import mongoose from 'mongoose';

// Deliverable Schema (Sub-document)
const DeliverableSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  dueDate: Date,
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Delivered', 'Approved'],
    default: 'Pending'
  },
  proofLinks: [String],
  completedAt: Date
});

const ServiceSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CMS_Client',
    required: true,
    index: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  name: { type: String, required: true },
  category: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Monthly', 'One-time'],
    default: 'Monthly'
  },
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Delivered', 'Paused'],
    default: 'In Progress'
  },
  sla: {
    turnaroundDays: Number,
    responseHours: Number
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  deliverables: [DeliverableSchema]
}, {
  timestamps: true,
  collection: 'cms_services'
});

const TaskSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CMS_Client',
    required: true,
    index: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CMS_Service'
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
  },
  title: { type: String, required: true },
  description: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Review', 'Completed', 'Blocked'],
    default: 'To Do'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  dueDate: Date,
  isRecurring: { type: Boolean, default: false },
  recurringInterval: {
    type: String,
    enum: ['Weekly', 'Monthly', 'Quarterly']
  },
  parentTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CMS_Task'
  },
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CMS_Task'
  }],
  auditLog: [{
    action: String,
    userId: mongoose.Schema.Types.ObjectId,
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  collection: 'cms_tasks'
});

export const CMS_Service = mongoose.models.CMS_Service || mongoose.model('CMS_Service', ServiceSchema);
export const CMS_Task = mongoose.models.CMS_Task || mongoose.model('CMS_Task', TaskSchema);
