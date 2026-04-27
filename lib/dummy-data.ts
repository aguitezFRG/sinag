// Dummy data store for Project SINAG v1 (frontend-first, no real backend)

// bcrypt hash of "password123" for demo users
const DEMO_PASSWORD_HASH = '$2b$12$EEILxE7EGv08AQEGEEhOKOlCHmORWKFKDdS4KlFoobcLGuEjougB.';

export const dummyUsers = [
  { _id: 'u1', email: 'student@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'student', profile: { firstName: 'Juan', lastName: 'Dela Cruz', avatar: '' }, isActive: true, createdAt: '2023-01-15T00:00:00.000Z', lastLoginAt: '2023-12-01T09:00:00.000Z' },
  { _id: 'u2', email: 'adviser@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'adviser', profile: { firstName: 'Maria', lastName: 'Santos', avatar: '' }, isActive: true, createdAt: '2023-01-10T00:00:00.000Z', lastLoginAt: '2023-12-05T14:30:00.000Z' },
  { _id: 'u3', email: 'coordinator@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'coordinator', profile: { firstName: 'Pedro', lastName: 'Reyes', avatar: '' }, isActive: true, createdAt: '2023-01-05T00:00:00.000Z', lastLoginAt: '2023-12-10T08:15:00.000Z' },
  { _id: 'u4', email: 'admin@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'admin', profile: { firstName: 'Ana', lastName: 'Garcia', avatar: '' }, isActive: true, createdAt: '2023-01-01T00:00:00.000Z', lastLoginAt: '2023-12-12T11:00:00.000Z' },
];

export const dummyStudents = [
  { _id: 's1', userId: 'u1', studentNumber: '2023-00001', program: 'MSES', enrollmentStatus: 'active', thesisTitle: 'Climate Resilience in Philippine Coastal Communities', adviserId: 'a1', startDate: '2023-06-01', expectedCompletionDate: '2025-06-01' },
  { _id: 's2', userId: 'u5', studentNumber: '2023-00002', program: 'PhD-ES', enrollmentStatus: 'active', thesisTitle: 'Biodiversity Conservation in Urban Ecosystems', adviserId: 'a1', startDate: '2023-08-15', expectedCompletionDate: '2027-08-15' },
];

export const dummyAdvisers = [
  { _id: 'a1', userId: 'u2', specialization: ['Climate Science', 'Coastal Management'], maxStudents: 8, currentStudents: 2, department: 'SESAM' },
];

export const dummyWorkflows = [
  {
    _id: 'w1',
    studentId: 's1',
    adviserId: 'a1',
    title: 'Climate Resilience in Philippine Coastal Communities',
    status: 'active',
    currentStage: 'Proposal Development',
    stages: [
      { name: 'Topic Selection', order: 1, status: 'approved', dueDate: '2023-09-01', completedAt: '2023-08-28', documents: [], feedback: 'Topic is well-defined and relevant.' },
      { name: 'Proposal Development', order: 2, status: 'in_progress', dueDate: '2024-01-15', completedAt: null, documents: ['d1'], feedback: '' },
      { name: 'Ethics Approval', order: 3, status: 'pending', dueDate: '2024-03-01', completedAt: null, documents: [], feedback: '' },
      { name: 'Data Collection', order: 4, status: 'pending', dueDate: '2024-08-01', completedAt: null, documents: [], feedback: '' },
      { name: 'Manuscript Writing', order: 5, status: 'pending', dueDate: '2025-01-01', completedAt: null, documents: [], feedback: '' },
      { name: 'Final Defense', order: 6, status: 'pending', dueDate: '2025-05-01', completedAt: null, documents: [], feedback: '' },
    ],
    createdAt: '2023-06-15T00:00:00.000Z',
    updatedAt: '2023-12-01T00:00:00.000Z',
  },
  {
    _id: 'w2',
    studentId: 's2',
    adviserId: 'a1',
    title: 'Biodiversity Conservation in Urban Ecosystems',
    status: 'active',
    currentStage: 'Topic Selection',
    stages: [
      { name: 'Topic Selection', order: 1, status: 'submitted', dueDate: '2023-11-01', completedAt: null, documents: ['d2'], feedback: '' },
      { name: 'Proposal Development', order: 2, status: 'pending', dueDate: '2024-02-01', completedAt: null, documents: [], feedback: '' },
      { name: 'Ethics Approval', order: 3, status: 'pending', dueDate: '2024-04-01', completedAt: null, documents: [], feedback: '' },
      { name: 'Data Collection', order: 4, status: 'pending', dueDate: '2024-09-01', completedAt: null, documents: [], feedback: '' },
      { name: 'Manuscript Writing', order: 5, status: 'pending', dueDate: '2025-02-01', completedAt: null, documents: [], feedback: '' },
      { name: 'Final Defense', order: 6, status: 'pending', dueDate: '2025-07-01', completedAt: null, documents: [], feedback: '' },
    ],
    createdAt: '2023-09-01T00:00:00.000Z',
    updatedAt: '2023-10-15T00:00:00.000Z',
  },
];

export const dummyDocuments = [
  {
    _id: 'd1', title: 'Research Proposal v1', type: 'proposal', ownerId: 'u1', workflowId: 'w1',
    versions: [
      { versionNumber: 1, fileUrl: 'https://example.com/docs/proposal-v1.pdf', uploadedBy: 'u1', uploadedAt: '2023-11-15T00:00:00.000Z', changeLog: 'Initial proposal draft' },
    ],
    isPublic: false, tags: ['proposal', 'climate'], createdAt: '2023-11-15T00:00:00.000Z', updatedAt: '2023-11-15T00:00:00.000Z',
  },
  {
    _id: 'd2', title: 'Topic Approval Form', type: 'checklist', ownerId: 'u5', workflowId: 'w2',
    versions: [
      { versionNumber: 1, fileUrl: 'https://example.com/docs/topic-form.pdf', uploadedBy: 'u5', uploadedAt: '2023-10-20T00:00:00.000Z', changeLog: 'Submitted for approval' },
    ],
    isPublic: false, tags: ['topic', 'approval'], createdAt: '2023-10-20T00:00:00.000Z', updatedAt: '2023-10-20T00:00:00.000Z',
  },
];

export const dummyAIQueries = [
  {
    _id: 'q1', userId: 'u1', sessionId: 'sess-1', query: 'How do I structure a literature review for climate resilience research?',
    response: 'A literature review for climate resilience research should be structured thematically. Start with an introduction defining climate resilience and its relevance to your study area. Organize the body into themes such as: (1) conceptual frameworks of resilience, (2) climate vulnerability assessments, (3) adaptation strategies in coastal communities, and (4) policy implications. Conclude by identifying research gaps your study addresses. Remember: this guidance is advisory—consult your adviser for discipline-specific expectations.',
    sources: [
      { title: 'SESAM Thesis Format Guide', type: 'guideline', url: '' },
      { title: 'Literature Review Checklist', type: 'checklist', url: '' },
    ],
    intent: 'methodology', isFlagged: false, createdAt: '2023-12-01T10:00:00.000Z',
  },
  {
    _id: 'q2', userId: 'u1', sessionId: 'sess-1', query: 'What statistical methods are appropriate for coastal survey data?',
    response: 'For coastal survey data, common statistical methods include: (1) Descriptive statistics for demographic and socioeconomic profiles; (2) Regression analysis to identify factors affecting resilience; (3) GIS-based spatial analysis for mapping vulnerability; (4) Participatory Rural Appraisal (PRA) techniques for qualitative data. Choose methods aligned with your research questions. Consult your statistician or adviser for validation. [ADVISORY]',
    sources: [
      { title: 'Research Methodology Framework', type: 'guideline', url: '' },
    ],
    intent: 'research_design', isFlagged: false, createdAt: '2023-12-01T10:15:00.000Z',
  },
];

export const dummyGuidanceResources = [
  { _id: 'g1', title: 'SESAM Thesis Format Guide', category: 'guideline' as const, content: 'This guide outlines the standard format for SESAM theses...', fileUrl: '', tags: ['thesis', 'format'], program: 'MSES', isActive: true, createdAt: '2023-01-01', updatedAt: '2023-06-01' },
  { _id: 'g2', title: 'Research Proposal Template', category: 'template' as const, content: '1. Title Page\n2. Abstract\n3. Introduction\n4. Literature Review...', fileUrl: '', tags: ['proposal', 'template'], program: '', isActive: true, createdAt: '2023-01-01', updatedAt: '2023-06-01' },
  { _id: 'g3', title: 'Ethics Compliance Checklist', category: 'checklist' as const, content: '- [ ] Informed consent obtained\n- [ ] Data anonymization plan\n- [ ] Risk assessment completed...', fileUrl: '', tags: ['ethics', 'checklist'], program: '', isActive: true, createdAt: '2023-01-01', updatedAt: '2023-06-01' },
  { _id: 'g4', title: 'JESAM Publication Standards', category: 'policy' as const, content: 'All manuscripts must adhere to JESAM formatting standards...', fileUrl: '', tags: ['publication', 'jesam'], program: '', isActive: true, createdAt: '2023-01-01', updatedAt: '2023-06-01' },
  { _id: 'g5', title: 'Literature Review Checklist', category: 'checklist' as const, content: '- [ ] Key themes identified\n- [ ] Gaps in research documented\n- [ ] Theoretical framework selected...', fileUrl: '', tags: ['literature', 'checklist'], program: '', isActive: true, createdAt: '2023-01-01', updatedAt: '2023-06-01' },
];

export const dummyNotifications = [
  { _id: 'n1', userId: 'u1', type: 'milestone' as const, title: 'Proposal Due Soon', message: 'Your proposal development stage is due on January 15, 2024.', relatedId: 'w1', relatedType: 'workflow', isRead: false, sentVia: ['in_app', 'email'] as ('in_app' | 'email')[], createdAt: '2023-12-20T00:00:00.000Z' },
  { _id: 'n2', userId: 'u1', type: 'feedback' as const, title: 'Feedback Received', message: 'Your adviser has provided feedback on your topic selection.', relatedId: 'w1', relatedType: 'workflow', isRead: false, sentVia: ['in_app'] as ('in_app' | 'email')[], createdAt: '2023-08-29T00:00:00.000Z' },
  { _id: 'n3', userId: 'u2', type: 'approval' as const, title: 'Document Submitted', message: 'A student has submitted a document for your review.', relatedId: 'd2', relatedType: 'document', isRead: false, sentVia: ['in_app', 'email'] as ('in_app' | 'email')[], createdAt: '2023-10-20T00:00:00.000Z' },
  { _id: 'n4', userId: 'u1', type: 'deadline' as const, title: 'Ethics Application Reminder', message: 'Remember to submit your ethics application before March 1.', relatedId: 'w1', relatedType: 'workflow', isRead: true, sentVia: ['in_app'] as ('in_app' | 'email')[], createdAt: '2023-11-01T00:00:00.000Z' },
];

export const dummyAuditLogs = [
  { _id: 'al1', userId: 'u1', action: 'login' as const, resource: 'auth', resourceId: '', details: {}, ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', timestamp: '2023-12-01T09:00:00.000Z' },
  { _id: 'al2', userId: 'u1', action: 'ai_query' as const, resource: 'queries', resourceId: 'q1', details: { query: 'How do I structure a literature review...' }, ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', timestamp: '2023-12-01T10:00:00.000Z' },
  { _id: 'al3', userId: 'u1', action: 'create' as const, resource: 'document', resourceId: 'd1', details: { title: 'Research Proposal v1' }, ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', timestamp: '2023-11-15T00:00:00.000Z' },
  { _id: 'al4', userId: 'u2', action: 'update' as const, resource: 'workflow', resourceId: 'w1', details: { stage: 'Topic Selection', status: 'approved' }, ipAddress: '192.168.1.2', userAgent: 'Mozilla/5.0', timestamp: '2023-08-28T00:00:00.000Z' },
  { _id: 'al5', userId: 'u4', action: 'read' as const, resource: 'users', resourceId: '', details: {}, ipAddress: '192.168.1.4', userAgent: 'Mozilla/5.0', timestamp: '2023-12-05T00:00:00.000Z' },
];

// System Settings - Admin Configurable
export const defaultSettings = {
  email: {
    smtpServer: 'smtp.uplb.edu.ph',
    smtpPort: 587,
    fromAddress: 'sinag@sesam.uplb.edu.ph',
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
  },
  security: {
    sessionTimeout: 60,
    passwordExpiry: 90,
    allowedIPs: '',
  },
  backup: {
    autoBackup: true,
    lastBackup: '2026-04-27T02:00:00Z',
  },
  maintenance: {
    maintenanceMode: false,
  },
  system: {
    version: 'SINAG v2.0.1',
    environment: 'Production',
    status: 'Online',
    uptime: '45 days, 12 hours',
  },
};

export let systemSettings = { ...defaultSettings };

// Current logged-in user for demo (in-memory session)
export let currentUser: typeof dummyUsers[0] | null = null;

// Setter for currentUser (required for ES module compatibility)
export function setCurrentUser(user: typeof dummyUsers[0] | null) {
  currentUser = user;
}

// In-memory mutable stores for mutations
export let users = [...dummyUsers];
export let workflows = [...dummyWorkflows];
export let documents = [...dummyDocuments];
export let aiQueries = [...dummyAIQueries];
export let guidanceResources = [...dummyGuidanceResources];
export let notifications = [...dummyNotifications];
export let auditLogs = [...dummyAuditLogs];
