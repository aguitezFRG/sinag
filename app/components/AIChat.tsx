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

interface ConversationStarter {
  category: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  questions: string[];
}

interface AIChatProps {
  initialMessages?: ChatMessage[];
  sessionId?: string;
  onSendMessage?: (msg: string) => Promise<{ content: string; sources?: { title: string; type: string; url?: string }[] }>;
  conversationStarters?: ConversationStarter[];
}

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
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: input.trim(),
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
    setInput(question);
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
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Welcome Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#0C0B5D] rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4 border-4 border-blue-400 relative">
                <Sparkles className="w-8 h-8 text-white" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-[#0C0B5D] mb-0.5">SINAG</h2>
                <p className="text-xs text-gray-600 italic font-medium">A SESAM Intelligent Natural-language Advising Guide</p>
              </div>
              <p className="text-sm text-gray-700 max-w-xl mx-auto mb-6 leading-relaxed">
                Ask anything about your thesis — I&apos;ll cite SESAM docs and JESAM papers. Advisory only; your adviser has the final word.
              </p>

              {/* Capabilities */}
              <div className="hidden md:grid grid-cols-3 gap-3 max-w-2xl mx-auto">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                    <Beaker className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-xs">Research Design</h3>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="w-8 h-8 bg-[#0C0B5D] rounded-lg flex items-center justify-center mx-auto mb-1.5">
                    <BarChart className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-xs">Data Analysis</h3>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-xs">Thesis Writing</h3>
                </div>
              </div>
            </div>

            {/* Conversation Starters */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  Try one of these
                </h2>
                <p className="text-xs text-gray-500">Click to send</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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

            {/* Tips */}
            <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-800 flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
              <span><strong>Tip:</strong> Be specific (program, stage, study site). All replies are advisory — confirm with your adviser.</span>
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

      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 px-3 py-3 sm:px-4 sm:py-3 flex-shrink-0"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 rounded-2xl border border-gray-300 bg-white pl-4 pr-2 py-1.5 shadow-sm focus-within:border-[#0C0B5D] focus-within:ring-2 focus-within:ring-[#0C0B5D]/20 transition">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
              placeholder={loading ? 'SINAG is responding…' : 'Ask anything about SESAM — your thesis, forms, ethics, or JESAM papers'}
              rows={1}
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
          <p className="mt-1.5 text-[10px] text-gray-400 text-center">
            SINAG can make mistakes. Verify important information with your adviser.
          </p>
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
