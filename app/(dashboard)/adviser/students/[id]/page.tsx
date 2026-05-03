'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import WorkflowTimeline, { WorkflowStage } from '@/app/components/WorkflowTimeline';
import DataTable from '@/app/components/DataTable';
import {
  ChatIcon,
  CalendarIcon,
  DocumentIcon,
  AcademicCapIcon,
  SparklesIcon,
  ClockIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
} from '@/app/components/Icons';

// Types
interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  email: string;
  phone?: string;
}

interface StudentDetail extends User {
  studentNumber: string;
  program: string;
  enrollmentStatus: 'active' | 'leave' | 'graduated';
  thesisTitle?: string;
  researchTopic?: string;
  yearLevel: string;
  startDate: string;
  expectedCompletionDate?: string;
  adviserNotes?: string;
}

interface User {
  _id: string;
  email: string;
  profile: UserProfile;
  role: 'student' | 'adviser' | 'coordinator' | 'admin';
}

interface Workflow {
  _id: string;
  studentId: string;
  title: string;
  status: 'active' | 'completed' | 'on_hold';
  currentStage: string;
  stages: WorkflowStage[];
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

interface Document {
  _id: string;
  title: string;
  type: 'proposal' | 'manuscript' | 'checklist' | 'template' | 'feedback';
  ownerId: string;
  currentVersion: number;
  updatedAt: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
}

interface AIConsultation {
  _id: string;
  sessionId: string;
  topic: string;
  messageCount: number;
  lastActivity: string;
  summary?: string;
}

interface PageParams {
  id: string;
  [key: string]: string | undefined;
}

// Mock Data
const mockStudent: StudentDetail = {
  _id: 'maria-santos-001',
  email: 'maria.santos@uplb.edu.ph',
  profile: {
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'maria.santos@uplb.edu.ph',
    phone: '+63 912 345 6789',
    avatar: undefined,
  },
  role: 'student',
  studentNumber: '2021-12345',
  program: 'M.S. in Environmental Science',
  enrollmentStatus: 'active',
  thesisTitle: 'Impact of AI-Assisted Learning on Student Metacognition',
  researchTopic: 'Educational Technology and Environmental Learning',
  yearLevel: '2nd Year',
  startDate: '2024-08-01',
  expectedCompletionDate: '2026-05-30',
  adviserNotes: 'Student shows excellent progress. Methodology chapter needs refinement.',
};

const mockWorkflow: Workflow = {
  _id: 'wf-maria-001',
  studentId: 'maria-santos-001',
  title: 'Thesis Research Workflow',
  status: 'active',
  currentStage: 'Data Collection Phase',
  progressPercentage: 65,
  stages: [
    {
      name: 'Topic Selection & Approval',
      order: 1,
      status: 'approved',
      completedAt: '2024-09-15',
    },
    {
      name: 'Literature Review',
      order: 2,
      status: 'approved',
      completedAt: '2024-11-20',
    },
    {
      name: 'Research Proposal Defense',
      order: 3,
      status: 'approved',
      completedAt: '2025-01-25',
    },
    {
      name: 'Data Collection Phase',
      order: 4,
      status: 'in_progress',
      dueDate: '2025-06-30',
    },
    {
      name: 'Data Analysis & Writing',
      order: 5,
      status: 'pending',
      dueDate: '2025-10-31',
    },
    {
      name: 'Final Defense',
      order: 6,
      status: 'pending',
      dueDate: '2026-02-28',
    },
  ],
  createdAt: '2024-08-15',
  updatedAt: '2025-04-20',
};

const mockDocuments: Document[] = [
  {
    _id: 'doc-001',
    title: 'Research Proposal v2.0',
    type: 'proposal',
    ownerId: 'maria-santos-001',
    currentVersion: 3,
    updatedAt: '2025-01-20',
    status: 'approved',
  },
  {
    _id: 'doc-002',
    title: 'Literature Review Chapter',
    type: 'manuscript',
    ownerId: 'maria-santos-001',
    currentVersion: 2,
    updatedAt: '2025-03-15',
    status: 'approved',
  },
  {
    _id: 'doc-003',
    title: 'Methodology Chapter Draft',
    type: 'manuscript',
    ownerId: 'maria-santos-001',
    currentVersion: 1,
    updatedAt: '2025-04-10',
    status: 'under_review',
  },
  {
    _id: 'doc-004',
    title: 'Survey Instruments & Questionnaires',
    type: 'checklist',
    ownerId: 'maria-santos-001',
    currentVersion: 4,
    updatedAt: '2025-04-22',
    status: 'submitted',
  },
];

const mockConsultations: AIConsultation[] = [
  {
    _id: 'consult-001',
    sessionId: 'sess-001',
    topic: 'Survey design for metacognitive awareness',
    messageCount: 12,
    lastActivity: 'Yesterday, 2:30 PM',
    summary: 'Discussed validated instruments for measuring metacognitive awareness in students.',
  },
  {
    _id: 'consult-002',
    sessionId: 'sess-002',
    topic: 'Sample size calculation methodology',
    messageCount: 8,
    lastActivity: 'Apr 20, 2025',
    summary: 'Reviewed power analysis and effect size considerations for the study.',
  },
  {
    _id: 'consult-003',
    sessionId: 'sess-003',
    topic: 'AI tools for environmental education research',
    messageCount: 15,
    lastActivity: 'Apr 15, 2025',
    summary: 'Explored various AI-assisted learning platforms and their applications.',
  },
  {
    _id: 'consult-004',
    sessionId: 'sess-004',
    topic: 'Ethical considerations in AI research',
    messageCount: 6,
    lastActivity: 'Apr 10, 2025',
    summary: 'Reviewed ethical guidelines for conducting research involving AI technologies.',
  },
  {
    _id: 'consult-005',
    sessionId: 'sess-005',
    topic: 'Data analysis software recommendations',
    messageCount: 10,
    lastActivity: 'Apr 5, 2025',
    summary: 'Compared SPSS, R, and Python for analyzing metacognitive data.',
  },
];

// Local Icon Components
function MailIconLocal({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function PhoneIconLocal({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function ChevronLeftIconLocal({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function SaveIconLocal({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  );
}

// Helper functions
function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'approved':
      return 'bg-emerald-100 text-emerald-700';
    case 'submitted':
    case 'under_review':
      return 'bg-amber-100 text-amber-700';
    case 'draft':
      return 'bg-gray-100 text-gray-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-blue-100 text-blue-700';
  }
}

function getDocumentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    proposal: 'Research Proposal',
    manuscript: 'Manuscript',
    checklist: 'Checklist',
    template: 'Template',
    feedback: 'Feedback',
  };
  return labels[type] || type;
}

// Main Component
export default function StudentDetailPage() {
  const params = useParams<PageParams>();
  const router = useRouter();
  const studentId = params.id;

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [consultations, setConsultations] = useState<AIConsultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    async function fetchStudentData() {
      try {
        setLoading(true);
        setError(null);

        // In a real implementation, these would be actual API calls:
        // const studentRes = await fetch(`/api/users/${studentId}`, { credentials: 'include' });
        // const workflowRes = await fetch(`/api/workflows?studentId=${studentId}`, { credentials: 'include' });
        // const documentsRes = await fetch(`/api/documents?ownerId=${studentId}`, { credentials: 'include' });
        // const consultationsRes = await fetch(`/api/ai-queries?studentId=${studentId}&limit=5`, { credentials: 'include' });

        // Simulating API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Using mock data for now
        setStudent(mockStudent);
        setWorkflow(mockWorkflow);
        setDocuments(mockDocuments);
        setConsultations(mockConsultations);
        setNotes(mockStudent.adviserNotes || '');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load student data';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentData();
  }, [studentId]);

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      setNotesSaved(false);

      // In a real implementation:
      // await fetch(`/api/users/${studentId}/adviser-notes`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   credentials: 'include',
      //   body: JSON.stringify({ notes }),
      // });

      await new Promise((resolve) => setTimeout(resolve, 500));
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 3000);
    } catch {
      setError('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleMessageStudent = () => {
    // Navigate to messaging or open modal
    router.push(`/adviser/messages?studentId=${studentId}`);
  };

  const handleScheduleMeeting = () => {
    // Navigate to calendar/scheduling
    router.push(`/adviser/calendar?studentId=${studentId}`);
  };

  const handleReviewDocument = (docId: string) => {
    router.push(`/adviser/reviews?documentId=${docId}`);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="rounded-lg bg-gray-50 px-4 py-12 text-center">
          <p className="text-gray-600">Student not found</p>
        </div>
      </div>
    );
  }

  const initials = getInitials(student.profile.firstName, student.profile.lastName);
  const fullName = `${student.profile.firstName} ${student.profile.lastName}`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href="/adviser/students"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0C0B5D] transition-colors"
      >
        <ChevronLeftIconLocal className="h-4 w-4" />
        Back to Students List
      </Link>

      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0C0B5D] to-[#0C0B5D] text-white shadow-card">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white/20 text-3xl font-bold backdrop-blur-sm border-2 border-white/30">
              {student.profile.avatar ? (
                <img
                  src={student.profile.avatar}
                  alt={fullName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            {/* Student Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{fullName}</h1>
                  <p className="mt-1 text-white/80">{student.program}</p>
                  <p className="text-sm text-white/60">Student No: {student.studentNumber}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                  {student.yearLevel}
                </span>
              </div>

              {/* Contact Info */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <a
                  href={`mailto:${student.profile.email}`}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                  <MailIconLocal className="h-4 w-4" />
                  {student.profile.email}
                </a>
                {student.profile.phone && (
                  <a
                    href={`tel:${student.profile.phone}`}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                  >
                    <PhoneIconLocal className="h-4 w-4" />
                    {student.profile.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thesis Title Card */}
      {student.thesisTitle && (
        <div className="rounded-xl bg-white p-6 shadow-card border-l-4 border-[#0C0B5D]">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0C0B5D]/10 text-[#0C0B5D]">
              <AcademicCapIcon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">Research Thesis</p>
              <h2 className="mt-1 text-xl font-semibold text-gray-900">{student.thesisTitle}</h2>
              {student.researchTopic && (
                <p className="mt-1 text-sm text-gray-600">Topic: {student.researchTopic}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Progress & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Overview */}
          <div className="rounded-xl bg-white p-6 shadow-card">
            <h3 className="text-lg font-semibold text-gray-900">Progress Overview</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ProgressCard
                value={`${workflow?.progressPercentage || 0}%`}
                label="Overall Completion"
                icon={<CheckIcon className="h-5 w-5" />}
                color="bg-emerald-500"
              />
              <ProgressCard
                value={workflow?.currentStage || '—'}
                label="Current Stage"
                icon={<ClockIcon className="h-5 w-5" />}
                color="bg-blue-500"
                isText
              />
              <ProgressCard
                value={documents.length.toString()}
                label="Documents Submitted"
                icon={<DocumentIcon className="h-5 w-5" />}
                color="bg-purple-500"
              />
            </div>
          </div>

          {/* Workflow Timeline */}
          <div className="rounded-xl bg-white p-6 shadow-card">
            <h3 className="text-lg font-semibold text-gray-900">Workflow Timeline</h3>
            {workflow ? (
              <div className="mt-4">
                <WorkflowTimeline stages={workflow.stages} />
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500">No workflow found</p>
            )}
          </div>

          {/* Recent Documents */}
          <div className="rounded-xl bg-white p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Documents</h3>
              <Link
                href={`/adviser/documents?studentId=${studentId}`}
                className="text-sm font-medium text-[#0C0B5D] hover:underline flex items-center gap-1"
              >
                View All
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <DataTable
              columns={[
                {
                  key: 'title',
                  header: 'Document',
                  sortable: true,
                },
                {
                  key: 'type',
                  header: 'Type',
                  sortable: true,
                  render: (doc: Document) => getDocumentTypeLabel(doc.type),
                },
                {
                  key: 'version',
                  header: 'Version',
                  sortable: false,
                  render: (doc: Document) => `v${doc.currentVersion}`,
                },
                {
                  key: 'updatedAt',
                  header: 'Submitted',
                  sortable: true,
                  render: (doc: Document) => formatDate(doc.updatedAt),
                },
                {
                  key: 'status',
                  header: 'Status',
                  sortable: true,
                  render: (doc: Document) => (
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(doc.status)}`}>
                      {doc.status.replace('_', ' ')}
                    </span>
                  ),
                },
                {
                  key: 'action',
                  header: '',
                  sortable: false,
                  render: (doc: Document) => (
                    <button
                      onClick={() => handleReviewDocument(doc._id)}
                      className="text-sm font-medium text-[#0C0B5D] hover:underline"
                    >
                      Review
                    </button>
                  ),
                },
              ]}
              data={documents}
              keyExtractor={(doc) => doc._id}
              emptyMessage="No documents submitted yet."
            />
          </div>

          {/* AI Consultation History */}
          <div className="rounded-xl bg-white p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <SparklesIcon className="h-5 w-5 text-[#0C0B5D]" />
                AI Consultation History
              </h3>
              <span className="text-sm text-gray-500">Last 5 conversations</span>
            </div>
            <div className="space-y-3">
              {consultations.map((consultation) => (
                <div
                  key={consultation._id}
                  className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0C0B5D]/10">
                    <SparklesIcon className="h-4 w-4 text-[#0C0B5D]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{consultation.topic}</p>
                    {consultation.summary && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{consultation.summary}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      <ChatIcon className="mr-1 inline h-3 w-3" />
                      {consultation.messageCount} messages • {consultation.lastActivity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Notes & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-xl bg-white p-6 shadow-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleMessageStudent}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0C0B5D] px-4 py-3 text-sm font-medium text-white hover:bg-[#0a0a4a] transition-colors"
              >
                <ChatIcon className="h-4 w-4" />
                Message Student
              </button>
              <button
                onClick={handleScheduleMeeting}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#0C0B5D] px-4 py-3 text-sm font-medium text-[#0C0B5D] hover:bg-[#0C0B5D]/5 transition-colors"
              >
                <CalendarIcon className="h-4 w-4" />
                Schedule Meeting
              </button>
              <Link
                href={`/adviser/reviews?studentId=${studentId}`}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <DocumentIcon className="h-4 w-4" />
                Review Documents
              </Link>
            </div>
          </div>

          {/* Adviser Notes */}
          <div className="rounded-xl bg-white p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Adviser Notes</h3>
              <div className="flex items-center gap-2">
                {notesSaved && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckIcon className="h-3 w-3" />
                    Saved
                  </span>
                )}
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#0C0B5D] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0a0a4a] disabled:opacity-50 transition-colors"
                >
                  {savingNotes ? (
                    <LoadingSpinner size={12} />
                  ) : (
                    <SaveIconLocal className="h-3 w-3" />
                  )}
                  Save
                </button>
              </div>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes about this student here..."
              rows={8}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#0C0B5D] focus:ring-1 focus:ring-[#0C0B5D] resize-none"
            />
            <p className="mt-2 text-xs text-gray-500">
              These notes are private and only visible to you.
            </p>
          </div>

          {/* Program Info Card */}
          <div className="rounded-xl bg-white p-6 shadow-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Program</dt>
                <dd className="mt-0.5 text-sm text-gray-900">{student.program}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</dt>
                <dd className="mt-0.5">
                  <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 capitalize">
                    {student.enrollmentStatus}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Start Date</dt>
                <dd className="mt-0.5 text-sm text-gray-900">{formatDate(student.startDate)}</dd>
              </div>
              {student.expectedCompletionDate && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expected Completion</dt>
                  <dd className="mt-0.5 text-sm text-gray-900">{formatDate(student.expectedCompletionDate)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Alerts Card */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-6">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <h4 className="font-medium text-amber-900">Upcoming Deadline</h4>
                <p className="mt-1 text-sm text-amber-800">
                  Data Collection Phase is due on June 30, 2025 (68 days remaining)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
interface ProgressCardProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  isText?: boolean;
}

function ProgressCard({ value, label, icon, color, isText }: ProgressCardProps) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color} text-white`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`font-semibold text-gray-900 ${isText ? 'text-sm truncate' : 'text-2xl'}`}>{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
