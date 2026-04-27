import { Document, Types } from 'mongoose';

export type UserRole = 'student' | 'adviser' | 'coordinator' | 'admin';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudent extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  studentNumber: string;
  program: string;
  enrollmentStatus: 'active' | 'leave' | 'graduated';
  thesisTitle?: string;
  adviserId?: Types.ObjectId;
  startDate: Date;
  expectedCompletionDate?: Date;
}

export interface IAdviser extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  specialization: string[];
  maxStudents: number;
  currentStudents: number;
  department: string;
}

export interface IWorkflowStage {
  name: string;
  order: number;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  dueDate?: Date;
  completedAt?: Date;
  documents: Types.ObjectId[];
  feedback?: string;
}

export interface IWorkflow extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  adviserId: Types.ObjectId;
  title: string;
  status: 'active' | 'completed' | 'on_hold';
  currentStage: string;
  stages: IWorkflowStage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocumentVersion {
  versionNumber: number;
  fileUrl: string;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
  changeLog?: string;
}

export interface IDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  type: 'proposal' | 'manuscript' | 'checklist' | 'template' | 'feedback';
  ownerId: Types.ObjectId;
  workflowId?: Types.ObjectId;
  versions: IDocumentVersion[];
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAIQuery extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  sessionId: string;
  query: string;
  response: string;
  sources: { title: string; type: string; url?: string }[];
  intent: string;
  isFlagged: boolean;
  createdAt: Date;
}

export interface IGuidanceResource extends Document {
  _id: Types.ObjectId;
  title: string;
  category: 'template' | 'checklist' | 'guideline' | 'policy';
  content: string;
  fileUrl?: string;
  tags: string[];
  program?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: 'milestone' | 'deadline' | 'feedback' | 'approval' | 'system';
  title: string;
  message: string;
  relatedId?: Types.ObjectId;
  relatedType?: string;
  isRead: boolean;
  sentVia: ('in_app' | 'email')[];
  createdAt: Date;
}

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'ai_query';
  resource: string;
  resourceId?: Types.ObjectId;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
