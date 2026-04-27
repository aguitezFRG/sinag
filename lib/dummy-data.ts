// Unified Dummy Data Model for Project SINAG Stats
// This file provides a single source of truth for all dashboard statistics

// ============================================
// 1. EXPANDED DUMMY DATA SET
// ============================================

// bcrypt hash of "password123" for demo users
const DEMO_PASSWORD_HASH = '$2b$12$EEILxE7EGv08AQEGEEhOKOlCHmORWKFKDdS4KlFoobcLGuEjougB.';

// Helper to generate dates
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const monthsAgo = (months: number) => new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString();

// ============================================
// USERS (26 total: 12 students, 5 advisers, 3 coordinators, 2 admins + 4 legacy demo users)
// ============================================
export const dummyUsers = [
  // Legacy Demo Users (for backward compatibility - simple email addresses)
  { _id: 'u1', email: 'student@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'student', profile: { firstName: 'Demo', lastName: 'Student', avatar: '' }, isActive: true, createdAt: monthsAgo(18), lastLoginAt: daysAgo(1) },
  { _id: 'u2', email: 'adviser@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'adviser', profile: { firstName: 'Demo', lastName: 'Adviser', avatar: '' }, isActive: true, createdAgo: monthsAgo(36), lastLoginAt: daysAgo(1) },
  { _id: 'u3', email: 'coordinator@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'coordinator', profile: { firstName: 'Demo', lastName: 'Coordinator', avatar: '' }, isActive: true, createdAt: monthsAgo(48), lastLoginAt: daysAgo(1) },
  { _id: 'u4', email: 'admin@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'admin', profile: { firstName: 'Demo', lastName: 'Admin', avatar: '' }, isActive: true, createdAt: monthsAgo(50), lastLoginAt: daysAgo(1) },

  // Students (12)
  { _id: 'u5', email: 'maria.santos@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'student', profile: { firstName: 'Maria', lastName: 'Santos', avatar: '' }, isActive: true, createdAt: monthsAgo(18), lastLoginAt: daysAgo(1) },
  { _id: 'u6', email: 'carlos.reyes@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'student', profile: { firstName: 'Carlos', lastName: 'Reyes', avatar: '' }, isActive: true, createdAt: monthsAgo(20), lastLoginAt: daysAgo(2) },
  { _id: 'u7', email: 'isabel.cruz@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'student', profile: { firstName: 'Isabel', lastName: 'Cruz', avatar: '' }, isActive: true, createdAt: monthsAgo(24), lastLoginAt: daysAgo(3) },
  { _id: 'u8', email: 'miguel.delacruz@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'student', profile: { firstName: 'Miguel', lastName: 'Dela Cruz', avatar: '' }, isActive: true, createdAt: monthsAgo(12), lastLoginAt: daysAgo(5) },
  { _id: 'u9', email: 'ana.bautista@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'student', profile: { firstName: 'Ana', lastName: 'Bautista', avatar: '' }, isActive: true, createdAt: monthsAgo(15), lastLoginAt: daysAgo(1) },
  { _id: 'u10', email: 'roberto.torres@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'student', profile: { firstName: 'Roberto', lastName: 'Torres', avatar: '' }, isActive: true, createdAt: monthsAgo(30), lastLoginAt: daysAgo(7) },
  { _id: 'u11', email: 'jennifer.aquino@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'student', profile: { firstName: 'Jennifer', lastName: 'Aquino', avatar: '' }, isActive: true, createdAt: monthsAgo(6), lastLoginAt: daysAgo(2) },
  { _id: 'u12', email: 'juan.garcia@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'student', profile: { firstName: 'Juan', lastName: 'Garcia', avatar: '' }, isActive: true, createdAt: monthsAgo(10), lastLoginAt: daysAgo(4) },
  { _id: 'u13', email: 'sofia.mendoza@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'student', profile: { firstName: 'Sofia', lastName: 'Mendoza', avatar: '' }, isActive: true, createdAt: monthsAgo(8), lastLoginAt: daysAgo(1) },
  { _id: 'u14', email: 'daniel.lim@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'student', profile: { firstName: 'Daniel', lastName: 'Lim', avatar: '' }, isActive: true, createdAt: monthsAgo(14), lastLoginAt: daysAgo(6) },
  { _id: 'u15', email: 'patricia.tan@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'student', profile: { firstName: 'Patricia', lastName: 'Tan', avatar: '' }, isActive: true, createdAt: monthsAgo(22), lastLoginAt: daysAgo(3) },
  { _id: 'u16', email: 'mark.santos@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'student', profile: { firstName: 'Mark', lastName: 'Santos', avatar: '' }, isActive: true, createdAt: monthsAgo(16), lastLoginAt: daysAgo(2) },

  // Advisers (5)
  { _id: 'u17', email: 'ramon.santos@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'adviser', profile: { firstName: 'Ramon', lastName: 'Santos', avatar: '' }, isActive: true, createdAt: monthsAgo(36), lastLoginAt: daysAgo(1) },
  { _id: 'u18', email: 'sofia.reyes@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'adviser', profile: { firstName: 'Sofia', lastName: 'Reyes', avatar: '' }, isActive: true, createdAt: monthsAgo(40), lastLoginAt: daysAgo(2) },
  { _id: 'u19', email: 'maria.gonzales@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'adviser', profile: { firstName: 'Maria', lastName: 'Gonzales', avatar: '' }, isActive: true, createdAt: monthsAgo(38), lastLoginAt: daysAgo(1) },
  { _id: 'u20', email: 'antonio.wilson@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'adviser', profile: { firstName: 'Antonio', lastName: 'Wilson', avatar: '' }, isActive: true, createdAt: monthsAgo(42), lastLoginAt: daysAgo(3) },
  { _id: 'u21', email: 'elena.smith@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'adviser', profile: { firstName: 'Elena', lastName: 'Smith', avatar: '' }, isActive: true, createdAt: monthsAgo(35), lastLoginAt: daysAgo(1) },

  // Coordinators (3)
  { _id: 'u22', email: 'pedro.reyes@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'coordinator', profile: { firstName: 'Pedro', lastName: 'Reyes', avatar: '' }, isActive: true, createdAt: monthsAgo(48), lastLoginAt: daysAgo(1) },
  { _id: 'u23', email: 'lisa.johnson@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'coordinator', profile: { firstName: 'Lisa', lastName: 'Johnson', avatar: '' }, isActive: true, createdAt: monthsAgo(44), lastLoginAt: daysAgo(2) },
  { _id: 'u24', email: 'david.brown@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'coordinator', profile: { firstName: 'David', lastName: 'Brown', avatar: '' }, isActive: true, createdAt: monthsAgo(46), lastLoginAt: daysAgo(3) },

  // Admins (2)
  { _id: 'u25', email: 'ana.garcia@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'admin', profile: { firstName: 'Ana', lastName: 'Garcia', avatar: '' }, isActive: true, createdAt: monthsAgo(50), lastLoginAt: daysAgo(1) },
  { _id: 'u26', email: 'system.admin@sesam.uplb.edu.ph', passwordHash: DEMO_PASSWORD_HASH, role: 'admin', profile: { firstName: 'System', lastName: 'Admin', avatar: '' }, isActive: true, createdAt: monthsAgo(52), lastLoginAt: daysAgo(2) },
];

// ============================================
// STUDENTS (12 - linked to student users)
// ============================================
export const dummyStudents = [
  { _id: 's1', userId: 'u5', studentNumber: '2023-00001', program: 'MSES', enrollmentStatus: 'active', thesisTitle: 'Climate Resilience in Philippine Coastal Communities', adviserId: 'a1', startDate: '2023-06-01', expectedCompletionDate: '2025-06-01' },
  { _id: 's2', userId: 'u6', studentNumber: '2023-00002', program: 'PhD-ES', enrollmentStatus: 'active', thesisTitle: 'Biodiversity Conservation in Urban Ecosystems', adviserId: 'a1', startDate: '2023-08-15', expectedCompletionDate: '2027-08-15' },
  { _id: 's3', userId: 'u7', studentNumber: '2022-00003', program: 'PhD-EDN', enrollmentStatus: 'active', thesisTitle: 'Environmental Diplomacy in ASEAN Climate Agreements', adviserId: 'a2', startDate: '2022-09-01', expectedCompletionDate: '2026-09-01' },
  { _id: 's4', userId: 'u8', studentNumber: '2024-00004', program: 'PM-TMEM', enrollmentStatus: 'active', thesisTitle: 'Integrated Coastal Management in Batangas Province', adviserId: 'a2', startDate: '2024-01-15', expectedCompletionDate: '2025-07-15' },
  { _id: 's5', userId: 'u9', studentNumber: '2023-00005', program: 'PhD-ES', enrollmentStatus: 'active', thesisTitle: 'Soil Carbon Sequestration in Agricultural Lands', adviserId: 'a3', startDate: '2023-11-01', expectedCompletionDate: '2027-11-01' },
  { _id: 's6', userId: 'u10', studentNumber: '2021-00006', program: 'MSES', enrollmentStatus: 'active', thesisTitle: 'Water Quality Assessment in Laguna Lake', adviserId: 'a3', startDate: '2021-06-01', expectedCompletionDate: '2024-06-01' },
  { _id: 's7', userId: 'u11', studentNumber: '2024-00007', program: 'MSES', enrollmentStatus: 'active', thesisTitle: 'Waste Management Practices in Academic Institutions', adviserId: null, startDate: '2024-03-01', expectedCompletionDate: '2026-03-01' },
  { _id: 's8', userId: 'u12', studentNumber: '2024-00008', program: 'PhD-ES', enrollmentStatus: 'active', thesisTitle: 'Forest Restoration Using Native Species', adviserId: 'a4', startDate: '2024-02-01', expectedCompletionDate: '2028-02-01' },
  { _id: 's9', userId: 'u13', studentNumber: '2024-00009', program: 'PM-TMEM', enrollmentStatus: 'active', thesisTitle: 'Disaster Risk Reduction in Coastal Municipalities', adviserId: 'a4', startDate: '2024-04-01', expectedCompletionDate: '2025-10-01' },
  { _id: 's10', userId: 'u14', studentNumber: '2023-00010', program: 'MSES', enrollmentStatus: 'active', thesisTitle: 'Renewable Energy Adoption in Rural Communities', adviserId: 'a5', startDate: '2023-09-01', expectedCompletionDate: '2025-09-01' },
  { _id: 's11', userId: 'u15', studentNumber: '2022-00011', program: 'PhD-EDN', enrollmentStatus: 'active', thesisTitle: 'Transboundary Water Governance in Southeast Asia', adviserId: 'a5', startDate: '2022-08-01', expectedCompletionDate: '2026-08-01' },
  { _id: 's12', userId: 'u16', studentNumber: '2023-00012', program: 'MSES', enrollmentStatus: 'active', thesisTitle: 'Marine Protected Area Effectiveness Assessment', adviserId: 'a1', startDate: '2023-12-01', expectedCompletionDate: '2025-12-01' },
  // Legacy demo student (u1)
  { _id: 's13', userId: 'u1', studentNumber: '2023-00013', program: 'MSES', enrollmentStatus: 'active', thesisTitle: 'Climate Change Adaptation Strategies', adviserId: 'a6', startDate: '2023-06-01', expectedCompletionDate: '2025-06-01' },
];

// ============================================
// ADVISERS (6 - 5 regular + 1 legacy demo)
// ============================================
export const dummyAdvisers = [
  { _id: 'a1', userId: 'u17', specialization: ['Climate Science', 'Coastal Management'], maxStudents: 8, currentStudents: 3, department: 'SESAM' },
  { _id: 'a2', userId: 'u18', specialization: ['Environmental Policy', 'Diplomacy'], maxStudents: 6, currentStudents: 2, department: 'SESAM' },
  { _id: 'a3', userId: 'u19', specialization: ['Soil Science', 'Agriculture'], maxStudents: 8, currentStudents: 2, department: 'SESAM' },
  { _id: 'a4', userId: 'u20', specialization: ['Forest Ecology', 'Restoration'], maxStudents: 6, currentStudents: 2, department: 'SESAM' },
  { _id: 'a5', userId: 'u21', specialization: ['Energy Policy', 'Rural Development'], maxStudents: 6, currentStudents: 2, department: 'SESAM' },
  // Legacy demo adviser (u2)
  { _id: 'a6', userId: 'u2', specialization: ['General Environmental Science'], maxStudents: 5, currentStudents: 1, department: 'SESAM' },
];

// ============================================
// WORKFLOWS (12 - one for each student)
// ============================================
const createStages = (currentStageIndex: number, statuses: string[]) => [
  { name: 'Topic Selection', order: 1, status: statuses[0] || 'approved', dueDate: '2023-09-01', completedAt: statuses[0] === 'approved' ? '2023-08-28' : null, documents: [], feedback: statuses[0] === 'approved' ? 'Topic is well-defined and relevant.' : '' },
  { name: 'Proposal Development', order: 2, status: statuses[1] || 'pending', dueDate: '2024-01-15', completedAt: statuses[1] === 'approved' ? '2024-01-10' : null, documents: [], feedback: '' },
  { name: 'Ethics Approval', order: 3, status: statuses[2] || 'pending', dueDate: '2024-03-01', completedAt: statuses[2] === 'approved' ? '2024-02-25' : null, documents: [], feedback: '' },
  { name: 'Data Collection', order: 4, status: statuses[3] || 'pending', dueDate: '2024-08-01', completedAt: statuses[3] === 'approved' ? '2024-07-20' : null, documents: [], feedback: '' },
  { name: 'Manuscript Writing', order: 5, status: statuses[4] || 'pending', dueDate: '2025-01-01', completedAt: statuses[4] === 'approved' ? '2024-12-15' : null, documents: [], feedback: '' },
  { name: 'Final Defense', order: 6, status: statuses[5] || 'pending', dueDate: '2025-05-01', completedAt: statuses[5] === 'approved' ? '2025-04-20' : null, documents: [], feedback: '' },
];

export const dummyWorkflows = [
  // s1: Maria - In Proposal Development (stages 1 approved, 2 in_progress)
  { _id: 'w1', studentId: 's1', adviserId: 'a1', title: 'Climate Resilience in Philippine Coastal Communities', status: 'active', currentStage: 'Proposal Development', stages: createStages(2, ['approved', 'in_progress', 'pending', 'pending', 'pending', 'pending']), createdAt: '2023-06-15T00:00:00.000Z', updatedAt: daysAgo(5) },
  // s2: Carlos - Topic Selection submitted
  { _id: 'w2', studentId: 's2', adviserId: 'a1', title: 'Biodiversity Conservation in Urban Ecosystems', status: 'active', currentStage: 'Topic Selection', stages: createStages(1, ['submitted', 'pending', 'pending', 'pending', 'pending', 'pending']), createdAt: '2023-09-01T00:00:00.000Z', updatedAt: daysAgo(10) },
  // s3: Isabel - Proposal Development (2 stages approved)
  { _id: 'w3', studentId: 's3', adviserId: 'a2', title: 'Environmental Diplomacy in ASEAN Climate Agreements', status: 'active', currentStage: 'Ethics Approval', stages: createStages(3, ['approved', 'approved', 'in_progress', 'pending', 'pending', 'pending']), createdAt: '2022-09-15T00:00:00.000Z', updatedAt: daysAgo(3) },
  // s4: Miguel - Just started
  { _id: 'w4', studentId: 's4', adviserId: 'a2', title: 'Integrated Coastal Management in Batangas Province', status: 'active', currentStage: 'Topic Selection', stages: createStages(1, ['in_progress', 'pending', 'pending', 'pending', 'pending', 'pending']), createdAt: '2024-01-20T00:00:00.000Z', updatedAt: daysAgo(2) },
  // s5: Ana - Proposal stage
  { _id: 'w5', studentId: 's5', adviserId: 'a3', title: 'Soil Carbon Sequestration in Agricultural Lands', status: 'active', currentStage: 'Proposal Development', stages: createStages(2, ['approved', 'submitted', 'pending', 'pending', 'pending', 'pending']), createdAt: '2023-11-15T00:00:00.000Z', updatedAt: daysAgo(7) },
  // s6: Roberto - Almost done, Final Defense scheduled
  { _id: 'w6', studentId: 's6', adviserId: 'a3', title: 'Water Quality Assessment in Laguna Lake', status: 'active', currentStage: 'Final Defense', stages: createStages(6, ['approved', 'approved', 'approved', 'approved', 'approved', 'scheduled']), createdAt: '2021-06-15T00:00:00.000Z', updatedAt: daysAgo(1) },
  // s7: Jennifer - No adviser assigned yet
  { _id: 'w7', studentId: 's7', adviserId: '', title: 'Waste Management Practices in Academic Institutions', status: 'active', currentStage: 'Topic Selection', stages: createStages(1, ['in_progress', 'pending', 'pending', 'pending', 'pending', 'pending']), createdAt: '2024-03-10T00:00:00.000Z', updatedAt: daysAgo(4) },
  // s8: Juan - Early stage
  { _id: 'w8', studentId: 's8', adviserId: 'a4', title: 'Forest Restoration Using Native Species', status: 'active', currentStage: 'Proposal Development', stages: createStages(1, ['approved', 'in_progress', 'pending', 'pending', 'pending', 'pending']), createdAt: '2024-02-15T00:00:00.000Z', updatedAt: daysAgo(6) },
  // s9: Sofia - Proposal approved, ethics pending
  { _id: 'w9', studentId: 's9', adviserId: 'a4', title: 'Disaster Risk Reduction in Coastal Municipalities', status: 'active', currentStage: 'Ethics Approval', stages: createStages(3, ['approved', 'approved', 'submitted', 'pending', 'pending', 'pending']), createdAt: '2024-04-15T00:00:00.000Z', updatedAt: daysAgo(8) },
  // s10: Daniel - Data collection phase
  { _id: 'w10', studentId: 's10', adviserId: 'a5', title: 'Renewable Energy Adoption in Rural Communities', status: 'active', currentStage: 'Data Collection', stages: createStages(4, ['approved', 'approved', 'approved', 'in_progress', 'pending', 'pending']), createdAt: '2023-09-15T00:00:00.000Z', updatedAt: daysAgo(3) },
  // s11: Patricia - Manuscript writing
  { _id: 'w11', studentId: 's11', adviserId: 'a5', title: 'Transboundary Water Governance in Southeast Asia', status: 'active', currentStage: 'Manuscript Writing', stages: createStages(5, ['approved', 'approved', 'approved', 'approved', 'in_progress', 'pending']), createdAt: '2022-08-15T00:00:00.000Z', updatedAt: daysAgo(2) },
  // s12: Mark - Proposal development
  { _id: 'w12', studentId: 's12', adviserId: 'a1', title: 'Marine Protected Area Effectiveness Assessment', status: 'active', currentStage: 'Proposal Development', stages: createStages(2, ['approved', 'in_progress', 'pending', 'pending', 'pending', 'pending']), createdAt: '2023-12-15T00:00:00.000Z', updatedAt: daysAgo(5) },
  // s13: Demo Student - Topic approved, in proposal
  { _id: 'w13', studentId: 's13', adviserId: 'a6', title: 'Climate Change Adaptation Strategies', status: 'active', currentStage: 'Proposal Development', stages: createStages(2, ['approved', 'in_progress', 'pending', 'pending', 'pending', 'pending']), createdAt: '2023-06-15T00:00:00.000Z', updatedAt: daysAgo(3) },
];

// ============================================
// DOCUMENTS (15 - mixed types)
// ============================================
export const dummyDocuments = [
  { _id: 'd1', title: 'Research Proposal v1', type: 'proposal', ownerId: 'u1', workflowId: 'w1', versions: [{ versionNumber: 1, fileUrl: 'https://example.com/docs/proposal-v1.pdf', uploadedBy: 'u1', uploadedAt: daysAgo(30), changeLog: 'Initial proposal draft' }], isPublic: false, tags: ['proposal', 'climate'], createdAt: daysAgo(30), updatedAt: daysAgo(30) },
  { _id: 'd2', title: 'Topic Approval Form', type: 'checklist', ownerId: 'u2', workflowId: 'w2', versions: [{ versionNumber: 1, fileUrl: 'https://example.com/docs/topic-form.pdf', uploadedBy: 'u2', uploadedAt: daysAgo(15), changeLog: 'Submitted for approval' }], isPublic: false, tags: ['topic', 'approval'], createdAt: daysAgo(15), updatedAt: daysAgo(15) },
  { _id: 'd3', title: 'Literature Review Chapter', type: 'chapter', ownerId: 'u3', workflowId: 'w3', versions: [{ versionNumber: 1, fileUrl: 'https://example.com/docs/lit-review.pdf', uploadedBy: 'u3', uploadedAt: daysAgo(20), changeLog: 'Chapter 2 draft' }], isPublic: false, tags: ['literature', 'chapter'], createdAt: daysAgo(20), updatedAt: daysAgo(20) },
  { _id: 'd4', title: 'Ethics Application', type: 'form', ownerId: 'u3', workflowId: 'w3', versions: [{ versionNumber: 1, fileUrl: 'https://example.com/docs/ethics.pdf', uploadedBy: 'u3', uploadedAt: daysAgo(5), changeLog: 'IRB submission' }], isPublic: false, tags: ['ethics', 'IRB'], createdAt: daysAgo(5), updatedAt: daysAgo(5) },
  { _id: 'd5', title: 'Research Proposal v2', type: 'proposal', ownerId: 'u5', workflowId: 'w5', versions: [{ versionNumber: 2, fileUrl: 'https://example.com/docs/proposal-v2.pdf', uploadedBy: 'u5', uploadedAt: daysAgo(7), changeLog: 'Revised after feedback' }], isPublic: false, tags: ['proposal', 'revised'], createdAt: daysAgo(14), updatedAt: daysAgo(7) },
  { _id: 'd6', title: 'Methodology Chapter', type: 'chapter', ownerId: 'u6', workflowId: 'w6', versions: [{ versionNumber: 1, fileUrl: 'https://example.com/docs/methodology.pdf', uploadedBy: 'u6', uploadedAt: daysAgo(60), changeLog: 'Chapter 3 complete' }], isPublic: false, tags: ['methodology', 'chapter'], createdAt: daysAgo(60), updatedAt: daysAgo(60) },
  { _id: 'd7', title: 'Final Manuscript', type: 'manuscript', ownerId: 'u6', workflowId: 'w6', versions: [{ versionNumber: 1, fileUrl: 'https://example.com/docs/manuscript.pdf', uploadedBy: 'u6', uploadedAt: daysAgo(10), changeLog: 'Pre-defense draft' }], isPublic: false, tags: ['manuscript', 'final'], createdAt: daysAgo(10), updatedAt: daysAgo(10) },
  { _id: 'd8', title: 'Topic Selection Document', type: 'proposal', ownerId: 'u7', workflowId: 'w7', versions: [{ versionNumber: 1, fileUrl: 'https://example.com/docs/topic-v1.pdf', uploadedBy: 'u7', uploadedAt: daysAgo(8), changeLog: 'Initial topic submission' }], isPublic: false, tags: ['topic', 'draft'], createdAt: daysAgo(8), updatedAt: daysAgo(8) },
  { _id: 'd9', title: 'Survey Instrument', type: 'instrument', ownerId: 'u8', workflowId: 'w8', versions: [{ versionNumber: 1, fileUrl: 'https://example.com/docs/survey.pdf', uploadedBy: 'u8', uploadedAt: daysAgo(25), changeLog: 'Questionnaire design' }], isPublic: false, tags: ['survey', 'instrument'], createdAt: daysAgo(25), updatedAt: daysAgo(25) },
  { _id: 'd10', title: 'Progress Report Q1', type: 'report', ownerId: 'u9', workflowId: 'w9', versions: [{ versionNumber: 1, fileUrl: 'https://example.com/docs/progress-q1.pdf', uploadedBy: 'u9', uploadedAt: daysAgo(12), changeLog: 'Quarterly progress' }], isPublic: false, tags: ['progress', 'report'], createdAt: daysAgo(12), updatedAt: daysAgo(12) },
  { _id: 'd11', title: 'Data Analysis Plan', type: 'document', ownerId: 'u10', workflowId: 'w10', versions: [{ versionNumber: 1, fileUrl: 'https://example.com/docs/analysis-plan.pdf', uploadedBy: 'u10', uploadedAt: daysAgo(18), changeLog: 'Statistical methods' }], isPublic: false, tags: ['analysis', 'data'], createdAt: daysAgo(18), updatedAt: daysAgo(18) },
  { _id: 'd12', title: 'Field Notes Compilation', type: 'notes', ownerId: 'u10', workflowId: 'w10', versions: [{ versionNumber: 1, fileUrl: 'https://example.com/docs/field-notes.pdf', uploadedBy: 'u10', uploadedAt: daysAgo(5), changeLog: 'Data collection notes' }], isPublic: false, tags: ['field', 'notes'], createdAt: daysAgo(5), updatedAt: daysAgo(5) },
  { _id: 'd13', title: 'Chapter 4 Draft', type: 'chapter', ownerId: 'u11', workflowId: 'w11', versions: [{ versionNumber: 1, fileUrl: 'https://example.com/docs/ch4-draft.pdf', uploadedBy: 'u11', uploadedAt: daysAgo(4), changeLog: 'Results chapter' }], isPublic: false, tags: ['chapter', 'results'], createdAt: daysAgo(4), updatedAt: daysAgo(4) },
  { _id: 'd14', title: 'Defense Presentation', type: 'presentation', ownerId: 'u6', workflowId: 'w6', versions: [{ versionNumber: 1, fileUrl: 'https://example.com/docs/defense.pptx', uploadedBy: 'u6', uploadedAt: daysAgo(3), changeLog: 'Final defense slides' }], isPublic: false, tags: ['defense', 'presentation'], createdAt: daysAgo(3), updatedAt: daysAgo(3) },
  { _id: 'd15', title: 'Research Timeline', type: 'document', ownerId: 'u12', workflowId: 'w12', versions: [{ versionNumber: 1, fileUrl: 'https://example.com/docs/timeline.pdf', uploadedBy: 'u12', uploadedAt: daysAgo(6), changeLog: 'Gantt chart' }], isPublic: false, tags: ['timeline', 'planning'], createdAt: daysAgo(6), updatedAt: daysAgo(6) },
];

// ============================================
// AI QUERIES (24 - distributed across students)
// ============================================
export const dummyAIQueries = [
  // Maria (u1) - 4 queries
  { _id: 'q1', userId: 'u1', sessionId: 'sess-1', query: 'How do I structure a literature review for climate resilience research?', response: 'A literature review should be structured thematically...', sources: [{ title: 'SESAM Thesis Format Guide', type: 'guideline', url: '' }], intent: 'methodology', isFlagged: false, createdAt: daysAgo(2) },
  { _id: 'q2', userId: 'u1', sessionId: 'sess-1', query: 'What statistical methods are appropriate for coastal survey data?', response: 'For coastal survey data, use regression analysis...', sources: [{ title: 'Research Methodology Framework', type: 'guideline', url: '' }], intent: 'research_design', isFlagged: false, createdAt: daysAgo(2) },
  { _id: 'q3', userId: 'u1', sessionId: 'sess-2', query: 'How do I cite government reports in APA format?', response: 'Government reports follow this format...', sources: [{ title: 'Citation Guide', type: 'guideline', url: '' }], intent: 'formatting', isFlagged: false, createdAt: daysAgo(5) },
  { _id: 'q4', userId: 'u1', sessionId: 'sess-3', query: 'What is the difference between resilience and adaptation?', response: 'Resilience refers to the capacity to recover...', sources: [{ title: 'Climate Concepts Guide', type: 'guideline', url: '' }], intent: 'conceptual', isFlagged: false, createdAt: daysAgo(8) },
  
  // Carlos (u2) - 3 queries
  { _id: 'q5', userId: 'u2', sessionId: 'sess-4', query: 'How do I select sampling sites for biodiversity study?', response: 'Sampling site selection should consider...', sources: [{ title: 'Sampling Methods', type: 'guideline', url: '' }], intent: 'methodology', isFlagged: false, createdAt: daysAgo(3) },
  { _id: 'q6', userId: 'u2', sessionId: 'sess-5', query: 'What metrics should I use for urban ecosystem health?', response: 'Common metrics include species richness...', sources: [{ title: 'Biodiversity Assessment', type: 'guideline', url: '' }], intent: 'research_design', isFlagged: false, createdAt: daysAgo(6) },
  { _id: 'q7', userId: 'u2', sessionId: 'sess-6', query: 'How do I apply for ethics clearance?', response: 'The IRB application process involves...', sources: [{ title: 'Ethics Checklist', type: 'checklist', url: '' }], intent: 'administrative', isFlagged: false, createdAt: daysAgo(10) },
  
  // Isabel (u3) - 3 queries
  { _id: 'q8', userId: 'u3', sessionId: 'sess-7', query: 'What theoretical frameworks are used in environmental diplomacy?', response: 'Common frameworks include regime theory...', sources: [{ title: 'Political Science Frameworks', type: 'guideline', url: '' }], intent: 'theoretical', isFlagged: false, createdAt: daysAgo(1) },
  { _id: 'q9', userId: 'u3', sessionId: 'sess-8', query: 'How do I analyze treaty texts qualitatively?', response: 'Qualitative text analysis involves...', sources: [{ title: 'Qualitative Methods', type: 'guideline', url: '' }], intent: 'methodology', isFlagged: false, createdAt: daysAgo(4) },
  { _id: 'q10', userId: 'u3', sessionId: 'sess-9', query: 'What are common pitfalls in policy analysis?', response: 'Common pitfalls include confirmation bias...', sources: [{ title: 'Policy Analysis Guide', type: 'guideline', url: '' }], intent: 'methodology', isFlagged: false, createdAt: daysAgo(9) },
  
  // Miguel (u4) - 2 queries
  { _id: 'q11', userId: 'u4', sessionId: 'sess-10', query: 'How do I write a concept note for my topic?', response: 'A concept note should include problem statement...', sources: [{ title: 'Proposal Writing Guide', type: 'guideline', url: '' }], intent: 'writing', isFlagged: false, createdAt: daysAgo(2) },
  { _id: 'q12', userId: 'u4', sessionId: 'sess-11', query: 'What is integrated coastal management?', response: 'ICM is a holistic approach to managing coastal areas...', sources: [{ title: 'ICM Framework', type: 'guideline', url: '' }], intent: 'conceptual', isFlagged: false, createdAt: daysAgo(5) },
  
  // Ana (u5) - 2 queries
  { _id: 'q13', userId: 'u5', sessionId: 'sess-12', query: 'How do I measure soil carbon content?', response: 'Soil carbon can be measured through laboratory analysis...', sources: [{ title: 'Soil Analysis Methods', type: 'guideline', url: '' }], intent: 'methodology', isFlagged: false, createdAt: daysAgo(3) },
  { _id: 'q14', userId: 'u5', sessionId: 'sess-13', query: 'What sampling design is best for agricultural fields?', response: 'Systematic sampling works well for agricultural studies...', sources: [{ title: 'Sampling Guide', type: 'guideline', url: '' }], intent: 'methodology', isFlagged: false, createdAt: daysAgo(7) },
  
  // Roberto (u6) - 1 query (near completion, less AI use)
  { _id: 'q15', userId: 'u6', sessionId: 'sess-14', query: 'How do I prepare for thesis defense?', response: 'Defense preparation includes...', sources: [{ title: 'Defense Preparation', type: 'guideline', url: '' }], intent: 'administrative', isFlagged: false, createdAt: daysAgo(15) },
  
  // Jennifer (u7) - 3 queries (new student, needs more help)
  { _id: 'q16', userId: 'u7', sessionId: 'sess-15', query: 'How do I choose a research topic?', response: 'Topic selection should align with your interests...', sources: [{ title: 'Topic Selection Guide', type: 'guideline', url: '' }], intent: 'advisory', isFlagged: false, createdAt: daysAgo(2) },
  { _id: 'q17', userId: 'u7', sessionId: 'sess-16', query: 'What is the thesis workflow at SESAM?', response: 'The thesis workflow includes 6 stages...', sources: [{ title: 'SESAM Thesis Format Guide', type: 'guideline', url: '' }], intent: 'administrative', isFlagged: false, createdAt: daysAgo(4) },
  { _id: 'q18', userId: 'u7', sessionId: 'sess-17', query: 'How do I find an adviser?', response: 'You can view faculty profiles and reach out...', sources: [{ title: 'Adviser Selection', type: 'guideline', url: '' }], intent: 'administrative', isFlagged: false, createdAt: daysAgo(6) },
  
  // Juan (u8) - 1 query
  { _id: 'q19', userId: 'u8', sessionId: 'sess-18', query: 'What native species are good for restoration?', response: 'Native species selection depends on the ecosystem...', sources: [{ title: 'Native Species Guide', type: 'guideline', url: '' }], intent: 'research_design', isFlagged: false, createdAt: daysAgo(5) },
  
  // Sofia (u9) - 2 queries
  { _id: 'q20', userId: 'u9', sessionId: 'sess-19', query: 'How do I assess disaster risk?', response: 'Disaster risk assessment involves hazard identification...', sources: [{ title: 'DRR Framework', type: 'guideline', url: '' }], intent: 'methodology', isFlagged: false, createdAt: daysAgo(3) },
  { _id: 'q21', userId: 'u9', sessionId: 'sess-20', query: 'What stakeholder analysis methods should I use?', response: 'Stakeholder analysis can use power-interest grids...', sources: [{ title: 'Stakeholder Analysis', type: 'guideline', url: '' }], intent: 'methodology', isFlagged: false, createdAt: daysAgo(8) },
  
  // Daniel (u10) - 2 queries
  { _id: 'q22', userId: 'u10', sessionId: 'sess-21', query: 'How do I design a survey for energy adoption?', response: 'Survey design should follow these principles...', sources: [{ title: 'Survey Design Guide', type: 'guideline', url: '' }], intent: 'methodology', isFlagged: false, createdAt: daysAgo(4) },
  { _id: 'q23', userId: 'u10', sessionId: 'sess-22', query: 'What is technology adoption model?', response: 'The Technology Acceptance Model (TAM) proposes...', sources: [{ title: 'TAM Framework', type: 'guideline', url: '' }], intent: 'theoretical', isFlagged: false, createdAt: daysAgo(9) },
  
  // Patricia (u11) - 1 query
  { _id: 'q24', userId: 'u11', sessionId: 'sess-23', query: 'How do I present mixed methods findings?', response: 'Mixed methods presentation should integrate...', sources: [{ title: 'Mixed Methods Guide', type: 'guideline', url: '' }], intent: 'writing', isFlagged: false, createdAt: daysAgo(6) },
];

// ============================================
// GUIDANCE RESOURCES (8)
// ============================================
export const dummyGuidanceResources = [
  { _id: 'g1', title: 'SESAM Thesis Format Guide', category: 'guideline' as const, content: 'This guide outlines the standard format for SESAM theses...', fileUrl: '', tags: ['thesis', 'format'], program: 'MSES', isActive: true, createdAt: '2023-01-01', updatedAt: '2023-06-01' },
  { _id: 'g2', title: 'Research Proposal Template', category: 'template' as const, content: '1. Title Page\n2. Abstract\n3. Introduction...', fileUrl: '', tags: ['proposal', 'template'], program: '', isActive: true, createdAt: '2023-01-01', updatedAt: '2023-06-01' },
  { _id: 'g3', title: 'Ethics Compliance Checklist', category: 'checklist' as const, content: '- [ ] Informed consent obtained...', fileUrl: '', tags: ['ethics', 'checklist'], program: '', isActive: true, createdAt: '2023-01-01', updatedAt: '2023-06-01' },
  { _id: 'g4', title: 'JESAM Publication Standards', category: 'policy' as const, content: 'All manuscripts must adhere to JESAM formatting standards...', fileUrl: '', tags: ['publication', 'jesam'], program: '', isActive: true, createdAt: '2023-01-01', updatedAt: '2023-06-01' },
  { _id: 'g5', title: 'Literature Review Checklist', category: 'checklist' as const, content: '- [ ] Key themes identified...', fileUrl: '', tags: ['literature', 'checklist'], program: '', isActive: true, createdAt: '2023-01-01', updatedAt: '2023-06-01' },
  { _id: 'g6', title: 'Data Collection Methods', category: 'guideline' as const, content: 'Various methods for collecting environmental data...', fileUrl: '', tags: ['data', 'methods'], program: '', isActive: true, createdAt: '2023-03-01', updatedAt: '2023-08-01' },
  { _id: 'g7', title: 'Statistical Analysis Guide', category: 'guideline' as const, content: 'Common statistical tests for environmental research...', fileUrl: '', tags: ['statistics', 'analysis'], program: '', isActive: true, createdAt: '2023-04-01', updatedAt: '2023-09-01' },
  { _id: 'g8', title: 'Defense Preparation Checklist', category: 'checklist' as const, content: '- [ ] Presentation ready\n- [ ] Committee notified...', fileUrl: '', tags: ['defense', 'checklist'], program: '', isActive: true, createdAt: '2023-05-01', updatedAt: '2023-10-01' },
];

// ============================================
// NOTIFICATIONS (12)
// ============================================
export const dummyNotifications = [
  { _id: 'n1', userId: 'u1', type: 'milestone' as const, title: 'Proposal Due Soon', message: 'Your proposal development stage is due on January 15, 2024.', relatedId: 'w1', relatedType: 'workflow', isRead: false, sentVia: ['in_app', 'email'] as ('in_app' | 'email')[], createdAt: daysAgo(2) },
  { _id: 'n2', userId: 'u1', type: 'feedback' as const, title: 'Feedback Received', message: 'Your adviser has provided feedback on your topic selection.', relatedId: 'w1', relatedType: 'workflow', isRead: false, sentVia: ['in_app'] as ('in_app' | 'email')[], createdAt: daysAgo(5) },
  { _id: 'n3', userId: 'u2', type: 'approval' as const, title: 'Document Submitted', message: 'Your topic form has been submitted for review.', relatedId: 'd2', relatedType: 'document', isRead: false, sentVia: ['in_app', 'email'] as ('in_app' | 'email')[], createdAt: daysAgo(3) },
  { _id: 'n4', userId: 'u3', type: 'deadline' as const, title: 'Ethics Application Reminder', message: 'Remember to submit your ethics application.', relatedId: 'w3', relatedType: 'workflow', isRead: true, sentVia: ['in_app'] as ('in_app' | 'email')[], createdAt: daysAgo(7) },
  { _id: 'n5', userId: 'u5', type: 'milestone' as const, title: 'Proposal Review Pending', message: 'Your proposal is awaiting adviser review.', relatedId: 'w5', relatedType: 'workflow', isRead: false, sentVia: ['in_app', 'email'] as ('in_app' | 'email')[], createdAt: daysAgo(1) },
  { _id: 'n6', userId: 'u6', type: 'deadline' as const, title: 'Defense Schedule Confirmed', message: 'Your defense is scheduled for May 15, 2026.', relatedId: 'w6', relatedType: 'workflow', isRead: false, sentVia: ['in_app', 'email'] as ('in_app' | 'email')[], createdAt: daysAgo(2) },
  { _id: 'n7', userId: 'u10', type: 'reminder' as const, title: 'Data Collection Progress', message: 'You have 20 respondents so far. Target: 120.', relatedId: 'w10', relatedType: 'workflow', isRead: true, sentVia: ['in_app'] as ('in_app' | 'email')[], createdAt: daysAgo(4) },
  { _id: 'n8', userId: 'u11', type: 'milestone' as const, title: 'Chapter Due', message: 'Your manuscript chapter is due next week.', relatedId: 'w11', relatedType: 'workflow', isRead: false, sentVia: ['in_app', 'email'] as ('in_app' | 'email')[], createdAt: daysAgo(3) },
  { _id: 'n9', userId: 'u13', type: 'approval' as const, title: 'Review Requested', message: 'Carlos Reyes submitted a document for review.', relatedId: 'd2', relatedType: 'document', isRead: false, sentVia: ['in_app', 'email'] as ('in_app' | 'email')[], createdAt: daysAgo(3) },
  { _id: 'n10', userId: 'u13', type: 'approval' as const, title: 'Review Requested', message: 'Mark Santos submitted a research timeline.', relatedId: 'd15', relatedType: 'document', isRead: false, sentVia: ['in_app', 'email'] as ('in_app' | 'email')[], createdAt: daysAgo(1) },
  { _id: 'n11', userId: 'u14', type: 'approval' as const, title: 'Review Requested', message: 'Isabel Cruz submitted ethics application.', relatedId: 'd4', relatedType: 'document', isRead: false, sentVia: ['in_app', 'email'] as ('in_app' | 'email')[], createdAt: daysAgo(2) },
  { _id: 'n12', userId: 'u18', type: 'announcement' as const, title: 'Spring 2026 Defense Schedule Released', message: 'Defense schedule is now available.', relatedId: '', relatedType: 'announcement', isRead: false, sentVia: ['in_app', 'email'] as ('in_app' | 'email')[], createdAt: daysAgo(1) },
];

// ============================================
// AUDIT LOGS (25)
// ============================================
export const dummyAuditLogs = [
  { _id: 'al1', userId: 'u1', action: 'login' as const, resource: 'auth', resourceId: '', details: {}, ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', timestamp: daysAgo(1) },
  { _id: 'al2', userId: 'u1', action: 'ai_query' as const, resource: 'queries', resourceId: 'q1', details: { query: 'How do I structure...' }, ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', timestamp: daysAgo(2) },
  { _id: 'al3', userId: 'u1', action: 'create' as const, resource: 'document', resourceId: 'd1', details: { title: 'Research Proposal v1' }, ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', timestamp: daysAgo(30) },
  { _id: 'al4', userId: 'u2', action: 'create' as const, resource: 'document', resourceId: 'd2', details: { title: 'Topic Approval Form' }, ipAddress: '192.168.1.2', userAgent: 'Mozilla/5.0', timestamp: daysAgo(15) },
  { _id: 'al5', userId: 'u3', action: 'create' as const, resource: 'document', resourceId: 'd3', details: { title: 'Literature Review' }, ipAddress: '192.168.1.3', userAgent: 'Mozilla/5.0', timestamp: daysAgo(20) },
  { _id: 'al6', userId: 'u3', action: 'create' as const, resource: 'document', resourceId: 'd4', details: { title: 'Ethics Application' }, ipAddress: '192.168.1.3', userAgent: 'Mozilla/5.0', timestamp: daysAgo(5) },
  { _id: 'al7', userId: 'u5', action: 'create' as const, resource: 'document', resourceId: 'd5', details: { title: 'Research Proposal v2' }, ipAddress: '192.168.1.5', userAgent: 'Mozilla/5.0', timestamp: daysAgo(7) },
  { _id: 'al8', userId: 'u6', action: 'update' as const, resource: 'workflow', resourceId: 'w6', details: { stage: 'Final Defense', status: 'scheduled' }, ipAddress: '192.168.1.6', userAgent: 'Mozilla/5.0', timestamp: daysAgo(1) },
  { _id: 'al9', userId: 'u13', action: 'update' as const, resource: 'workflow', resourceId: 'w1', details: { stage: 'Topic Selection', status: 'approved' }, ipAddress: '192.168.1.13', userAgent: 'Mozilla/5.0', timestamp: daysAgo(5) },
  { _id: 'al10', userId: 'u13', action: 'read' as const, resource: 'document', resourceId: 'd2', details: { action: 'reviewed' }, ipAddress: '192.168.1.13', userAgent: 'Mozilla/5.0', timestamp: daysAgo(3) },
  { _id: 'al11', userId: 'u14', action: 'update' as const, resource: 'workflow', resourceId: 'w3', details: { stage: 'Proposal Development', status: 'approved' }, ipAddress: '192.168.1.14', userAgent: 'Mozilla/5.0', timestamp: daysAgo(10) },
  { _id: 'al12', userId: 'u14', action: 'read' as const, resource: 'document', resourceId: 'd4', details: { action: 'review pending' }, ipAddress: '192.168.1.14', userAgent: 'Mozilla/5.0', timestamp: daysAgo(2) },
  { _id: 'al13', userId: 'u15', action: 'update' as const, resource: 'workflow', resourceId: 'w5', details: { stage: 'Topic Selection', status: 'approved' }, ipAddress: '192.168.1.15', userAgent: 'Mozilla/5.0', timestamp: daysAgo(8) },
  { _id: 'al14', userId: 'u18', action: 'read' as const, resource: 'users', resourceId: '', details: { action: 'viewed all users' }, ipAddress: '192.168.1.18', userAgent: 'Mozilla/5.0', timestamp: daysAgo(1) },
  { _id: 'al15', userId: 'u18', action: 'create' as const, resource: 'announcement', resourceId: '', details: { title: 'Defense Schedule Released' }, ipAddress: '192.168.1.18', userAgent: 'Mozilla/5.0', timestamp: daysAgo(1) },
  { _id: 'al16', userId: 'u21', action: 'login' as const, resource: 'auth', resourceId: '', details: {}, ipAddress: '192.168.1.21', userAgent: 'Mozilla/5.0', timestamp: daysAgo(1) },
  { _id: 'al17', userId: 'u21', action: 'read' as const, resource: 'system', resourceId: '', details: { action: 'checked system health' }, ipAddress: '192.168.1.21', userAgent: 'Mozilla/5.0', timestamp: daysAgo(2) },
  { _id: 'al18', userId: 'u4', action: 'ai_query' as const, resource: 'queries', resourceId: 'q11', details: { query: 'How do I write a concept note...' }, ipAddress: '192.168.1.4', userAgent: 'Mozilla/5.0', timestamp: daysAgo(2) },
  { _id: 'al19', userId: 'u7', action: 'ai_query' as const, resource: 'queries', resourceId: 'q16', details: { query: 'How do I choose a research topic...' }, ipAddress: '192.168.1.7', userAgent: 'Mozilla/5.0', timestamp: daysAgo(2) },
  { _id: 'al20', userId: 'u10', action: 'ai_query' as const, resource: 'queries', resourceId: 'q22', details: { query: 'How do I design a survey...' }, ipAddress: '192.168.1.10', userAgent: 'Mozilla/5.0', timestamp: daysAgo(4) },
  { _id: 'al21', userId: 'u8', action: 'create' as const, resource: 'document', resourceId: 'd9', details: { title: 'Survey Instrument' }, ipAddress: '192.168.1.8', userAgent: 'Mozilla/5.0', timestamp: daysAgo(25) },
  { _id: 'al22', userId: 'u9', action: 'create' as const, resource: 'document', resourceId: 'd10', details: { title: 'Progress Report' }, ipAddress: '192.168.1.9', userAgent: 'Mozilla/5.0', timestamp: daysAgo(12) },
  { _id: 'al23', userId: 'u10', action: 'create' as const, resource: 'document', resourceId: 'd11', details: { title: 'Data Analysis Plan' }, ipAddress: '192.168.1.10', userAgent: 'Mozilla/5.0', timestamp: daysAgo(18) },
  { _id: 'al24', userId: 'u11', action: 'create' as const, resource: 'document', resourceId: 'd13', details: { title: 'Chapter 4 Draft' }, ipAddress: '192.168.1.11', userAgent: 'Mozilla/5.0', timestamp: daysAgo(4) },
  { _id: 'al25', userId: 'u6', action: 'create' as const, resource: 'document', resourceId: 'd14', details: { title: 'Defense Presentation' }, ipAddress: '192.168.1.6', userAgent: 'Mozilla/5.0', timestamp: daysAgo(3) },
];

// ============================================
// SYSTEM SETTINGS
// ============================================
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

// ============================================
// IN-MEMORY MUTABLE STORES
// ============================================
export let users = [...dummyUsers];
export let students = [...dummyStudents];
export let advisers = [...dummyAdvisers];
export let workflows = [...dummyWorkflows];
export let documents = [...dummyDocuments];
export let aiQueries = [...dummyAIQueries];
export let guidanceResources = [...dummyGuidanceResources];
export let notifications = [...dummyNotifications];
export let auditLogs = [...dummyAuditLogs];

// ============================================
// 2. STAT COMPUTATION FUNCTIONS
// ============================================

/**
 * Get coordinator dashboard statistics
 * Matches the Figma design with consistent data
 */
export function getCoordinatorStats() {
  const totalStudents = students.length;
  const activeAdvisers = advisers.length;
  const unassignedStudents = students.filter(s => !s.adviserId).length;
  
  // Calculate completion rate from workflows
  const totalMilestones = workflows.reduce((acc, w) => acc + w.stages.length, 0);
  const completedMilestones = workflows.reduce(
    (acc, w) => acc + w.stages.filter((s: any) => s.status === 'approved').length,
    0
  );
  const completionRate = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  
  // Count overdue items (stages with past due dates not yet approved)
  const now = new Date();
  const overdueItems = workflows.reduce((acc, w) => {
    return acc + w.stages.filter((s: any) => {
      if (s.status === 'approved' || s.status === 'completed') return false;
      const dueDate = new Date(s.dueDate);
      return dueDate < now;
    }).length;
  }, 0);
  
  // Calculate adviser workload distribution
  const adviserWorkload = advisers.map(adviser => {
    const user = users.find(u => u._id === adviser.userId);
    const studentCount = students.filter(s => s.adviserId === adviser._id).length;
    return {
      adviserId: adviser._id,
      name: user ? `Dr. ${user.profile.firstName} ${user.profile.lastName}` : 'Unknown',
      students: studentCount,
      maxStudents: adviser.maxStudents,
      utilizationRate: Math.round((studentCount / adviser.maxStudents) * 100),
    };
  }).sort((a, b) => b.students - a.students);
  
  // Program breakdown
  const programBreakdown = [
    { program: 'MSES', students: students.filter(s => s.program === 'MSES').length, workflows: workflows.filter(w => {
      const student = students.find(s => s._id === w.studentId);
      return student?.program === 'MSES';
    }).length },
    { program: 'PhD-ES', students: students.filter(s => s.program === 'PhD-ES').length, workflows: workflows.filter(w => {
      const student = students.find(s => s._id === w.studentId);
      return student?.program === 'PhD-ES';
    }).length },
    { program: 'PhD-EDN', students: students.filter(s => s.program === 'PhD-EDN').length, workflows: workflows.filter(w => {
      const student = students.find(s => s._id === w.studentId);
      return student?.program === 'PhD-EDN';
    }).length },
    { program: 'PM-TMEM', students: students.filter(s => s.program === 'PM-TMEM').length, workflows: workflows.filter(w => {
      const student = students.find(s => s._id === w.studentId);
      return student?.program === 'PM-TMEM';
    }).length },
  ];
  
  return {
    totalStudents,
    activeAdvisers,
    completionRate,
    overdueItems,
    unassignedStudents,
    adviserWorkload,
    programBreakdown,
  };
}

/**
 * Get adviser dashboard statistics for a specific adviser
 */
export function getAdviserStats(adviserId: string) {
  const adviser = advisers.find(a => a._id === adviserId);
  if (!adviser) return null;
  
  // Get advisee count
  const advisees = students.filter(s => s.adviserId === adviserId);
  const totalAdvisees = advisees.length;
  
  // Get workflows for this adviser's students
  const adviseeWorkflows = workflows.filter(w => advisees.some(s => s._id === w.studentId));
  
  // Count pending reviews (submitted or in_progress stages awaiting approval)
  const pendingReviews = adviseeWorkflows.reduce((acc, w) => {
    return acc + w.stages.filter((s: any) => s.status === 'submitted' || s.status === 'in_progress').length;
  }, 0);
  
  // Count upcoming defenses (scheduled or approaching final defense)
  const upcomingDefenses = adviseeWorkflows.filter((w: any) => {
    const finalStage = w.stages.find((s: any) => s.name === 'Final Defense');
    return finalStage && (finalStage.status === 'scheduled' || finalStage.status === 'pending');
  }).length;
  
  // Calculate average time to defense (based on start date to expected completion)
  const avgTimeToDefenseYears = advisees.length > 0
    ? (advisees.reduce((acc, s) => {
        const start = new Date(s.startDate).getTime();
        const expected = new Date(s.expectedCompletionDate).getTime();
        const durationMs = expected - start;
        const durationYears = durationMs / (1000 * 60 * 60 * 24 * 365);
        return acc + durationYears;
      }, 0) / advisees.length).toFixed(1)
    : '0.0';
  
  // Get advisee details with status
  const adviseeDetails = advisees.map(student => {
    const user = users.find(u => u._id === student.userId);
    const workflow = workflows.find(w => w.studentId === student._id);
    const currentStage = workflow?.stages.find((s: any) => s.status === 'in_progress' || s.status === 'submitted');
    const nextMilestone = currentStage?.name || workflow?.currentStage || 'Unknown';
    
    // Determine status based on overdue stages
    const hasOverdue = workflow?.stages.some((s: any) => {
      if (s.status === 'approved') return false;
      const dueDate = new Date(s.dueDate);
      return dueDate < new Date();
    });
    
    return {
      _id: student._id,
      name: user ? `${user.profile.firstName} ${user.profile.lastName}` : 'Unknown',
      program: student.program,
      nextMilestone,
      status: hasOverdue ? 'needs-attention' : 'on-track',
      initials: user ? `${user.profile.firstName[0]}${user.profile.lastName[0]}` : '??',
    };
  });
  
  // Get pending review details
  const pendingReviewDetails = adviseeWorkflows.flatMap(w => {
    const student = students.find(s => s._id === w.studentId);
    const user = users.find(u => u._id === student?.userId);
    return w.stages
      .filter((s: any) => s.status === 'submitted' || s.status === 'in_progress')
      .map((s: any, idx: number) => ({
        id: `${w._id}-${s.order}`,
        title: s.name,
        studentName: user ? `${user.profile.firstName} ${user.profile.lastName}` : 'Unknown',
        submittedDate: new Date(w.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        stage: s.name,
      }));
  }).slice(0, 5); // Limit to 5 most recent
  
  return {
    totalAdvisees,
    pendingReviews,
    upcomingDefenses,
    avgTimeToDefense: `${avgTimeToDefenseYears}y`,
    advisees: adviseeDetails,
    pendingReviewDetails,
  };
}

/**
 * Get admin dashboard statistics
 */
export function getAdminStats() {
  const totalUsers = users.length;
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalAdvisers = users.filter(u => u.role === 'adviser').length;
  const totalCoordinators = users.filter(u => u.role === 'coordinator').length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  
  const totalQueries = aiQueries.length;
  const totalDocuments = documents.length;
  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter(w => w.status === 'active').length;
  const completedWorkflows = workflows.filter(w => w.status === 'completed').length;
  const onHoldWorkflows = workflows.filter(w => w.status === 'on_hold').length;
  
  const totalMilestones = workflows.reduce((acc, w) => acc + w.stages.length, 0);
  const completedMilestones = workflows.reduce(
    (acc, w) => acc + w.stages.filter((s: any) => s.status === 'approved').length,
    0
  );
  
  // System health metrics
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentLogins = auditLogs.filter(log => log.action === 'login' && new Date(log.timestamp) > thirtyDaysAgo).length;
  const recentQueries = aiQueries.filter(q => new Date(q.createdAt) > thirtyDaysAgo).length;
  
  return {
    totalUsers,
    totalStudents,
    totalAdvisers,
    totalCoordinators,
    totalAdmins,
    totalQueries,
    totalDocuments,
    totalWorkflows,
    activeWorkflows,
    completedWorkflows,
    onHoldWorkflows,
    completedMilestones,
    totalMilestones,
    milestoneCompletionRate: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0,
    recentLogins,
    recentQueries,
  };
}

/**
 * Get student dashboard statistics
 */
export function getStudentStats(studentId: string) {
  const student = students.find(s => s._id === studentId);
  if (!student) return null;
  
  const workflow = workflows.find(w => w.studentId === studentId);
  if (!workflow) return null;
  
  // Calculate progress
  const totalStages = workflow.stages.length;
  const completedStages = workflow.stages.filter((s: any) => s.status === 'approved').length;
  const progressPercent = Math.round((completedStages / totalStages) * 100);
  
  // Get current stage
  const currentStage = workflow.stages.find((s: any) => s.status === 'in_progress' || s.status === 'submitted');
  const currentStageName = currentStage?.name || workflow.currentStage;
  
  // Count pending tasks (stages not yet approved)
  const pendingTasks = workflow.stages.filter((s: any) => s.status !== 'approved').length;
  
  // Get AI consultation count for this student
  const studentQueries = aiQueries.filter(q => q.userId === student.userId);
  const aiConsultations = studentQueries.length;
  const totalMessages = studentQueries.length * 3; // Approximate messages per query
  
  // Get upcoming deadlines (stages with due dates not yet approved)
  const upcomingDeadlines = workflow.stages
    .filter((s: any) => s.status !== 'approved' && s.dueDate)
    .map((s: any) => {
      const dueDate = new Date(s.dueDate);
      const now = new Date();
      const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: s.order,
        title: s.name,
        date: dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        daysLeft: Math.max(0, daysLeft),
        priority: daysLeft <= 7 ? 'high' : daysLeft <= 30 ? 'medium' : 'low',
        status: s.status === 'in_progress' ? 'In Progress' : s.status === 'submitted' ? 'Submitted' : 'Not Started',
      };
    })
    .sort((a: any, b: any) => a.daysLeft - b.daysLeft)
    .slice(0, 5);
  
  // Get adviser info
  const adviser = student.adviserId ? advisers.find(a => a._id === student.adviserId) : null;
  const adviserUser = adviser ? users.find(u => u._id === adviser.userId) : null;
  
  return {
    progressPercent,
    completedStages,
    totalStages,
    currentStage: currentStageName,
    pendingTasks,
    aiConsultations,
    totalMessages,
    upcomingDeadlines,
    adviser: adviserUser ? {
      name: `Dr. ${adviserUser.profile.firstName} ${adviserUser.profile.lastName}`,
      initials: `${adviserUser.profile.firstName[0]}${adviserUser.profile.lastName[0]}`,
      title: 'Associate Professor',
    } : null,
    expectedCompletion: new Date(student.expectedCompletionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    monthsRemaining: Math.ceil((new Date(student.expectedCompletionDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)),
  };
}

/**
 * Get adviser workload distribution for coordinator dashboard
 * Returns array sorted by student count (descending)
 */
export function getAdviserWorkload(): {
  _id: string;
  name: string;
  students: number;
  maxStudents: number;
  utilizationPercent: number;
}[] {
  return advisers
    .map(adviser => {
      const user = users.find(u => u._id === adviser.userId);
      const studentCount = students.filter(s => s.adviserId === adviser._id).length;
      return {
        _id: adviser._id,
        name: user ? `Dr. ${user.profile.firstName} ${user.profile.lastName}` : 'Unknown',
        students: studentCount,
        maxStudents: adviser.maxStudents,
        utilizationPercent: Math.round((studentCount / adviser.maxStudents) * 100),
      };
    })
    .sort((a, b) => b.students - a.students);
}

/**
 * Get pending reviews for adviser or coordinator dashboard
 * If adviserId provided, filters to that adviser's students only
 */
export function getPendingReviews(adviserId?: string): {
  _id: string;
  title: string;
  studentName: string;
  studentProgram: string;
  submittedDate: string;
  daysPending: number;
  priority: 'normal' | 'high' | 'urgent';
}[] {
  // Get workflows with pending stages
  let targetWorkflows = workflows;
  
  if (adviserId) {
    // Filter to workflows belonging to this adviser's students
    const adviserStudents = students.filter(s => s.adviserId === adviserId).map(s => s._id);
    targetWorkflows = workflows.filter(w => adviserStudents.includes(w.studentId));
  }
  
  const now = new Date();
  const reviews: {
    _id: string;
    title: string;
    studentName: string;
    studentProgram: string;
    submittedDate: string;
    daysPending: number;
    priority: 'normal' | 'high' | 'urgent';
  }[] = [];
  
  targetWorkflows.forEach(w => {
    const student = students.find(s => s._id === w.studentId);
    if (!student) return;
    
    const user = users.find(u => u._id === student.userId);
    const studentName = user ? `${user.profile.firstName} ${user.profile.lastName}` : 'Unknown';
    
    // Find stages with submitted or in_progress status that need review
    w.stages.forEach(stage => {
      if (stage.status === 'submitted' || stage.status === 'in_progress') {
        const updatedAt = new Date(w.updatedAt);
        const daysPending = Math.max(0, Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)));
        
        // Determine priority based on days pending
        let priority: 'normal' | 'high' | 'urgent' = 'normal';
        if (daysPending > 7) priority = 'urgent';
        else if (daysPending > 3) priority = 'high';
        
        reviews.push({
          _id: `${w._id}-${stage.order}`,
          title: stage.name,
          studentName,
          studentProgram: student.program,
          submittedDate: updatedAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          daysPending,
          priority,
        });
      }
    });
  });
  
  // Sort by days pending (descending) so urgent items appear first
  return reviews.sort((a, b) => b.daysPending - a.daysPending);
}

/**
 * Get analytics overview for reports and charts
 */
export function getAnalyticsOverview() {
  const adminStats = getAdminStats();
  const coordinatorStats = getCoordinatorStats();
  
  // Monthly activity (last 6 months)
  const monthlyActivity = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - i);
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
    
    const queriesInMonth = aiQueries.filter(q => {
      const qDate = new Date(q.createdAt);
      return qDate.getMonth() === monthDate.getMonth() && qDate.getFullYear() === monthDate.getFullYear();
    }).length;
    
    const submissionsInMonth = documents.filter(d => {
      const dDate = new Date(d.createdAt);
      return dDate.getMonth() === monthDate.getMonth() && dDate.getFullYear() === monthDate.getFullYear();
    }).length;
    
    monthlyActivity.push({
      month: monthName,
      queries: queriesInMonth,
      submissions: submissionsInMonth,
    });
  }
  
  return {
    ...adminStats,
    ...coordinatorStats,
    monthlyActivity,
    avgCompletionDays: 420, // ~14 months
  };
}

// ============================================
// 3. DATA CONSISTENCY RULES
// ============================================

/**
 * Data Consistency Rules:
 * 
 * 1. USER COUNTS
 *    - Total users = students + advisers + coordinators + admins
 *    - Current: 12 students + 5 advisers + 3 coordinators + 2 admins = 22 users
 * 
 * 2. STUDENT-ADVISER RELATIONSHIPS
 *    - Each student should have 0 or 1 adviser
 *    - Adviser currentStudents should match count of assigned students
 *    - Max students per adviser: 6-8 (enforced in validation)
 * 
 * 3. WORKFLOW CONSISTENCY
 *    - Each student has exactly 1 workflow
 *    - Workflow stages should align with currentStage
 *    - Stage statuses: pending -> in_progress/submitted -> approved
 * 
 * 4. DOCUMENT OWNERSHIP
 *    - Each document has an ownerId matching a user
 *    - Documents link to workflows via workflowId
 * 
 * 5. QUERY ATTRIBUTION
 *    - Each query has a valid userId
 *    - Queries count matches per-student aggregation
 * 
 * 6. NOTIFICATION TARGETING
 *    - Notifications reference valid userIds
 *    - relatedId matches appropriate entity type
 */

/**
 * Validate data consistency - throws if inconsistencies found
 */
export function validateDataConsistency(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Rule 1: Check adviser student counts
  advisers.forEach(adviser => {
    const actualCount = students.filter(s => s.adviserId === adviser._id).length;
    if (adviser.currentStudents !== actualCount) {
      errors.push(`Adviser ${adviser._id}: currentStudents (${adviser.currentStudents}) != actual count (${actualCount})`);
    }
    if (adviser.currentStudents > adviser.maxStudents) {
      errors.push(`Adviser ${adviser._id}: currentStudents (${adviser.currentStudents}) exceeds max (${adviser.maxStudents})`);
    }
  });
  
  // Rule 2: Check each student has a workflow
  students.forEach(student => {
    const workflow = workflows.find(w => w.studentId === student._id);
    if (!workflow) {
      errors.push(`Student ${student._id}: No workflow found`);
    }
  });
  
  // Rule 3: Check workflow stages align with currentStage
  workflows.forEach(workflow => {
    const currentStageObj = workflow.stages.find((s: any) => s.status === 'in_progress' || s.status === 'submitted');
    if (currentStageObj && currentStageObj.name !== workflow.currentStage) {
      errors.push(`Workflow ${workflow._id}: currentStage (${workflow.currentStage}) != active stage (${currentStageObj.name})`);
    }
  });
  
  // Rule 4: Check document ownership
  documents.forEach(doc => {
    const owner = users.find(u => u._id === doc.ownerId);
    if (!owner) {
      errors.push(`Document ${doc._id}: Invalid ownerId (${doc.ownerId})`);
    }
  });
  
  // Rule 5: Check query attribution
  aiQueries.forEach(query => {
    const user = users.find(u => u._id === query.userId);
    if (!user) {
      errors.push(`Query ${query._id}: Invalid userId (${query.userId})`);
    }
    if (user && user.role !== 'student') {
      errors.push(`Query ${query._id}: User ${query.userId} is not a student (${user.role})`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Run validation on module load
const validation = validateDataConsistency();
if (!validation.valid) {
  console.warn('Data consistency warnings:', validation.errors);
}
