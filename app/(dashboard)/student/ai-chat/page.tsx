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
  Brain
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
}

interface ConversationStarter {
  category: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  questions: string[];
}

const studentConversationStarters: ConversationStarter[] = [
  {
    category: 'Thesis Outline Approval',
    icon: FileText,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    questions: [
      'Thesis outline approval',
      'What forms do I need for outline approval?',
      'When is my outline due?',
      'How do I submit the outline approval form?',
    ]
  },
  {
    category: 'Manuscript Formatting',
    icon: BookOpen,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    questions: [
      'Manuscript formatting',
      'What are the UPLB GS formatting requirements?',
      'Thesis margins and font requirements',
      'Order of preliminary pages',
    ]
  },
  {
    category: 'Research Ethics / REB',
    icon: Users,
    color: 'text-[#0C0B5D]',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    questions: [
      'Research ethics / REB',
      'Do I need UPLB REB approval?',
      'Research Integrity Declaration Form',
      'Scientific name certification requirements',
    ]
  },
  {
    category: 'Defense Requirements',
    icon: GraduationCap,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    questions: [
      'Defense requirements',
      'MS comprehensive exam requirements',
      'PhD by Research defense panel',
      'When can I schedule my defense?',
    ]
  },
  {
    category: 'Publishing in JESAM',
    icon: Award,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    questions: [
      'Publishing in JESAM',
      'JESAM submission requirements',
      'Publication ethics guidelines',
      'How to access JESAM archives',
    ]
  },
  {
    category: 'Thesis Topic Recommender',
    icon: Lightbulb,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    questions: [
      'Suggest thesis topics for my interest',
      'I\'m interested in water quality',
      'Help me find JESAM papers about mangroves',
      'Recommend topics in climate adaptation',
    ]
  }
];

const conversationHistory = [
  {
    id: '1',
    title: 'Statistical Analysis Selection',
    date: 'Yesterday, 3:45 PM',
    messageCount: 18,
    lastMessage: 'Thank you! The ANOVA explanation with examples was very helpful.'
  },
  {
    id: '2',
    title: 'Literature Review Structure',
    date: 'Apr 3, 2026',
    messageCount: 12,
    lastMessage: 'Can you suggest more recent sources on mangrove restoration?'
  },
  {
    id: '3',
    title: 'IRB Ethics Approval Process',
    date: 'Apr 2, 2026',
    messageCount: 15,
    lastMessage: 'What documents do I need for the submission?'
  },
  {
    id: '4',
    title: 'Mixed Methods Integration',
    date: 'Apr 1, 2026',
    messageCount: 20,
    lastMessage: 'How do I present QUAN and QUAL findings together?'
  },
  {
    id: '5',
    title: 'Thesis Timeline Planning',
    date: 'Mar 28, 2026',
    messageCount: 9,
    lastMessage: 'Is 6 months realistic for data collection?'
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

  const generateAIResponse = (userInput: string): { content: string; relatedTopics: string[] } => {
    const lowerInput = userInput.toLowerCase();
    
    // THESIS OUTLINE APPROVAL
    if (lowerInput.includes('outline approval') || (lowerInput.includes('outline') && lowerInput.includes('approve')) || lowerInput.includes('outline due') || lowerInput.includes('forms')) {
      return {
        content: "**THESIS OUTLINE APPROVAL**\n\n**MS Students:**\n• Approved title and outline required by end of **2nd semester** of thesis enrolment\n\n**PhD Students:**\n• Approved title and outline required by end of **3rd semester** of dissertation enrolment\n\n**Required Forms:**\n1. **Approval of Thesis/Dissertation Outline eForm** (UPLB GS website)\n2. **Research Integrity Declaration Form** (UPLB GS website)\n\n**Printing Requirements:**\n• Print on **A4 white bond** paper\n• Laser print preferred (barcodes must be crisp)\n• All signatories except GS officers sign before submission\n\n**Submission Process:**\n1. Complete forms with adviser signature\n2. Print on required paper\n3. Submit to Graduate School Office\n\n**⚠️ Confirm with your adviser** for program-specific variations.",
        relatedTopics: [
          'What should I include in my thesis outline?',
          'Research Integrity Declaration Form',
          'When do I need scientific name certification?',
          'Manuscript formatting'
        ]
      };
    }
    
    // MANUSCRIPT FORMATTING
    if (lowerInput.includes('manuscript') || lowerInput.includes('formatting') || lowerInput.includes('margins') || lowerInput.includes('font') || lowerInput.includes('preliminary pages')) {
      return {
        content: "**MANUSCRIPT FORMATTING (UPLB GS Standard)**\n\n**PAGE MARGINS:**\n• Left: **1.5 inches**\n• Top: **1 inch**\n• Bottom: **1 inch**\n• Right: **1 inch**\n\n**FONT & SPACING:**\n• Font: **Times New Roman, 12pt**\n• Main text: **Third-person POV, justified, double-spaced**\n• First-line indent: **½ inch**\n\n**PRELIMINARY PAGES (in order):**\n1. IPR Form\n2. Title Page\n3. Approval Page\n4. Biographical Sketch\n5. Acknowledgement\n6. Table of Contents\n7. List of Tables\n8. List of Figures\n9. List of Appendices\n10. Abstract\n\n**SPECIAL REQUIREMENTS:**\n• **Abstract:** Max 250 words, single page\n• **Acknowledgement:** Single-spaced, single page\n• **Biographical Sketch:** Double-spaced, single page, optional 2×2 photo top-right, signed by author\n\n**MAIN SECTIONS (in order):**\n1. Introduction\n2. Review of Literature\n3. Materials and Methods\n4. Results and Discussion\n5. Summary and Conclusion\n6. Literature Cited\n\n**NOTE:** Confirm binding color with SESAM office (varies by unit).\n\n⚠️ **Confirm with your adviser** for any unit-specific modifications.",
        relatedTopics: [
          'Thesis outline approval',
          'What should be in the abstract?',
          'How to format references?',
          'Defense requirements'
        ]
      };
    }
    
    // RESEARCH ETHICS / REB  
    if (lowerInput.includes('reb') || lowerInput.includes('research ethics') || lowerInput.includes('research integrity') || lowerInput.includes('scientific name')) {
      return {
        content: "**RESEARCH ETHICS (UPLB REB)**\n\n**WHAT IS UPLB REB?**\nUPLB Research Ethics Board reviews non-biomedical/non-clinical protocols involving:\n• Human participants\n• Sensitive data\n• Vulnerable populations\n\n**RESEARCH INTEGRITY DECLARATION FORM:**\nThis form triggers review requirements for studies needing:\n• REB approval\n• Biosafety clearance\n• Museum of Natural History (MNH) approval\n\n⚠️ **Important:** Declaring \"No\" on required approvals is **not final** until approved by the GS Dean.\n\n**SCIENTIFIC NAME CERTIFICATION:**\nFor studies on organisms (plants, animals, bio-materials):\n• **Requirement:** Scientific name certification from **UPLB Museum of Natural History**\n• **Timeline:** Required at least **5 working days before** submission to guidance committee\n• Apply early to avoid delays!\n\n**PROCESS:**\n1. Identify if your research involves human subjects or organisms\n2. Complete Research Integrity Declaration Form\n3. Get scientific name certification (if applicable)\n4. Submit for REB review if triggered\n5. Wait for approval before data collection\n\n**TIMELINE:**\n• Scientific name certification: 5+ working days\n• REB review: 2-4 weeks (varies by complexity)\n\n⚠️ **Confirm with your adviser** about specific ethical requirements for your study.",
        relatedTopics: [
          'Do I need REB approval for surveys?',
          'How to get scientific name certification?',
          'Research Integrity Declaration Form requirements',
          'Defense requirements'
        ]
      };
    }
    
    // DEFENSE REQUIREMENTS
    if (lowerInput.includes('defense') || lowerInput.includes('comprehensive exam') || lowerInput.includes('panel') || lowerInput.includes('oral exam') || lowerInput.includes('ms ') || lowerInput.includes('phd')) {
      return {
        content: "**EXAMS AND DEFENSE REQUIREMENTS**\n\n**MS (Master of Science):**\n• Must pass **any 3 of 4 foundation courses**\n• Pass **written comprehensive exam**\n• Pass **oral comprehensive exam**\n• **Defend thesis** before advisory committee\n\n**PhD by Research:**\n• **Final Defense Panel Composition:**\n  - Advisory committee members\n  - **2 external reviewers** (appointed by GS Dean from 5 nominees submitted by student/adviser)\n• **Oral exam:** Open to the public\n• **Passing requirement:** Candidate fails with **more than one negative vote**\n\n**SUBMISSION REQUIREMENTS (PhD):**\n• **3 hard copies** of dissertation\n• **1 PDF soft copy**\n• All copies must be **approved by Advisory Committee** before submission\n\n**RE-EXAMINATION (if needed):**\n• Allowed **no earlier than 1 month, no later than 1 year** after first exam\n• Requires **unanimous advisory committee approval**\n\n**TIMELINE:**\n• Submit external reviewer nominees at least 2 months before target defense\n• Allow 3-4 weeks for panel scheduling\n• Final revisions typically due 2 weeks after defense\n\n⚠️ **Confirm with your adviser** about program-specific defense procedures.",
        relatedTopics: [
          'When should I schedule my defense?',
          'How to choose external reviewers?',
          'What happens if I fail the defense?',
          'Publishing in JESAM'
        ]
      };
    }
    
    // PUBLISHING IN JESAM
    if (lowerInput.includes('jesam') || lowerInput.includes('publish') || lowerInput.includes('publication ethics') || lowerInput.includes('journal')) {
      return {
        content: "**PUBLISHING IN JESAM**\n\n**Journal of Environmental Science and Management**\n• ISSN: 0119-11449\n• **Web of Science and Scopus indexed**\n• Published semi-annually\n• Archive: ovcre.uplb.edu.ph/journals-uplb/index.php/JESAM\n\n**SUBMISSION CHECKLIST:**\n✓ Not previously published\n✓ Not under consideration elsewhere\n✓ **File format:** OpenOffice, MS Word, or RTF\n✓ **Text:** Single-spaced, 12pt, italics (not underline) except URLs\n✓ **Figures/tables:** Placed inline, not at end\n✓ **URLs:** Provided for references where available\n\n**PUBLICATION ETHICS (COPE-aligned):**\n• **Originality required** - any plagiarism is unacceptable\n• **All listed authors** must approve manuscript and order\n• **Disclose** financial and non-financial conflicts of interest\n• **Deposit** research data in relevant repository when possible\n• **Obtain** informed consent for human subjects\n• **Notify editor promptly** of significant errors for correction or retraction\n\n**SUBMISSION PROCESS:**\n1. Prepare manuscript according to JESAM format\n2. Submit via journal website\n3. Peer review process (2-3 months)\n4. Revisions (if required)\n5. Acceptance and publication\n\n**PRO TIP:** Many SESAM students publish thesis chapters in JESAM. Discuss with your adviser!\n\n⚠️ **Confirm with your adviser** about publication strategy and timing.",
        relatedTopics: [
          'How to format my manuscript for JESAM?',
          'What is the review timeline?',
          'Can I publish before graduating?',
          'Suggest thesis topics for my interest'
        ]
      };
    }
    
    // TOPIC RECOMMENDER - WATER QUALITY
    if (lowerInput.includes('water') || lowerInput.includes('river') || lowerInput.includes('lake') || lowerInput.includes('pollution') || lowerInput.includes('quality')) {
      return {
        content: "**THESIS TOPIC RECOMMENDATION: Water Quality**\n\n**🎯 MATCHING SPECIALIZATION:**\n**Environmental Chemistry**\n\nRationale: Your interest in water quality aligns perfectly with Environmental Chemistry's focus on aquatic systems. Contact the Graduate Program Management Committee for adviser matching.\n\n**💡 SUGGESTED THESIS TOPIC ANGLES:**\n\n1. **Water quality assessment in crater lakes** - Evaluate physicochemical parameters and community perceptions in unique aquatic systems. Viable at SESAM due to proximity to Laguna de Bay and other water bodies.\n\n2. **Macroinvertebrate biomonitoring** - Use aquatic insects as bioindicators for water quality assessment. Strong SESAM expertise in biomonitoring and taxonomy.\n\n3. **Nutrient loading and eutrophication** - Analyze temporal and spatial trends of nutrients in lake/river systems. Builds on SESAM's long-term monitoring expertise.\n\n**📚 SUGGESTED JESAM PAPERS:**\n\n**Pleto et al. (2024)**\n\"Assessment and Local Community Perception on the Water Quality of the Seven Crater Lakes of San Pablo City, Philippines\"\nDOI: 10.47125/jesam/2024_1/05\n→ Integrates water quality data with community perspectives\n\n**Igloria et al. (2024)**\n\"Macroinvertebrate Community as Bioindicator of Water Quality of Tambis River, Palompon, Leyte, Philippines\"\nDOI: 10.47125/jesam/2024_1/03\n→ Demonstrates biomonitoring approach for Philippine rivers\n\n**Macuroy et al. (2019)**\n\"Analyzing the Temporal and Spatial Trends of Water Quality and Eutrophication in Laguna de Bay, Philippines, 2000-2012\"\nDOI: 10.47125/jesam/2019_sp1/04\n→ Long-term analysis reveals eutrophication patterns\n\n🔗 **Access:** ovcre.uplb.edu.ph/journals-uplb/index.php/JESAM\n\n**✅ NEXT STEP:**\nRead these papers to understand methodologies, then contact the Graduate Program Management Committee for adviser matching.\n\n⚠️ **Confirm with your adviser** for targeted recommendations.",
        relatedTopics: [
          'Show me more papers like these',
          'Who should I contact as adviser?',
          'How do I narrow this further?',
          'Manuscript formatting'
        ]
      };
    }
    
    // TOPIC RECOMMENDER - GENERIC
    if (lowerInput.includes('suggest') || lowerInput.includes('recommend') || lowerInput.includes('topic') || lowerInput.includes('interested')) {
      return {
        content: "I'd love to help you find a thesis topic! Could you tell me what environmental topics interest you?\n\nGive me a few keywords — for example:\n• 'water quality in urban rivers'\n• 'climate adaptation in farming communities'\n• 'mangrove biodiversity'\n• 'waste management'\n• 'forest restoration'\n\nOnce I know your interests, I can suggest:\n✓ Specific thesis topic angles\n✓ Matching SESAM specialization\n✓ Relevant JESAM papers to read\n✓ Next steps to get started",
        relatedTopics: [
          "I'm interested in water quality",
          'Help me find JESAM papers about mangroves',
          'Recommend topics in climate adaptation',
          'What SESAM specializations are there?'
        ]
      };
    }
    
    // Default response
    return {
      content: "I'm SINAG (SESAM Intelligent Natural-language Advising Guide), your AI Research Assistant trained on SESAM/UPLB thesis processes, research ethics, and JESAM publishing guidelines.\n\n**I can help you with:**\n\n📝 **Thesis Processes**\n• Outline approval requirements\n• Manuscript formatting (UPLB GS standards)\n• Defense requirements for MS/PhD\n• Timeline planning and milestones\n\n⚖️ **Research Ethics**\n• UPLB REB approval process\n• Research Integrity Declaration Form\n• Scientific name certification\n• Ethical considerations for field research\n\n📚 **JESAM Publishing**\n• Submission requirements and checklist\n• Publication ethics (COPE-aligned)\n• Formatting guidelines\n• Review process timeline\n\n🎯 **Topic Recommendations**\n• Suggest thesis topics based on your interests\n• Match your interests to SESAM specializations\n• Recommend relevant JESAM papers\n• Guide next steps for getting started\n\n**Quick-reply chips** are available to get started quickly, or type your specific question!\n\n⚠️ **Remember:** All AI guidance is advisory only. Always confirm program-specific details with your adviser or the SESAM office.",
      relatedTopics: [
        'Thesis outline approval',
        'Manuscript formatting',
        'Research ethics / REB',
        'Defense requirements',
        'Publishing in JESAM',
        'Suggest thesis topics for my interest'
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
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSend();
    }, 100);
  };

  const handleNewConversation = () => {
    setMessages([]);
    setHasStartedConversation(false);
    setAttachedFiles([]);
    setSelectedCategory(null);
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
        <div className="overflow-y-auto" style={{ height: 'calc(100% - 120px)' }}>
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
                  <h1 className="text-base sm:text-lg font-semibold text-[#0C0B5D]">SINAG AI Research Assistant</h1>
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
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">How can I help with your thesis journey?</h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Ask about thesis writing, forms, ethics, defense requirements, or JESAM publishing.
                </p>
              </div>

              {/* Conversation Starters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {studentConversationStarters.map((starter) => {
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
                  placeholder="Ask about your thesis, methodology, timeline..."
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
              SINAG AI provides guidance based on SESAM/UPLB policies. Always confirm critical decisions with your adviser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
