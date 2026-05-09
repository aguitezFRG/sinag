'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  ArrowRight,
  Lightbulb,
  FileText,
  BookOpen,
  Users,
  GraduationCap,
  Award,
  BarChart,
  Beaker,
  Plus,
  X,
  Copy,
  Check,
  ExternalLink,
  BookMarked,
} from 'lucide-react';
import MarkdownMessage from './MarkdownMessage';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: { title: string; type: string; url?: string }[];
  isStreaming?: boolean;
}

export interface ConversationStarter {
  category: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  questions: string[];
}

export interface RoleBadge {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface AIChatProps {
  initialMessages?: ChatMessage[];
  sessionId?: string;
  onSendMessage?: (msg: string) => Promise<{ content: string; sources?: { title: string; type: string; url?: string }[] }>;
  conversationStarters?: ConversationStarter[];
  /** 'cards' = 2-column card grid; 'chips' = clean 2-col grid (students) */
  starterDisplayMode?: 'cards' | 'chips';
  welcomeDescription?: string;
  showCapabilityBadges?: boolean;
  inputPlaceholder?: string;
  tipText?: string;
  /** Role badge displayed next to the SINAG logo in the welcome screen */
  roleBadge?: RoleBadge;
  /** Called with the current sessionId when user clicks "End Chat" */
  onEndChatClick?: (sessionId: string) => void;
}

const MAX_CHAT_QUERY_LENGTH = 500;

const DEFAULT_CONVERSATION_STARTERS: ConversationStarter[] = [
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
    ],
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
    ],
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
    ],
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
    ],
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
    ],
  },
  {
    category: 'Thesis Topic Recommender',
    icon: Lightbulb,
    color: 'text-[#10B981]',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    questions: [
      "Suggest thesis topics for my interest",
      "I'm interested in water quality",
      'Help me find JESAM papers about mangroves',
      'Recommend topics in climate adaptation',
    ],
  },
];

export default function AIChat({
  initialMessages = [],
  sessionId,
  onSendMessage,
  conversationStarters = DEFAULT_CONVERSATION_STARTERS,
  starterDisplayMode = 'cards',
  welcomeDescription = "Ask anything about your thesis — I'll cite SESAM docs and JESAM papers. Advisory only; your adviser has the final word.",
  showCapabilityBadges = true,
  inputPlaceholder = 'Ask anything about SESAM — your thesis, forms, ethics, or JESAM papers',
  tipText = 'Be specific (program, stage, study site). All replies are advisory — confirm with your adviser.',
  roleBadge,
  onEndChatClick,
}: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [stableSessionId, setStableSessionId] = useState<string>(() => {
    return sessionId || `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  });

  // Scroll the *messages container* (not the window) so the page never jumps.
  const scrollMessagesToBottom = (smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollMessagesToBottom(true);
  }, [messages.length]);

  // While streaming, keep view pinned to bottom but use 'auto' to avoid jank.
  useEffect(() => {
    const streaming = messages.some((m) => m.isStreaming);
    if (!streaming) return;
    const t = setInterval(() => scrollMessagesToBottom(false), 350);
    return () => clearInterval(t);
  }, [messages]);

  // Auto-grow textarea up to ~6 lines
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [input]);

  // Refocus the composer after a response completes so chatting feels continuous
  useEffect(() => {
    if (!loading && messages.length > 0) inputRef.current?.focus();
  }, [loading, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;
    if (trimmedInput.length > MAX_CHAT_QUERY_LENGTH) {
      setError(`Questions are limited to ${MAX_CHAT_QUERY_LENGTH} characters.`);
      return;
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    };

    const assistantMsgId = `a-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      if (onSendMessage) {
        const result = await onSendMessage(userMsg.content);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: result.content, sources: result.sources, isStreaming: false }
              : m
          )
        );
        setLoading(false);
        return;
      }

      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query: userMsg.content, sessionId: stableSessionId }),
      });

      if (!res.ok || !res.body) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error || 'Failed to get response');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line) as {
              type: string;
              text?: string;
              sources?: { title: string; type: string; url?: string }[];
              sessionId?: string;
              message?: string;
            };
            if (event.type === 'chunk' && event.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: m.content + event.text } : m
                )
              );
            } else if (event.type === 'meta') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, sources: event.sources, isStreaming: false }
                    : m
                )
              );
              if (event.sessionId) setStableSessionId(event.sessionId);
              setLoading(false);
            } else if (event.type === 'error') {
              throw new Error(event.message || 'Stream error');
            }
          } catch (parseErr) {
            // Malformed line — skip
            console.warn('[AIChat] unparseable NDJSON line:', line, parseErr);
          }
        }
      }
    } catch (err: unknown) {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? { ...m, isStreaming: false } : m))
      );
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const handleStarterClick = (question: string) => {
    setInput(question.slice(0, MAX_CHAT_QUERY_LENGTH));
  };

  function getDisplayedQuestions(starter: ConversationStarter) {
    return selectedCategory === starter.category
      ? starter.questions
      : starter.questions.slice(0, 2);
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
        {messages.length === 0 ? (
          <div className="max-w-4xl mx-auto px-5 py-6">
            {/* Compact horizontal welcome header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3 sm:flex-shrink-0">
                {/* SINAG brand icon */}
                <div className="w-11 h-11 bg-[#0C0B5D] rounded-xl flex items-center justify-center shadow-md border-2 border-blue-400 relative flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <Zap className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                {/* Title */}
                <div>
                  <h2 className="text-base font-bold text-[#0C0B5D] leading-tight">SINAG</h2>
                  <p className="text-[10px] text-gray-500 italic leading-tight">SESAM Intelligent Natural-language Advising Guide</p>
                </div>
                {/* Role badge — displayed only when a role is provided */}
                {roleBadge && (() => {
                  const RoleIcon = roleBadge.icon;
                  return (
                    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 ${roleBadge.bgColor} border ${roleBadge.borderColor} rounded-full ml-0.5 flex-shrink-0`}>
                      <RoleIcon className={`w-3.5 h-3.5 ${roleBadge.color} flex-shrink-0`} />
                      <span className={`text-[11px] font-bold ${roleBadge.color} whitespace-nowrap`}>{roleBadge.label}</span>
                    </div>
                  );
                })()}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed sm:border-l sm:border-gray-200 sm:pl-4 sm:pt-0.5">
                {welcomeDescription}
              </p>
            </div>

            {/* Capability badges (inline pill row) */}
            {showCapabilityBadges && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-medium text-blue-700">
                  <Beaker className="w-3 h-3" /> Research Design
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-medium text-indigo-700">
                  <BarChart className="w-3 h-3" /> Data Analysis
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs font-medium text-purple-700">
                  <GraduationCap className="w-3 h-3" /> Thesis Writing
                </span>
              </div>
            )}

            {/* Conversation Starters */}
            {starterDisplayMode === 'chips' ? (
              /* Chips mode — 2-column grid, one question per topic (student view) */
              <div>
                <p className="text-xs text-gray-500 mb-3">Select a topic or type your question below</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {conversationStarters.map((starter, idx) => {
                    const Icon = starter.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleStarterClick(starter.questions[0])}
                        className="w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group shadow-sm"
                      >
                        <div className={`${starter.bgColor} p-1.5 rounded-lg border ${starter.borderColor} flex-shrink-0`}>
                          <Icon className={`w-3.5 h-3.5 ${starter.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{starter.category}</p>
                          <p className="text-xs text-gray-700 group-hover:text-[#0C0B5D] leading-snug line-clamp-2">{starter.questions[0]}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#0C0B5D] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Cards mode — 2-column grid with expandable question lists (adviser / coordinator) */
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
                    Try one of these
                  </h2>
                  <p className="text-xs text-gray-500">Click to send</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {conversationStarters.map((starter, idx) => {
                    const Icon = starter.icon;
                    return (
                      <div
                        key={idx}
                        className={`bg-white rounded-xl shadow-sm border ${starter.borderColor} p-3.5 hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`${starter.bgColor} p-2 rounded-lg border ${starter.borderColor}`}>
                            <Icon className={`w-4 h-4 ${starter.color}`} />
                          </div>
                          <h3 className="font-semibold text-gray-900 text-xs leading-tight">{starter.category}</h3>
                        </div>
                        <div className="space-y-1.5">
                          {getDisplayedQuestions(starter).map((question, qIdx) => (
                            <button
                              key={qIdx}
                              type="button"
                              onClick={() => handleStarterClick(question)}
                              className="w-full text-left p-2 rounded-lg bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors text-xs text-gray-700 hover:text-blue-900 group"
                            >
                              <div className="flex items-start gap-2">
                                <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                                <span className="flex-1 leading-snug">{question}</span>
                              </div>
                            </button>
                          ))}
                          {starter.questions.length > 2 && selectedCategory !== starter.category && (
                            <button
                              type="button"
                              onClick={() => setSelectedCategory(starter.category)}
                              className="w-full text-center p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-all border border-blue-100"
                            >
                              <span className="flex items-center justify-center gap-1">
                                <Plus className="w-3 h-3" />
                                {starter.questions.length - 2} more
                              </span>
                            </button>
                          )}
                          {selectedCategory === starter.category && starter.questions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => setSelectedCategory(null)}
                              className="w-full text-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-all"
                            >
                              <span className="flex items-center justify-center gap-1">
                                <X className="w-3 h-3" />
                                Show less
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-800 flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
              <span><strong>Tip:</strong> {tipText}</span>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-5">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} msg={msg} />
            ))}

            {loading && !messages.some((m) => m.isStreaming) && (
              <div className="flex justify-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0C0B5D] flex items-center justify-center flex-shrink-0 shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3 flex items-center gap-2 shadow-sm">
                  <div className="w-2 h-2 bg-[#0C0B5D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#0C0B5D] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#0C0B5D] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-gray-500 ml-1 italic">SINAG is thinking…</span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {messages.length === 0 && <div ref={bottomRef} />}
      </div>

      {/* End Chat strip — visible only when conversation is active */}
      {onEndChatClick && messages.some((m) => m.role === 'user') && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-3 py-1.5 sm:px-4 flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={() => onEndChatClick(stableSessionId)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-lg hover:bg-red-50 transition-all"
          >
            <X className="w-3 h-3" />
            End Chat
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 px-3 py-3 sm:px-4 sm:py-3 flex-shrink-0"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 rounded-2xl border border-gray-300 bg-white pl-4 pr-2 py-1.5 shadow-sm focus-within:border-[#0C0B5D] focus-within:ring-2 focus-within:ring-[#0C0B5D]/20 transition">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_CHAT_QUERY_LENGTH))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
              placeholder={loading ? 'SINAG is responding…' : inputPlaceholder}
              rows={1}
              maxLength={MAX_CHAT_QUERY_LENGTH}
              className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none max-h-40 leading-6 py-1.5"
              disabled={loading}
              style={{ minHeight: '24px' }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0C0B5D] text-white hover:bg-[#0a0949] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm flex-shrink-0"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-gray-400">
            <span>SINAG can make mistakes. Verify important information with your adviser.</span>
            <span className={input.length >= MAX_CHAT_QUERY_LENGTH ? 'font-semibold text-red-500' : ''}>
              {input.length}/{MAX_CHAT_QUERY_LENGTH}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── ChatBubble ─────────────────────────────────────────────────────────────

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  // Strip the "## References" section out of the markdown body so it can be
  // rendered as a styled card below instead of plain markdown inside the bubble.
  const { body: rawBody, parsedRefs } = parseAssistantContent(msg.content);

  // Merge cited refs with retrieved guidance docs, then filter to only
  // citations that actually appear in the body and renumber for clarity.
  const allRefs = mergeRefsWithSources(parsedRefs, msg.sources);
  const citationResult = processCitations(rawBody, allRefs);
  const body = citationResult.body;
  const mergedRefs = citationResult.refs;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[85%] rounded-2xl bg-[#0C0B5D] text-white px-4 py-3 text-sm leading-relaxed shadow-sm">
          <div className="whitespace-pre-wrap">{msg.content}</div>
          <p className="mt-1.5 text-[10px] text-blue-200/80">
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0">
          <Users className="w-4 h-4 text-[#0C0B5D]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-[#0C0B5D] flex items-center justify-center flex-shrink-0 shadow-md">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="max-w-[88%] flex-1 min-w-0">
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          {/* Header strip */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#0C0B5D]">SINAG AI</span>
              {msg.isStreaming && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-blue-600 font-semibold">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                  Thinking…
                </span>
              )}
              {!msg.isStreaming && mergedRefs.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">
                  <BookMarked className="w-2.5 h-2.5" />
                  {mergedRefs.length} sources
                </span>
              )}
            </div>
            {!msg.isStreaming && msg.content.length > 0 && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[10px] text-gray-500 hover:text-[#0C0B5D] transition-colors px-2 py-1 rounded-md hover:bg-gray-50"
                title="Copy response"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            )}
          </div>

          {/* Body */}
          <div className="px-4 py-3 text-sm leading-relaxed text-gray-800">
            {msg.isStreaming && body.length === 0 ? (
              <ThinkingIndicator />
            ) : (
              <>
                <MarkdownMessage content={body} />
                {msg.isStreaming && (
                  <span className="inline-block w-1.5 h-4 bg-[#0C0B5D] animate-pulse ml-0.5 align-middle" />
                )}
              </>
            )}
          </div>

          {/* References (parsed from markdown body + retrieved guidance docs) */}
          {!msg.isStreaming && mergedRefs.length > 0 && (
            <div className="px-4 pb-3">
              <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/40 border-2 border-amber-300 shadow-sm p-3.5">
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-amber-200">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-amber-600 flex items-center justify-center shadow-sm">
                      <BookMarked className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      References
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-700 bg-white border border-amber-300 px-2 py-0.5 rounded-full">
                    {mergedRefs.length} cited
                  </span>
                </div>
                <ol className="space-y-1.5">
                  {mergedRefs.map((ref, i) => (
                    <li key={i} className="flex gap-2 text-xs text-gray-800 leading-relaxed">
                      <span className="font-bold text-amber-800 flex-shrink-0 min-w-[1.5rem]">[{i + 1}]</span>
                      {ref.url ? (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-start gap-1 text-[#0C0B5D] hover:text-amber-900 hover:underline"
                        >
                          <span>{ref.text}</span>
                          <ExternalLink className="w-3 h-3 mt-0.5 opacity-60 flex-shrink-0" />
                        </a>
                      ) : (
                        <span>{ref.text}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="px-4 pb-2 -mt-1">
            <p className="text-[10px] text-gray-400">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Splits an assistant markdown response into the main body and a list of
 * reference strings, by detecting a trailing "## References" section
 * with `[1] …`, `[2] …` lines.
 *
 * Also normalizes legacy escaped sequences (literal `\n`, `\t`) that may have
 * been persisted into the DB by older template fallbacks.
 */
function parseAssistantContent(content: string): { body: string; parsedRefs: string[] } {
  const normalized = sanitizeLegacyEscapes(content);
  const refHeadingMatch = normalized.match(/\n#{1,3}\s*references\s*\n/i);
  if (!refHeadingMatch || refHeadingMatch.index === undefined) {
    return { body: normalized, parsedRefs: [] };
  }
  const body = normalized.slice(0, refHeadingMatch.index).trimEnd();
  const refSection = normalized.slice(refHeadingMatch.index + refHeadingMatch[0].length);
  const parsedRefs: string[] = [];
  const lines = refSection.split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    // Accept "[1] text", "1. text", or "- text"
    const m =
      line.match(/^\[\d+\]\s*(.+)$/) ||
      line.match(/^\d+\.\s*(.+)$/) ||
      line.match(/^[-*]\s*(.+)$/);
    if (m) parsedRefs.push(m[1].trim());
  }
  return { body, parsedRefs };
}

/**
 * Convert literal escape sequences like the string "\\n\\n" or "\\t" that
 * appear in old persisted assistant responses (from a buggy template
 * fallback) into real whitespace so markdown renders correctly.
 */
function sanitizeLegacyEscapes(s: string): string {
  if (!s) return s;
  // Only rewrite if the response actually contains the literal sequence.
  if (!/\\n|\\t|\\"/.test(s)) return s;
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '  ')
    .replace(/\\"/g, '"');
}

interface MergedRef {
  text: string;
  url?: string;
}

/**
 * Merge model-cited references with the retrieved guidance documents
 * (server `meta.sources`). Dedup by lowercased title prefix so the same
 * document is not listed twice.
 */
function mergeRefsWithSources(
  parsedRefs: string[],
  sources?: { title: string; type: string; url?: string }[]
): MergedRef[] {
  const out: MergedRef[] = parsedRefs.map((text) => {
    const m = text.match(/(https?:\/\/\S+)/);
    return { text, url: m?.[1] };
  });
  const seen = new Set(
    out.map((r) => r.text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 60))
  );
  for (const s of sources ?? []) {
    if (!s?.title) continue;
    const key = s.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 60);
    if (seen.has(key)) continue;
    seen.add(key);
    const typeLabel = s.type ? ` — ${s.type}` : '';
    out.push({ text: `${formatTitle(s.title)}${typeLabel}`, url: s.url });
  }
  return out;
}

/** Friendly multi-stage thinking indicator shown before any text streams in. */
function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-[#0C0B5D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-[#0C0B5D] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-[#0C0B5D] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="italic">Thinking — searching SESAM library &amp; JESAM papers…</span>
    </div>
  );
}

/**
 * Post-process the markdown body so that:
 *  - `[synthesis]` markers are removed (they're noise to readers).
 *  - Only references actually cited via `[N]` in the body are kept.
 *  - Citations are renumbered sequentially based on first appearance, then
 *    rendered as small superscript chips that link to the References card.
 * Returns the rewritten body and the filtered+renumbered references list.
 */
function processCitations(
  body: string,
  allRefs: MergedRef[]
): { body: string; refs: MergedRef[] } {
  if (!body) return { body, refs: [] };

  // Drop "[synthesis]" / "[Synthesis]" markers entirely (with optional preceding space).
  let cleaned = body.replace(/\s*\[synthesis\]/gi, '');

  // Find which numeric citations actually appear in the body, in order.
  const usedOrder: number[] = [];
  const seen = new Set<number>();
  for (const m of cleaned.matchAll(/\[(\d+)\]/g)) {
    const n = Number(m[1]);
    if (!Number.isFinite(n) || n < 1 || n > allRefs.length) continue;
    if (!seen.has(n)) {
      seen.add(n);
      usedOrder.push(n);
    }
  }

  if (usedOrder.length === 0) {
    // Nothing cited inline — hide the references card entirely. We only show
    // sources the model actually used, never "related" suggestions.
    return { body: cleaned, refs: [] };
  }

  // Build old→new index mapping and the filtered refs list.
  const oldToNew = new Map<number, number>();
  const refs: MergedRef[] = [];
  usedOrder.forEach((oldIdx, i) => {
    oldToNew.set(oldIdx, i + 1);
    refs.push(allRefs[oldIdx - 1]);
  });

  // Rewrite each `[N]` in the body into a small superscript chip with the new number.
  cleaned = cleaned.replace(/\[(\d+)\]/g, (full, raw) => {
    const n = Number(raw);
    const mapped = oldToNew.get(n);
    if (!mapped) return ''; // drop uncited or out-of-range markers
    return `<sup class="sinag-cite">${mapped}</sup>`;
  });

  return { body: cleaned, refs };
}

/** Pretty-print noisy DB titles like "Decadal Monitoring Of Mangal..." */
function formatTitle(raw: string): string {
  if (!raw) return 'Untitled document';
  // Trim trailing token cut-offs (e.g. "Twentie") and add ellipsis
  let t = raw.trim();
  if (t.length > 110) t = t.slice(0, 110).trimEnd() + '…';
  return t;
}

/** Map a guidance category/source-type to a colour scheme for the badge. */
function getTypeColor(type?: string): { bg: string; text: string; border: string } {
  const t = (type || '').toLowerCase();
  if (t.includes('paper') || t.includes('jesam') || t.includes('journal')) {
    return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };
  }
  if (t.includes('policy') || t.includes('rule')) {
    return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
  }
  if (t.includes('checklist') || t.includes('template')) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  }
  // default: guideline / handbook / brochure
  return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
}
