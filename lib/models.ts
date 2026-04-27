import mongoose, { Schema } from 'mongoose';
import {
  IUser,
  IStudent,
  IAdviser,
  IWorkflow,
  IDocument,
  IAIQuery,
  IGuidanceResource,
  INotification,
  IAuditLog,
} from './types';

// --- User ---
const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'adviser', 'coordinator', 'admin'],
      required: true,
    },
    profile: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      avatar: { type: String },
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// --- Student ---
const StudentSchema = new Schema<IStudent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentNumber: { type: String, required: true, unique: true },
    program: { type: String, required: true },
    enrollmentStatus: {
      type: String,
      enum: ['active', 'leave', 'graduated'],
      default: 'active',
    },
    thesisTitle: { type: String },
    adviserId: { type: Schema.Types.ObjectId, ref: 'Adviser' },
    startDate: { type: Date, required: true },
    expectedCompletionDate: { type: Date },
  },
  { timestamps: true }
);

export const Student = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);

// --- Adviser ---
const AdviserSchema = new Schema<IAdviser>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    specialization: [{ type: String }],
    maxStudents: { type: Number, default: 10 },
    currentStudents: { type: Number, default: 0 },
    department: { type: String, required: true },
  },
  { timestamps: true }
);

export const Adviser = mongoose.models.Adviser || mongoose.model<IAdviser>('Adviser', AdviserSchema);

// --- Workflow ---
const WorkflowStageSchema = new Schema({
  name: { type: String, required: true },
  order: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'submitted', 'approved', 'rejected'],
    default: 'pending',
  },
  dueDate: { type: Date },
  completedAt: { type: Date },
  documents: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
  feedback: { type: String },
});

const WorkflowSchema = new Schema<IWorkflow>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    adviserId: { type: Schema.Types.ObjectId, ref: 'Adviser', required: true },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'on_hold'],
      default: 'active',
    },
    currentStage: { type: String, default: 'Topic Selection' },
    stages: [WorkflowStageSchema],
  },
  { timestamps: true }
);

export const Workflow = mongoose.models.Workflow || mongoose.model<IWorkflow>('Workflow', WorkflowSchema);

// --- Document ---
const DocumentVersionSchema = new Schema({
  versionNumber: { type: Number, required: true },
  fileUrl: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now },
  changeLog: { type: String },
});

const DocumentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['proposal', 'manuscript', 'checklist', 'template', 'feedback'],
      required: true,
    },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workflowId: { type: Schema.Types.ObjectId, ref: 'Workflow' },
    versions: [DocumentVersionSchema],
    isPublic: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export const DocumentModel = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);

// --- AI Query ---
const AIQuerySchema = new Schema<IAIQuery>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: String, required: true },
    query: { type: String, required: true },
    response: { type: String, required: true },
    sources: [
      {
        title: { type: String },
        type: { type: String },
        url: { type: String },
      },
    ],
    intent: { type: String, required: true },
    isFlagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AIQuery = mongoose.models.AIQuery || mongoose.model<IAIQuery>('AIQuery', AIQuerySchema);

// --- Guidance Resource ---
const GuidanceResourceSchema = new Schema<IGuidanceResource>(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['template', 'checklist', 'guideline', 'policy'],
      required: true,
    },
    content: { type: String, required: true },
    fileUrl: { type: String },
    tags: [{ type: String }],
    program: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const GuidanceResource =
  mongoose.models.GuidanceResource || mongoose.model<IGuidanceResource>('GuidanceResource', GuidanceResourceSchema);

// --- Notification ---
const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['milestone', 'deadline', 'feedback', 'approval', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedId: { type: Schema.Types.ObjectId },
    relatedType: { type: String },
    isRead: { type: Boolean, default: false },
    sentVia: [{ type: String, enum: ['in_app', 'email'] }],
  },
  { timestamps: true }
);

export const Notification =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

// --- Audit Log ---
const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: {
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'ai_query'],
      required: true,
    },
    resource: { type: String, required: true },
    resourceId: { type: Schema.Types.ObjectId },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
