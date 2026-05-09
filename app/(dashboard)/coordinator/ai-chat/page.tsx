'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart, BookOpen, Calendar, ClipboardList, FileText, GraduationCap, History, MessageSquare, Plus, Sparkles, Users, X } from 'lucide-react';
import AIChat, { ChatMessage } from '@/app/components/AIChat';
import type { ConversationStarter, RoleBadge } from '@/app/components/AIChat';
import RatingModal from '@/app/components/RatingModal';

const COORDINATOR_ROLE_BADGE: RoleBadge = {
  label: 'SESAM Coordinator',
  icon: ClipboardList,
  color: 'text-teal-700',
  bgColor: 'bg-teal-50',
  borderColor: 'border-teal-200',
};

const COORDINATOR_STARTERS: ConversationStarter[] = [
  {
    category: 'Enrollment & Admissions',
    icon: ClipboardList,
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    questions: [
      'What is the SESAM graduate admission process?',
      'Enrollment requirements per semester for SESAM students',
      'Quota and slot availability policies',
      'Transfer student requirements and procedure',
    ],
  },
  {
    category: 'Student-Adviser Management',
    icon: Users,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    questions: [
      'Guidelines for assigning advisers to new SESAM students',
      'When can a student change their adviser?',
      'Maximum advisee load per faculty adviser',
      'Co-adviser policies and procedures',
    ],
  },
  {
    category: 'Degree & Program Requirements',
    icon: GraduationCap,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    questions: [
      'MS degree requirements at SESAM',
      'PhD by Research program requirements',
      'MS comprehensive exam guidelines',
      'Graduation application deadlines and process',
    ],
  },
  {
    category: 'Academic Calendar & Policies',
    icon: Calendar,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    questions: [
      'Thesis outline and defense deadlines this semester',
      'Leave of absence and extension policies',
      'Credit overload and underload policies',
      'Residency and maximum stay requirements',
    ],
  },
  {
    category: 'Student Progress Tracking',
    icon: BarChart,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    questions: [
      'What are the thesis workflow stages at SESAM?',
      'Typical timeline from enrollment to graduation',
      'Requirements before a student can defend',
      'How to monitor student academic load and progress',
    ],
  },
  {
    category: 'JESAM & Research Output',
    icon: BookOpen,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    questions: [
      'What is the JESAM journal scope and aims?',
      'Publication requirements before SESAM graduation',
      'JESAM submission and review timeline',
      'How to access the JESAM publication archive',
    ],
  },
];

interface QueryHistoryItem {
  _id: string;
  query: string;
  response: string;
  createdAt: string;
  sessionId?: string;
  sources?: { title: string; type: string; url?: string }[];
}

interface Session {
  sessionId: string;
  title: string;
  date: Date;
  messageCount: number;
  lastMessage: string;
}

function formatSessionDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CoordinatorAIChatPage() {
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState(0);
  const [ratingSessionId, setRatingSessionId] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch('/api/queries?limit=50', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load chat history');
        setHistory(Array.isArray(data.queries) ? data.queries : []);
      } catch (err: unknown) {
        setHistoryError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, []);

  const sessions = useMemo<Session[]>(() => {
    const groups = new Map<string, QueryHistoryItem[]>();
    for (const q of history) {
      const sid = q.sessionId || q._id;
      if (!groups.has(sid)) groups.set(sid, []);
      groups.get(sid)!.push(q);
    }
    return Array.from(groups.entries())
      .map(([sessionId, queries]) => {
        const sorted = [...queries].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return {
          sessionId,
          title: sorted[sorted.length - 1]?.query?.slice(0, 55) || 'Conversation',
          date: new Date(sorted[0].createdAt),
          messageCount: sorted.length * 2,
          lastMessage: sorted[0]?.query?.slice(0, 80) || '',
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [history]);

  const activeMessages = useMemo<ChatMessage[]>(() => {
    if (activeSessionId === null) return [];
    return history
      .filter((q) => (q.sessionId || q._id) === activeSessionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .flatMap((item) => [
        { id: `${item._id}-q`, role: 'user' as const, content: item.query, timestamp: new Date(item.createdAt) },
        { id: `${item._id}-a`, role: 'assistant' as const, content: item.response, timestamp: new Date(item.createdAt), sources: item.sources },
      ]);
  }, [activeSessionId, history]);

  const handleNewChat = () => { setActiveSessionId(null); setChatKey((k) => k + 1); setShowSidebar(false); };
  const handleSelectSession = (sessionId: string) => { setActiveSessionId(sessionId); setChatKey((k) => k + 1); setShowSidebar(false); };
  const handleEndChat = (sessionId: string) => setRatingSessionId(sessionId);
  const handleRatingDone = () => { setRatingSessionId(null); handleNewChat(); };

  return (
    <div className="flex h-[calc(100dvh-4rem)] overflow-hidden bg-gray-50">
      {ratingSessionId && (
        <RatingModal
          sessionId={ratingSessionId}
          onClose={() => { setRatingSessionId(null); handleNewChat(); }}
          onSubmitted={handleRatingDone}
        />
      )}

      <div className={`${showSidebar ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden flex-shrink-0 bg-white border-r border-gray-200 flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Conversation History</h2>
            <button onClick={() => setShowSidebar(false)} className="p-1 hover:bg-gray-100 rounded transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
          </div>
          <button onClick={handleNewChat} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0C0B5D] text-white rounded-lg hover:bg-[#0a0949] transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" /> New Conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingHistory ? (
            <div className="p-4 text-xs text-gray-500">Loading history...</div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-xs text-gray-500">No past conversations yet.</div>
          ) : sessions.map((session) => (
            <button key={session.sessionId} onClick={() => handleSelectSession(session.sessionId)}
              className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${activeSessionId === session.sessionId ? 'bg-blue-50 border-l-2 border-l-[#0C0B5D]' : ''}`}>
              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 mb-0.5 truncate font-medium">{session.title}</p>
                  <p className="text-xs text-gray-500 mb-0.5">{formatSessionDate(session.date)}</p>
                  <p className="text-xs text-gray-400 truncate">{session.lastMessage}</p>
                  <p className="text-xs text-gray-400 mt-1">{session.messageCount} messages</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Toggle history">
              <History className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#0C0B5D] rounded-lg flex items-center justify-center border-2 border-blue-400">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-[#0C0B5D] leading-tight">SINAG AI Program Assistant</h1>
                <p className="text-xs text-gray-500">Admissions, degree requirements, adviser management, and SESAM policies</p>
              </div>
            </div>
          </div>
          {activeSessionId !== null && (
            <button onClick={handleNewChat} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <Plus className="w-4 h-4" /> New Chat
            </button>
          )}
        </div>

        <div className="flex-1 min-h-0 p-4">
          {loadingHistory ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-gray-200 bg-white text-sm text-gray-500 shadow-sm">Loading previous conversations...</div>
          ) : historyError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{historyError}</div>
          ) : (
            <AIChat
              key={`${activeSessionId ?? 'new'}-${chatKey}`}
              initialMessages={activeMessages}
              sessionId={activeSessionId ?? undefined}
              conversationStarters={COORDINATOR_STARTERS}
              starterDisplayMode="chips"
              welcomeDescription="Query SESAM admissions, degree requirements, student-adviser policies, academic calendar, and JESAM publication standards. Advisory only."
              showCapabilityBadges={false}
              inputPlaceholder="Ask about admissions, degree requirements, adviser policies, or SESAM procedures…"
              tipText="Specify the program (MS/PhD) and context for the most accurate policy guidance. All replies are advisory."
              roleBadge={COORDINATOR_ROLE_BADGE}
              onEndChatClick={handleEndChat}
            />
          )}
        </div>
      </div>
    </div>
  );
}
