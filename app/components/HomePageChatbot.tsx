'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BookMarked,
  Check,
  Copy,
  ExternalLink,
  Lightbulb,
  Maximize2,
  MessageCircle,
  Minimize2,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { getHomepageChatResponse } from '@/lib/homepage-chat-service';
import MarkdownMessage from './MarkdownMessage';

interface ChatSource {
  title: string;
  type: string;
  url: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isAdvising?: boolean;
  sources?: ChatSource[];
  disclaimer?: string;
}

interface ChatApiResponse {
  response?: string;
  intent?: string;
  sessionId?: string;
  sources?: ChatSource[];
  advisoryDisclaimer?: string;
  error?: string;
}

interface HomePageChatbotProps {
  onOpenLoginModal?: () => void;
}

interface MergedRef {
  text: string;
  url?: string;
}

const SESSION_STORAGE_KEY = 'sinag-homepage-chat-session';

function createSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `homepage-${Date.now()}`;
}

function formatTitle(raw: string): string {
  if (!raw) return 'Untitled document';
  let title = raw.trim();
  if (title.length > 110) title = `${title.slice(0, 110).trimEnd()}…`;
  return title;
}

function sanitizeLegacyEscapes(s: string): string {
  if (!s) return s;
  if (!/\\n|\\t|\\"/.test(s)) return s;
  return s.replace(/\\n/g, '\n').replace(/\\t/g, '  ').replace(/\\"/g, '"');
}

function parseAssistantContent(content: string): { body: string; parsedRefs: string[] } {
  const normalized = sanitizeLegacyEscapes(content);
  const refHeadingMatch = normalized.match(/\n#{1,3}\s*references\s*\n/i);
  if (!refHeadingMatch || refHeadingMatch.index === undefined) {
    return { body: normalized, parsedRefs: [] };
  }

  const body = normalized.slice(0, refHeadingMatch.index).trimEnd();
  const refSection = normalized.slice(refHeadingMatch.index + refHeadingMatch[0].length);
  const parsedRefs: string[] = [];

  for (const raw of refSection.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const match =
      line.match(/^\[\d+\]\s*(.+)$/) || line.match(/^\d+\.\s*(.+)$/) || line.match(/^[-*]\s*(.+)$/);
    if (match) parsedRefs.push(match[1].trim());
  }

  return { body, parsedRefs };
}

function mergeRefsWithSources(parsedRefs: string[], sources?: ChatSource[]): MergedRef[] {
  const out: MergedRef[] = parsedRefs.map((text) => {
    const match = text.match(/(https?:\/\/\S+)/);
    return { text, url: match?.[1] };
  });

  const seen = new Set(
    out.map((ref) => ref.text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 60))
  );

  for (const source of sources ?? []) {
    if (!source?.title) continue;
    const key = source.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 60);
    if (seen.has(key)) continue;
    seen.add(key);
    const typeLabel = source.type ? ` — ${source.type}` : '';
    out.push({ text: `${formatTitle(source.title)}${typeLabel}`, url: source.url });
  }

  return out;
}

export default function HomePageChatbot({ onOpenLoginModal }: HomePageChatbotProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const existingSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (existingSession) {
        setSessionId(existingSession);
        return;
      }

      const nextSession = createSessionId();
      window.localStorage.setItem(SESSION_STORAGE_KEY, nextSession);
      setSessionId(nextSession);
    } catch {
      setSessionId(createSessionId());
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages.length]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, isMinimized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const fallback = getHomepageChatResponse(userMsg.content);

    try {
      const res = await fetch('/api/homepage-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMsg.content,
          sessionId: sessionId ?? undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as ChatApiResponse;
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.response?.trim() || fallback.content,
        timestamp: new Date(),
        isAdvising: (data.intent ?? 'general') !== 'general' || fallback.isAdvising,
        sources: data.sources,
        disclaimer: data.advisoryDisclaimer,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
      }
    } catch {
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: fallback.content,
        timestamp: new Date(),
        isAdvising: fallback.isAdvising,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const starterQuestions = [
    'What are SESAM programs?',
    'How do I start my thesis topic?',
    'What are the admissions requirements?',
    'How do I prepare for my defense?',
  ];

  const handleStarterClick = (question: string) => {
    setInput(question);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  if (!mounted) {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-[#0C0B5D] text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl"
        title="Ask SINAG"
        aria-label="Open chat"
      >
        <MessageCircle className="h-7 w-7" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex h-[640px] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 sm:max-w-lg">
      <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-[#0C0B5D] to-[#1a1a7e] px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold">SINAG</span>
            <span className="text-[10px] opacity-85">Ask anything</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized((prev) => !prev)}
            className="rounded-lg p-1.5 transition hover:bg-white/20"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 transition hover:bg-white/20"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-white to-gray-50 p-4"
          >
            {messages.length === 0 ? (
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="mb-4 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0C0B5D]">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Welcome to SINAG Homepage Chat
                    </h3>
                    <p className="mt-1 text-xs text-gray-600">
                      Ask about SESAM programs, thesis tips, or admissions
                    </p>
                  </div>

                  <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <p className="leading-relaxed text-[11px] text-blue-900">
                      Tip: For personalized guidance on your research,{' '}
                      <button
                        onClick={onOpenLoginModal}
                        className="cursor-pointer border-none bg-none p-0 font-semibold text-[#0C0B5D] hover:underline"
                      >
                        log in to the full SINAG adviser
                      </button>
                      .
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase text-gray-600">
                    Suggested questions
                  </p>
                  {starterQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleStarterClick(q)}
                      className="w-full rounded-lg border border-gray-200 bg-white p-2 text-left text-xs text-gray-700 transition hover:border-[#0C0B5D] hover:bg-blue-50"
                    >
                      <div className="flex items-start gap-2">
                        <Lightbulb className="mt-0.5 h-3 w-3 flex-shrink-0 text-yellow-500" />
                        <span>{q}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} msg={msg} onOpenLoginModal={onOpenLoginModal} />
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                      <div className="flex gap-1">
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-[#0C0B5D]"
                          style={{ animationDelay: '0ms' }}
                        />
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-[#0C0B5D]"
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-[#0C0B5D]"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex-shrink-0 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 px-3 py-3 sm:px-4 sm:py-3"
          >
            <div className="mx-auto max-w-5xl">
              <div className="flex items-center gap-2 rounded-2xl border border-gray-300 bg-white pl-4 pr-2 py-1.5 shadow-sm transition focus-within:border-[#0C0B5D] focus-within:ring-2 focus-within:ring-[#0C0B5D]/20">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSubmit(e as unknown as React.FormEvent);
                    }
                  }}
                  placeholder={
                    loading
                      ? 'SINAG is responding…'
                      : 'Ask anything about SESAM — your thesis, forms, ethics, or JESAM papers'
                  }
                  rows={1}
                  className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-sm leading-6 text-gray-800 outline-none placeholder:text-gray-400"
                  disabled={loading}
                  style={{ minHeight: '24px' }}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#0C0B5D] text-white shadow-sm transition hover:bg-[#0a0949] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-gray-400">
                SINAG can make mistakes. Verify important information with your adviser.
              </p>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

function ChatBubble({
  msg,
  onOpenLoginModal,
}: {
  msg: Message;
  onOpenLoginModal?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';
  const { body, parsedRefs } = parseAssistantContent(msg.content);
  const mergedRefs = mergeRefsWithSources(parsedRefs, msg.sources);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[85%] rounded-2xl bg-[#0C0B5D] px-4 py-3 text-sm leading-relaxed text-white shadow-sm">
          <div className="whitespace-pre-wrap">{msg.content}</div>
          <p className="mt-1.5 text-[10px] text-blue-200/80">
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-100">
          <MessageCircle className="h-4 w-4 text-[#0C0B5D]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#0C0B5D] shadow-md">
        <Sparkles className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0 flex-1 max-w-[88%]">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#0C0B5D]">SINAG AI</span>
              {msg.isAdvising && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
                  Advisory only
                </span>
              )}
              {mergedRefs.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                  <BookMarked className="h-2.5 w-2.5" />
                  {mergedRefs.length} sources
                </span>
              )}
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#0C0B5D]"
              title="Copy response"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
          </div>

          <div className="px-4 py-3 text-sm leading-relaxed text-gray-800">
            <MarkdownMessage content={body || msg.content} />
          </div>

          {mergedRefs.length > 0 && (
            <div className="px-4 pb-3">
              <div className="rounded-xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/40 p-3.5 shadow-sm">
                <div className="mb-2.5 flex items-center justify-between border-b border-amber-200 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-600 shadow-sm">
                      <BookMarked className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      References
                    </span>
                  </div>
                  <span className="rounded-full border border-amber-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    {mergedRefs.length} cited
                  </span>
                </div>

                <ol className="space-y-1.5">
                  {mergedRefs.map((ref, i) => (
                    <li key={`${ref.text}-${i}`} className="flex gap-2 text-xs leading-relaxed text-gray-800">
                      <span className="min-w-[1.5rem] flex-shrink-0 font-bold text-amber-800">
                        [{i + 1}]
                      </span>
                      {ref.url ? (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-start gap-1 text-[#0C0B5D] hover:underline"
                        >
                          <span>{ref.text}</span>
                          <ExternalLink className="mt-0.5 h-3 w-3 flex-shrink-0 opacity-60" />
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

          <div className="px-4 pb-2 -mt-1">
            <p className="text-[10px] text-gray-400">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {msg.isAdvising && onOpenLoginModal && (
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
              <button
                onClick={onOpenLoginModal}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                Log in for deeper guidance
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
