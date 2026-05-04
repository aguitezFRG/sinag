'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
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

const SESSION_STORAGE_KEY = 'sinag-homepage-chat-session';

function createSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `homepage-${Date.now()}`;
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
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#0C0B5D] shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl animate-pulse"
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
            className="flex-shrink-0 border-t border-gray-200 bg-white px-3 py-2.5"
          >
            <div className="flex items-end gap-2">
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
                placeholder="Ask about SESAM..."
                rows={1}
                className="max-h-28 flex-1 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-[#0C0B5D] focus:ring-2 focus:ring-[#0C0B5D]/20"
                disabled={loading}
                style={{ minHeight: '32px' }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#0C0B5D] text-white transition hover:bg-[#0a0949] disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1 text-center text-[9px] text-gray-400">
              Advisory only - always confirm with your adviser
            </p>
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
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-[#0C0B5D] px-3 py-2 text-xs leading-relaxed text-white">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="min-w-0 flex-1 max-w-[85%]">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="px-3 py-2.5 text-xs leading-relaxed text-gray-800">
            <MarkdownMessage content={msg.content} />
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-gray-100 bg-gray-50 px-3 py-1.5">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              {msg.isAdvising && (
                <button
                  onClick={onOpenLoginModal}
                  className="inline-flex cursor-pointer items-center gap-1 rounded border-none bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  Tip: Log in for deep guidance
                </button>
              )}
              {msg.sources && msg.sources.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                  Grounded in {msg.sources.length} source{msg.sources.length === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <button
              onClick={handleCopy}
              className="ml-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] text-gray-500 transition hover:bg-white hover:text-gray-700"
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

          {msg.sources && msg.sources.length > 0 && (
            <div className="border-t border-gray-100 bg-white px-3 py-2">
              <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                Sources
              </p>
              <ul className="space-y-1">
                {msg.sources.map((source, index) => (
                  <li key={`${source.title}-${index}`} className="text-[10px] text-gray-600">
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="font-medium text-[#0C0B5D] hover:underline"
                      >
                        {source.title}
                      </a>
                    ) : (
                      <span className="font-medium text-gray-800">{source.title}</span>
                    )}
                    {source.type ? <span className="text-gray-400"> · {source.type}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
