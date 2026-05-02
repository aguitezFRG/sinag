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
  const bottomRef = useRef<HTMLDivElement>(null);
  const [stableSessionId, setStableSessionId] = useState<string>(() => {
    return sessionId || `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      : starter.questions.slice(0, 3);
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="max-w-6xl mx-auto px-6 py-10">
            {/* Welcome Header */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-[#0C0B5D] rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-5 border-4 border-blue-400 relative">
                <Sparkles className="w-10 h-10 text-white" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="mb-3">
                <h2 className="text-3xl font-bold text-[#0C0B5D] mb-1">SINAG</h2>
                <p className="text-sm text-gray-600 italic font-medium">A SESAM Intelligent Natural-language Advising Guide</p>
              </div>
              <p className="text-base text-gray-700 max-w-2xl mx-auto mb-8 leading-relaxed">
                I can suggest directions, surface relevant institutional documents, and help you think through your research — but all guidance here is advisory. Your faculty adviser has the final word.
              </p>

              {/* Capabilities */}
              <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Beaker className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">Research Design</h3>
                  <p className="text-xs text-gray-600">Methodology, sampling, instruments, analysis</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="w-10 h-10 bg-[#0C0B5D] rounded-xl flex items-center justify-center mx-auto mb-2">
                    <BarChart className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">Data Analysis</h3>
                  <p className="text-xs text-gray-600">Statistical tests, visualization, interpretation</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">Thesis Writing</h3>
                  <p className="text-xs text-gray-600">Structure, formatting, academic style</p>
                </div>
              </div>
            </div>

            {/* Conversation Starters */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  What can I help you with today?
                </h2>
                <p className="text-sm text-gray-500">Click any question to start</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {conversationStarters.map((starter, idx) => {
                  const Icon = starter.icon;
                  return (
                    <div
                      key={idx}
                      className={`bg-white rounded-2xl shadow-md border-2 ${starter.borderColor} p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-200`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`${starter.bgColor} p-2.5 rounded-xl shadow-sm border-2 ${starter.borderColor}`}>
                          <Icon className={`w-5 h-5 ${starter.color}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{starter.category}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{starter.questions.length} prompts</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {getDisplayedQuestions(starter).map((question, qIdx) => (
                          <button
                            key={qIdx}
                            type="button"
                            onClick={() => handleStarterClick(question)}
                            className="w-full text-left p-3 rounded-xl bg-gray-100 hover:bg-blue-100 hover:border-blue-300 border-2 border-transparent transition-all text-sm text-gray-700 hover:text-blue-900 group shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform" />
                              <span className="flex-1 font-medium">{question}</span>
                            </div>
                          </button>
                        ))}
                        {starter.questions.length > 3 && selectedCategory !== starter.category && (
                          <button
                            type="button"
                            onClick={() => setSelectedCategory(starter.category)}
                            className="w-full text-center p-3 rounded-xl bg-blue-100 hover:bg-blue-200 text-xs font-bold text-gray-700 hover:text-gray-900 transition-all shadow-sm"
                          >
                            <span className="flex items-center justify-center gap-1">
                              <Plus className="w-3 h-3" />
                              Show {starter.questions.length - 3} more prompts
                            </span>
                          </button>
                        )}
                        {selectedCategory === starter.category && starter.questions.length > 3 && (
                          <button
                            type="button"
                            onClick={() => setSelectedCategory(null)}
                            className="w-full text-center p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 hover:text-gray-900 transition-all"
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
            <div className="mt-8 bg-indigo-50 rounded-xl p-5 border-2 border-indigo-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                Tips for Best Results
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                  <span>Be specific about your research topic and what stage you&apos;re at</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                  <span>Mention your degree program (MS or PhD) for tailored guidance</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                  <span>Ask follow-up questions to explore topics in depth</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                  <span>Ask follow-up questions to go deeper on any topic</span>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
                Advisory: All responses are suggestions only. Confirm with your faculty adviser before acting.
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-800 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <>
                      <MarkdownMessage content={msg.content} />
                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-4 bg-gray-400 animate-pulse ml-0.5 align-middle opacity-70" />
                      )}
                    </>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 border-t border-gray-200/50 pt-2">
                      <p className="text-xs font-medium opacity-70">Referenced guidance:</p>
                      <ul className="mt-1 space-y-1">
                        {msg.sources.map((s, i) => (
                          <li key={i} className="text-xs opacity-70">
                            {s.url ? (
                              <a
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:opacity-100 transition-opacity"
                              >
                                {s.title}
                              </a>
                            ) : (
                              <span>{s.title}</span>
                            )}
                            <span className="ml-1 opacity-60">({s.type})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className={`mt-1 text-[10px] ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {loading && !messages.some((m) => m.isStreaming) && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-gray-100 px-4 py-3 flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {messages.length === 0 && <div ref={bottomRef} />}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center rounded-lg bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
