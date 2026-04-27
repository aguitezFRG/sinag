'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import MarkdownMessage from '@/app/components/MarkdownMessage';
import { 
  Send, 
  Paperclip, 
  Plus, 
  Search, 
  Loader2, 
  Upload, 
  FileText, 
  X, 
  Check, 
  BookOpen, 
  GraduationCap, 
  Beaker, 
  BarChart, 
  Users, 
  Calendar, 
  Clock, 
  Download, 
  Eye, 
  ExternalLink, 
  Star, 
  Bookmark, 
  Copy, 
  Share2, 
  MessageSquare, 
  Lightbulb, 
  Sparkles, 
  ChevronRight, 
  History, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  Award, 
  Target, 
  Zap, 
  Filter, 
  ArrowRight, 
  Mail,
  Brain,
  Gavel,
  ClipboardCheck,
  FileSearch,
  Quote,
  UserCircle,
  EyeOff
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  citations?: Citation[];
  relatedTopics?: string[];
}

interface Citation {
  title: string;
  type: string;
  icon: string;
  color: string;
  preview?: string;
  source?: string;
  section?: string;
}

interface ConversationStarter {
  category: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  questions: string[];
}

const adviserConversationStarters: ConversationStarter[] = [
  {
    category: 'Thesis Review Guidelines',
    icon: ClipboardCheck,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    questions: [
      'Review student thesis outline requirements',
      'What should I check in a thesis outline?',
      'Guidelines for approving student proposals',
      'Review criteria for manuscript chapters',
    ]
  },
  {
    category: 'Research Methodology',
    icon: Beaker,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    questions: [
      'Generate feedback on research methodology',
      'How to evaluate experimental design?',
      'Statistical analysis requirements for MS',
      'Qualitative vs quantitative expectations',
    ]
  },
  {
    category: 'Milestone Tracking',
    icon: Target,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    questions: [
      'Check milestone completion requirements',
      'What milestones must MS students complete?',
      'PhD dissertation timeline checkpoints',
      'Comprehensive exam scheduling guidelines',
    ]
  },
  {
    category: 'SESAM Policy Clarification',
    icon: Gavel,
    color: 'text-[#0C0B5D]',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    questions: [
      'SESAM policy clarification',
      'Adviser appointment procedures',
      'Co-adviser requirements and limitations',
      'Maximum advisee load per faculty',
    ]
  },
  {
    category: 'JESAM Publishing',
    icon: Award,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    questions: [
      'JESAM publication guidelines',
      'Reviewer selection criteria',
      'Publication ethics for advisers',
      'Thesis-to-publication requirements',
    ]
  },
  {
    category: 'Defense Panel Rules',
    icon: Users,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    questions: [
      'Defense panel composition rules',
      'External reviewer nomination process',
      'PhD defense panel requirements',
      'MS thesis defense procedures',
    ]
  }
];

const conversationHistory = [
  {
    id: '1',
    title: 'Advisee Methodology Review',
    date: 'Today, 10:23 AM',
    messageCount: 12,
    lastMessage: 'The experimental design looks sound, but sample size needs justification.'
  },
  {
    id: '2',
    title: 'Defense Panel Requirements',
    date: 'Yesterday, 4:15 PM',
    messageCount: 8,
    lastMessage: 'How many external reviewers are required for PhD defenses?'
  },
  {
    id: '3',
    title: 'JESAM Review Guidelines',
    date: 'Apr 24, 2026',
    messageCount: 15,
    lastMessage: 'What are the current publication ethics requirements for co-authors?'
  },
  {
    id: '4',
    title: 'SESAM Adviser Policies',
    date: 'Apr 22, 2026',
    messageCount: 6,
    lastMessage: 'Maximum number of advisees per faculty member?'
  },
  {
    id: '5',
    title: 'Student Outline Evaluation',
    date: 'Apr 20, 2026',
    messageCount: 18,
    lastMessage: 'Review checklist for thesis outline approval.'
  }
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(false);
  const [showStudentConsultations, setShowStudentConsultations] = useState(false);
  const [activeCitations, setActiveCitations] = useState<Citation[] | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, streamingText]);

  // Simulate streaming text effect
  const streamAIResponse = async (fullText: string) => {
    const words = fullText.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      setStreamingText(currentText);
      
      // Random delay between 30-80ms for realistic typing
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 30));
    }

    setStreamingText('');
    setIsTyping(false);
  };

  const generateAIResponse = (userInput: string): { content: string; relatedTopics: string[]; citations?: Citation[] } => {
    const lowerInput = userInput.toLowerCase();
    
    // THESIS REVIEW GUIDELINES
    if (lowerInput.includes('review') || lowerInput.includes('outline') || lowerInput.includes('approve') || lowerInput.includes('checklist')) {
      return {
        content: `**THESIS OUTLINE REVIEW GUIDELINES FOR ADVISERS**

**REVIEW CHECKLIST FOR MS/PhD OUTLINES:**

✓ **Title Appropriateness**
  • Clear, specific, and researchable
  • Aligns with student's specialization
  • Reflects SESAM research priorities

✓ **Research Questions/Hypotheses**
  • Well-defined and answerable
  • Appropriate scope for degree level
  • Demonstrates environmental science relevance

✓ **Literature Foundation**
  • Recent and relevant sources (5-10 years)
  • Identifies research gaps
  • Includes JESAM and other peer-reviewed publications

✓ **Methodology Design**
  • Appropriate for research questions
  • Feasible given timeline and resources
  • Includes statistical/power analysis plan
  • Addresses potential limitations

✓ **Timeline Feasibility**
  • Realistic data collection schedule
  • Buffer time for revisions and contingencies
  • Aligns with GS enrollment requirements

✓ **Ethical Considerations**
  • Identifies REB requirements
  • Addresses biosafety if applicable
  • Plans for informed consent documentation

**APPROVAL PROCESS:**
1. Student submits outline via GS eForm
2. Adviser reviews using above criteria
3. Provide written feedback within 2 weeks
4. Sign only when all requirements met
5. Student submits signed form to GS Office

**⚠️ Adviser Responsibility:**
Your signature indicates the outline meets academic standards. Take time to review thoroughly.`,
        relatedTopics: [
          'Research methodology evaluation criteria',
          'What to do if outline needs revision',
          'Adviser appointment procedures',
          'Defense panel composition rules'
        ],
        citations: [
          {
            title: 'UPLB GS Thesis/Dissertation Manual',
            type: 'Policy Document',
            icon: 'document',
            color: 'text-blue-600',
            source: 'UPLB Graduate School',
            section: 'Chapter 3: Outline Approval'
          },
          {
            title: 'SESAM Research Guidelines 2024',
            type: 'Department Policy',
            icon: 'document',
            color: 'text-green-600',
            source: 'SESAM Graduate Program',
            section: 'Section 2.3: Adviser Responsibilities'
          }
        ]
      };
    }
    
    // RESEARCH METHODOLOGY FEEDBACK
    if (lowerInput.includes('methodology') || lowerInput.includes('experimental') || lowerInput.includes('statistical') || lowerInput.includes('design')) {
      return {
        content: `**RESEARCH METHODOLOGY EVALUATION GUIDELINES**

**QUANTITATIVE STUDIES - REVIEW CRITERIA:**

✓ **Sampling Design**
  • Justified sample size (power analysis)
  • Appropriate sampling technique
  • Representativeness addressed
  • Inclusion/exclusion criteria clear

✓ **Data Collection Instruments**
  • Validated tools preferred
  • Pilot testing mentioned
  • Calibration for equipment-based studies
  • Reliability coefficients provided

✓ **Statistical Analysis Plan**
  • Tests match research questions
  • Assumptions checked
  • Software and version specified
  • Significance level defined (typically α = 0.05)

**QUALITATIVE STUDIES - REVIEW CRITERIA:**

✓ **Research Design Rigor**
  • Clear theoretical framework
  • Triangulation strategy identified
  • Member checking procedures
  • Audit trail documentation

✓ **Data Collection**
  • Interview/focus group protocols
  • Saturation criteria defined
  • Field notes and reflexivity plan

**MIXED METHODS - ADDITIONAL CHECKS:**

✓ **Integration Design**
  • Explicit mixing strategy (convergent, explanatory, etc.)
  • Priority of QUAN vs QUAL clear
  • Point of integration identified

**PROVIDING CONSTRUCTIVE FEEDBACK:**
• Start with strengths
• Prioritize critical issues
• Suggest specific improvements
• Reference relevant JESAM methodology papers
• Set follow-up timeline

**⚠️ Common Issues to Flag:**
• Unjustified sample sizes
• Missing statistical power analysis
• Mismatched methods and questions
• Inadequate control for confounders`,
        relatedTopics: [
          'Sample size calculation guidelines',
          'Mixed methods best practices',
          'Statistical software requirements',
          'Data management plan requirements'
        ],
        citations: [
          {
            title: 'JESAM Author Guidelines',
            type: 'Journal Policy',
            icon: 'journal',
            color: 'text-red-600',
            source: 'Journal of Environmental Science and Management',
            section: 'Methodology Reporting Standards'
          }
        ]
      };
    }
    
    // MILESTONE TRACKING
    if (lowerInput.includes('milestone') || lowerInput.includes('timeline') || lowerInput.includes('checkpoint') || lowerInput.includes('comprehensive exam')) {
      return {
        content: `**ADVISEE MILESTONE COMPLETION REQUIREMENTS**

**MS (MASTER OF SCIENCE) MILESTONES:**

**Semester 1-2:**
✓ Complete foundation coursework (pass any 3 of 4 courses)
✓ Identify research adviser
✓ Submit thesis outline for approval (by end of Semester 2)
✓ Research Integrity Declaration Form

**Semester 3-4:**
✓ Pass written comprehensive examination
✓ Pass oral comprehensive examination
✓ Complete data collection (typically)
✓ Begin manuscript writing

**Semester 5-6:**
✓ Submit thesis manuscript for review
✓ Obtain committee approval for defense
✓ Defend thesis successfully
✓ Submit final revisions

**PhD (DOCTOR OF PHILOSOPHY) MILESTONES:**

**Semester 1-3:**
✓ Complete advanced coursework
✓ Pass qualifying examination
✓ Submit dissertation outline (by end of Semester 3)
✓ Finalize advisory committee

**Semester 4-6:**
✓ Complete dissertation research
✓ Submit at least 1 journal article (preferably JESAM)
✓ Prepare dissertation manuscript

**Semester 7-8:**
✓ Nominate external reviewers (5 nominees for Dean selection)
✓ Schedule final defense
✓ Defend dissertation successfully
✓ Submit final revisions and hard copies

**ADVISER MONITORING RESPONSIBILITIES:**
• Quarterly progress meetings (documented)
• Flag delays early
• Coordinate with co-advisers if applicable
• Report significant issues to Graduate Program Coordinator

**⚠️ RED FLAGS TO ADDRESS:**
• Student hasn't submitted outline by deadline
• Multiple failed comprehensive exam attempts
• No publication progress (PhD)
• Repeated timeline extensions without cause`,
        relatedTopics: [
          'Comprehensive exam administration',
          'Extension request procedures',
          'Publication requirements for PhD',
          'Committee formation guidelines'
        ],
        citations: [
          {
            title: 'UPLB GS Academic Calendar 2025-2026',
            type: 'Academic Schedule',
            icon: 'calendar',
            color: 'text-orange-600',
            source: 'UPLB Graduate School',
            section: 'Milestone Deadlines'
          }
        ]
      };
    }
    
    // SESAM POLICY CLARIFICATION
    if (lowerInput.includes('sesam policy') || lowerInput.includes('adviser appointment') || lowerInput.includes('co-adviser') || lowerInput.includes('advisee load')) {
      return {
        content: `**SESAM POLICY CLARIFICATION FOR ADVISERS**

**ADVISER APPOINTMENT PROCEDURES:**

**Eligibility Requirements:**
• Must be permanent faculty member
• Relevant research expertise to student topic
• Commitment to regular meetings (at least monthly)
• Available for thesis defense scheduling

**Appointment Process:**
1. Student submits adviser request form
2. Graduate Program Management Committee reviews
3. Adviser confirms availability and expertise match
4. Official appointment letter issued

**CO-ADVISER ARRANGEMENTS:**

**When Co-Advisers Are Recommended:**
• Interdisciplinary topics spanning multiple areas
• External expertise needed (other UPLB units or institutions)
• Heavy advisee load balancing
• Mentoring junior faculty as co-advisers

**Co-Adviser Guidelines:**
• Maximum 2 co-advisers per student
• Primary adviser must be from SESAM
• Responsibilities clearly defined in writing
• Both must sign all official documents

**ADVISEE LOAD LIMITS:**

**Maximum Active Advisees:**
• Assistant Professor: Maximum 5 MS or 3 PhD
• Associate Professor: Maximum 8 MS or 5 PhD
• Professor: Maximum 10 MS or 6 PhD

**Load Calculation:**
• MS student = 1 unit
• PhD student = 2 units
• Co-advising = 0.5 units per adviser

**Exceptions:**
• Near-completion students (final semester) may exceed limits
• Emeritus faculty may advise without load restrictions
• External advisers (non-SESAM) not counted in load

**⚠️ Policy Compliance:**
Exceeding advisee load limits requires Graduate Program Coordinator approval and justification.`,
        relatedTopics: [
          'Adviser change procedures',
          'External adviser requirements',
          'Adviser evaluation criteria',
          'Leave of absence impact'
        ],
        citations: [
          {
            title: 'SESAM Graduate Program Policies',
            type: 'Department Policy',
            icon: 'document',
            color: 'text-[#0C0B5D]',
            source: 'SESAM Graduate Program',
            section: 'Adviser Appointments and Load'
          }
        ]
      };
    }
    
    // JESAM PUBLISHING GUIDELINES
    if (lowerInput.includes('jesam') || lowerInput.includes('publishing') || lowerInput.includes('publication') || lowerInput.includes('reviewer')) {
      return {
        content: `**JESAM PUBLICATION GUIDELINES FOR ADVISERS**

**JESAM PUBLICATION REQUIREMENTS:**

**PhD Dissertation Requirement:**
• At least 1 peer-reviewed publication required before defense
• JESAM strongly preferred
• Co-authorship with adviser common and encouraged

**MS Thesis Considerations:**
• Publication encouraged but not required
• JESAM accepts high-quality MS research
• Discuss publication potential early with advisees

**ADVISER CO-AUTHORSHIP ETHICS:**

**When Advisers Should Be Co-Authors:**
✓ Significant intellectual contribution to research design
✓ Substantial manuscript writing/editing contribution
✓ Funding acquisition for the research
✓ Ongoing guidance throughout analysis

**When Advisers Should NOT Be Co-Authors:**
✗ Only routine supervisory feedback
✗ No direct contribution to writing
✗ Minimal involvement in research design

**AUTHOR ORDER GUIDELINES:**
• Student typically first author for thesis-based papers
• Adviser position reflects actual contribution
• All authors must approve final order
• Document contributions in author contribution statement

**REVIEWER SELECTION CRITERIA (When Nominating):**

**Qualities of Good Reviewers:**
• Active researcher in relevant field
• Recent publications (last 5 years)
• No conflicts of interest with authors
• Mix of local and international experts preferred
• Availability within 2-3 week window

**THE-TO-ARTICLE CONVERSION BEST PRACTICES:**
• Identify core contribution early
• Follow JESAM format from thesis writing stage
• Address reviewer feedback thoroughly
• Plan for 1-2 revision cycles
• Typical timeline: 6-12 months from submission to acceptance

**⚠️ Publication Ethics Reminder:**
COPE guidelines require disclosure of all conflicts of interest and guarantee of original work.`,
        relatedTopics: [
          'Journal selection guidance',
          'Reviewer nomination procedures',
          'Article formatting requirements',
          'Open access options'
        ],
        citations: [
          {
            title: 'JESAM Publication Ethics',
            type: 'Ethics Guidelines',
            icon: 'shield',
            color: 'text-green-600',
            source: 'COPE / JESAM',
            section: 'Authorship and Co-authorship'
          },
          {
            title: 'JESAM Submission Guidelines',
            type: 'Journal Policy',
            icon: 'journal',
            color: 'text-red-600',
            source: 'Journal of Environmental Science and Management',
            section: 'Article Types and Requirements'
          }
        ]
      };
    }
    
    // DEFENSE PANEL COMPOSITION
    if (lowerInput.includes('defense') || lowerInput.includes('panel') || lowerInput.includes('external') || lowerInput.includes('reviewer')) {
      return {
        content: `**DEFENSE PANEL COMPOSITION RULES**

**MS THESIS DEFENSE PANEL:**

**Required Composition:**
• **Advisory Committee Chair** (presides)
• **2-3 Advisory Committee Members**
• Total panel size: 3-4 members

**Qualifications:**
• All members must have PhD in relevant field
• Majority should be from SESAM
• External members allowed with justification

**PhD DISSERTATION DEFENSE PANEL:**

**Required Composition:**
• **Advisory Committee Chair** (SESAM faculty)
• **Advisory Committee Members** (2-3)
• **2 External Reviewers** (appointed by GS Dean)
• Minimum total: 5 members

**External Reviewer Nomination Process:**

**Student/Adviser Submits:**
• List of 5 potential external reviewers
• CV for each nominee
• Conflict of interest disclosure
• Justification for each nominee's expertise

**GS Dean Selection Criteria:**
• Appropriate expertise match
• Research active (publications in last 3 years)
• No conflicts of interest
• Geographical balance (if possible)
• Mix of institutional affiliations

**DEFENSE SCHEDULING REQUIREMENTS:**

**Timeline:**
• Submit external reviewer nominees: **2 months before** target defense
• Panel confirmation: **3-4 weeks before** defense
• Public announcement: **2 weeks before** defense
• Final manuscript to panel: **1 week before** defense

**DOCUMENT SUBMISSION (PhD):**
• 3 hard copies of dissertation (bound)
• 1 PDF soft copy
• All must be approved by advisory committee

**PASSING CRITERIA:**

**MS Defense:**
• Pass with revisions (typical)
• Pass without revisions (exceptional)
• Fail with option to revise and re-defend

**PhD Defense:**
• Candidate fails with **more than one negative vote**
• External reviewers have equal voting weight
• Re-examination allowed no earlier than 1 month, no later than 1 year

**⚠️ Adviser Responsibilities:**
• Ensure student meets all submission deadlines
• Verify panel composition complies with GS rules
• Brief external reviewers on defense format
• Coordinate with Graduate Program Office for scheduling`,
        relatedTopics: [
          'External reviewer nomination form',
          'Defense announcement procedures',
          'Re-examination guidelines',
          'Defense format and timing'
        ],
        citations: [
          {
            title: 'UPLB GS Defense Procedures',
            type: 'Policy Document',
            icon: 'document',
            color: 'text-blue-600',
            source: 'UPLB Graduate School',
            section: 'Thesis/Dissertation Defense'
          }
        ]
      };
    }
    
    // Default response
    return {
      content: `I'm SINAG (SESAM Intelligent Natural-language Advising Guide), your AI Research Assistant in **Adviser Mode**.

**I can help you with:**

📝 **Thesis Review & Approval**
• Outline review checklists and criteria
• Methodology evaluation guidelines
• Manuscript chapter approval standards
• Providing constructive feedback templates

📊 **Advisee Milestone Monitoring**
• MS/PhD timeline requirements
• Comprehensive exam procedures
• Publication milestones for PhD
• Red flags and intervention guidance

⚖️ **SESAM Policies & Procedures**
• Adviser appointment processes
• Co-adviser arrangements
• Advisee load limits
• Committee formation rules

📚 **JESAM & Publishing Guidance**
• Publication requirements for graduation
• Co-authorship ethics (COPE-aligned)
• Reviewer nomination criteria
• Thesis-to-article conversion

🎓 **Defense Panel Management**
• Panel composition rules (MS vs PhD)
• External reviewer nomination process
• Defense scheduling requirements
• Voting and evaluation procedures

**Quick-reply chips** are available to get started quickly, or type your specific question!

⚠️ **Remember:** All AI guidance is advisory only. Always confirm policy details with the Graduate Program Coordinator or SESAM office.`,
      relatedTopics: [
        'Review student thesis outline requirements',
        'Generate feedback on research methodology',
        'Check milestone completion requirements',
        'SESAM policy clarification',
        'JESAM publication guidelines',
        'Defense panel composition rules'
      ]
    };
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    setIsSending(true);
    setHasStartedConversation(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Show typing indicator after a brief delay
    setTimeout(() => {
      setIsTyping(true);
    }, 400);

    // Simulate AI "thinking" time (1.5-2.5 seconds)
    const thinkingTime = 1500 + Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, thinkingTime));

    const response = generateAIResponse(userMessage.content);

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: response.content,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      relatedTopics: response.relatedTopics,
      citations: response.citations,
    };

    // Stream the response
    await streamAIResponse(response.content);
    
    setMessages(prev => [...prev, aiMessage]);
    setIsSending(false);
  };

  const handleStarterClick = (question: string) => {
    setInput(question);
    setHasStartedConversation(true);
    // Auto-submit after a brief delay
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleNewConversation = () => {
    setMessages([]);
    setHasStartedConversation(false);
    setAttachedFiles([]);
    setSelectedCategory(null);
    setActiveCitations(null);
  };

  const getDisplayedQuestions = (category: ConversationStarter) => {
    if (selectedCategory === category.category) {
      return category.questions;
    }
    return category.questions.slice(0, 3);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] overflow-hidden bg-gray-50">
      {/* Conversation History Sidebar */}
      <div className={`${showHistorySidebar ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex-shrink-0`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Conversation History</h2>
            <button
              onClick={() => setShowHistorySidebar(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0C0B5D] text-white rounded-lg hover:bg-[#0a0949] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>
        
        {/* Student Consultations Toggle */}
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <button
            onClick={() => setShowStudentConsultations(!showStudentConsultations)}
            className="w-full flex items-center justify-between p-2 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-[#0C0B5D]" />
              <span className="text-sm font-medium text-gray-700">Advisee AI Consultations</span>
            </div>
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showStudentConsultations ? 'rotate-90' : ''}`} />
          </button>
          {showStudentConsultations && (
            <div className="mt-2 space-y-2">
              <button className="w-full p-2 text-left text-sm text-gray-600 hover:bg-blue-100 rounded">
                <div className="flex items-center gap-2">
                  <Eye className="w-3 h-3" />
                  <span>Maria Santos - Outline Review</span>
                </div>
                <p className="text-xs text-gray-400 ml-5">2 days ago • 8 messages</p>
              </button>
              <button className="w-full p-2 text-left text-sm text-gray-600 hover:bg-blue-100 rounded">
                <div className="flex items-center gap-2">
                  <Eye className="w-3 h-3" />
                  <span>Juan Dela Cruz - REB Questions</span>
                </div>
                <p className="text-xs text-gray-400 ml-5">5 days ago • 12 messages</p>
              </button>
              <p className="text-xs text-gray-400 mt-2 px-2">Read-only view for monitoring advisee progress</p>
            </div>
          )}
        </div>

        <div className="overflow-y-auto" style={{ height: 'calc(100% - 200px)' }}>
          {conversationHistory.map((conv) => (
            <button
              key={conv.id}
              className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors"
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 mb-1 truncate">{conv.title}</p>
                  <p className="text-xs text-gray-500 mb-1">{conv.date}</p>
                  <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                  <p className="text-xs text-gray-400 mt-1">{conv.messageCount} messages</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Enhanced Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setShowHistorySidebar(!showHistorySidebar)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <History className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0C0B5D] rounded-xl flex items-center justify-center shadow-lg border-2 border-blue-400">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-semibold text-[#0C0B5D]">SINAG AI Research Assistant - Adviser Mode</h1>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">SESAM Intelligent Natural-language Advising Guide</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasStartedConversation && (
                <button
                  onClick={handleNewConversation}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">New Chat</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!hasStartedConversation && messages.length === 0 ? (
            /* Welcome Screen with Conversation Starters */
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#0C0B5D] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Welcome, Adviser. How can I assist you today?</h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Ask about thesis reviews, milestone tracking, SESAM policies, JESAM publishing, or defense panel rules.
                </p>
              </div>

              {/* Conversation Starters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {adviserConversationStarters.map((starter) => {
                  const Icon = starter.icon;
                  const displayedQuestions = getDisplayedQuestions(starter);
                  const isExpanded = selectedCategory === starter.category;

                  return (
                    <div
                      key={starter.category}
                      className={`${starter.bgColor} ${starter.borderColor} border-2 rounded-xl p-3 sm:p-4 transition-all hover:shadow-md`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center shadow-sm`}>
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${starter.color}`} />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{starter.category}</h3>
                      </div>
                      <div className="space-y-2">
                        {displayedQuestions.map((question, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleStarterClick(question)}
                            className="w-full text-left px-3 py-2 bg-white/80 hover:bg-white rounded-lg text-xs sm:text-sm text-gray-700 hover:text-[#0C0B5D] transition-colors border border-transparent hover:border-gray-200"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                      {starter.questions.length > 3 && (
                        <button
                          onClick={() => setSelectedCategory(isExpanded ? null : starter.category)}
                          className="mt-2 text-xs text-[#0C0B5D] hover:underline font-medium"
                        >
                          {isExpanded ? 'Show less' : `+${starter.questions.length - 3} more`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Citation Support Note */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Quote className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm mb-1">Citation Support Enabled</h4>
                    <p className="text-sm text-blue-700">
                      AI responses now include citations to official UPLB GS, SESAM, and JESAM documents. 
                      Click on citations to view source documents for policy verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'ai' ? (
                    /* AI Message */
                    <div className="flex gap-3 max-w-[90%] sm:max-w-[85%]">
                      <div className="w-8 h-8 bg-[#0C0B5D] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 sm:px-5 py-3 sm:py-4 shadow-sm">
                          <MarkdownMessage content={message.content} />
                          <p className="text-xs text-gray-400 mt-3">{message.timestamp}</p>
                        </div>

                        {/* Citations */}
                        {message.citations && message.citations.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sources</p>
                            <div className="flex flex-wrap gap-2">
                              {message.citations.map((citation, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setActiveCitations(message.citations || null)}
                                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors text-left"
                                >
                                  <FileText className={`w-4 h-4 ${citation.color}`} />
                                  <div>
                                    <p className="text-xs font-medium text-gray-700">{citation.title}</p>
                                    <p className="text-xs text-gray-500">{citation.source}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Related Topics */}
                        {message.relatedTopics && message.relatedTopics.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.relatedTopics.map((topic, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleStarterClick(topic)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full text-xs text-[#0C0B5D] font-medium transition-colors"
                              >
                                {topic}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* User Message */
                    <div className="max-w-[85%] sm:max-w-[75%]">
                      <div className="bg-[#0C0B5D] text-white rounded-2xl rounded-tr-sm px-4 sm:px-5 py-3 shadow-sm">
                        <p className="text-sm sm:text-base">{message.content}</p>
                        <p className="text-xs text-blue-200 mt-1">{message.timestamp}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[90%] sm:max-w-[85%]">
                    <div className="w-8 h-8 bg-[#0C0B5D] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                      {streamingText ? (
                        <MarkdownMessage content={streamingText} className="streaming" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="max-w-4xl mx-auto">
            {/* Attached Files */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-800">{file}</span>
                    <button
                      onClick={() => setAttachedFiles(attachedFiles.filter((_, i) => i !== idx))}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Field */}
            <div className="flex items-end gap-2 sm:gap-3">
              <button
                onClick={() => {
                  // Simulate file attachment
                  setAttachedFiles([...attachedFiles, `document_${attachedFiles.length + 1}.pdf`]);
                }}
                className="p-2.5 sm:p-3 text-gray-500 hover:text-[#0C0B5D] hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
                title="Attach file"
              >
                <Paperclip className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about thesis reviews, policies, or defense requirements..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C0B5D] focus:border-transparent text-sm sm:text-base"
                  disabled={isSending}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="p-2.5 sm:p-3 bg-[#0C0B5D] text-white rounded-xl hover:bg-[#0a0949] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-2 text-center">
              SINAG AI provides guidance based on SESAM/UPLB policies. Always confirm critical decisions with the Graduate Program Coordinator.
            </p>
          </div>
        </div>
      </div>

      {/* Citations Panel (Optional Overlay) */}
      {activeCitations && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Document Citations</h3>
                <button
                  onClick={() => setActiveCitations(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                {activeCitations.map((citation, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <FileText className={`w-5 h-5 ${citation.color} flex-shrink-0 mt-0.5`} />
                      <div>
                        <h4 className="font-semibold text-gray-900">{citation.title}</h4>
                        <p className="text-sm text-gray-600">{citation.source}</p>
                        {citation.section && (
                          <p className="text-sm text-[#0C0B5D] font-medium mt-1">Section: {citation.section}</p>
                        )}
                        <button className="mt-3 flex items-center gap-2 text-sm text-[#0C0B5D] hover:underline">
                          <ExternalLink className="w-4 h-4" />
                          View document
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
