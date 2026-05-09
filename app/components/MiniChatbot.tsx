'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Send,
  Sparkles,
  X,
  RotateCcw,
  GraduationCap,
  BookOpen,
  Calendar,
  Maximize2,
  Minimize2,
  BookMarked,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import MarkdownMessage from './MarkdownMessage';
import {
  parseAssistantContent,
  mergeRefsWithSources,
  processCitations,
  type RefSource,
} from '@/app/utils/chat-references';

interface MiniMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  timestamp: number;
  sources?: RefSource[];
}

const SESSION_KEY = 'sinag_mini_session_guest';
const ENDPOINT = '/api/public/queries';

const STARTERS = [
  { icon: Sparkles, text: 'What is SINAG?' },
  { icon: GraduationCap, text: 'How do I apply to SESAM?' },
  { icon: BookOpen, text: 'Tell me about MS Environmental Science' },
  { icon: Calendar, text: 'When is application season?' },
];

function makeId() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function MiniChatbot() {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [introAcknowledged, setIntroAcknowledged] = useState(false);
  const [messages, setMessages] = useState<MiniMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      setSessionId(saved || null);
    } catch {
      /* ignore */
    }
  }, []);

  // Persist session
  useEffect(() => {
    if (!sessionId) return;
    try {
      localStorage.setItem(SESSION_KEY, sessionId);
    } catch {
      /* ignore */
    }
  }, [sessionId]);

  // Auto-scroll on new content
  useEffect(() => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [messages, loading, introAcknowledged]);

  // Focus input once intro is acknowledged
  useEffect(() => {
    if (open && introAcknowledged) {
      const t = setTimeout(() => inputRef.current?.focus(), 320);
      return () => clearTimeout(t);
    }
  }, [open, introAcknowledged]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  const showStarters = useMemo(
    () => messages.length === 0 && !loading,
    [messages.length, loading]
  );

  const showGuestIntro = !introAcknowledged && messages.length === 0;

  // Guest-only, homepage-only.
  if (authLoading || user) return null;
  if (pathname !== '/') return null;

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading || authLoading) return;

    setInput('');
    setError(null);

    const userMsg: MiniMessage = {
      id: makeId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    const assistantId = makeId();
    const assistantMsg: MiniMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setLoading(true);

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query: text, sessionId: sessionId ?? undefined }),
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
              sessionId?: string;
              message?: string;
              sources?: RefSource[];
            };
            if (event.type === 'chunk' && event.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: m.content + event.text } : m
                )
              );
            } else if (event.type === 'meta') {
              if (event.sessionId) setSessionId(event.sessionId);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, isStreaming: false, sources: event.sources ?? [] }
                    : m
                )
              );
            } else if (event.type === 'error') {
              throw new Error(event.message || 'Stream error');
            }
          } catch {
            /* skip malformed line */
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                isStreaming: false,
                content: m.content || `Sorry — ${msg}`,
              }
            : m
        )
      );
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setError(null);
    setIntroAcknowledged(false);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    inputRef.current?.focus();
  };

  return (
    <>
      {/* ── Toggle button (closed state) ─────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open SINAG mini assistant"
        className={`fixed bottom-5 right-5 z-50 group flex items-center justify-center w-14 h-14 rounded-full bg-[#0C0B5D] text-white shadow-lg shadow-[#0C0B5D]/30 hover:shadow-xl hover:shadow-[#0C0B5D]/40 hover:scale-105 active:scale-95 transition-all duration-200 ${open ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100 sinag-bot-pulse'}`}
      >
        <Sparkles className="w-6 h-6 transition-transform group-hover:rotate-[-8deg] group-hover:scale-110" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
      </button>

      {/* ── Backdrop (only when expanded) ───────────────────────────── */}
      <div
        onClick={() => setExpanded(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-400 ease-out motion-reduce:transition-none ${
          open && expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* ── Positioning wrapper ───────────────────────────────────────
          Uses flex alignment to position the panel:
          - default mode: anchored to bottom-right via items-end / justify-end
          - expanded mode: vertically + horizontally centered via items-center /
            justify-center, which guarantees equal top/bottom and left/right
            margins regardless of viewport size (no fragile calc() math).      */}
      <div
        className={`fixed inset-0 z-50 pointer-events-none flex p-5 transition-[padding,align-items,justify-content] duration-300 ${
          expanded ? 'items-center justify-center' : 'items-end justify-end'
        }`}
      >
        <div
          className={`pointer-events-auto transition-all duration-400 ease-out motion-reduce:transition-none will-change-[width,height,transform,opacity] ${
            expanded ? 'origin-center' : 'origin-bottom-right'
          } ${open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-3 pointer-events-none'}`}
          style={{
            width: expanded
              ? 'min(1024px, calc(100vw - 2rem))'
              : 'min(400px, calc(100vw - 1.5rem))',
            height: expanded
              ? 'min(640px, calc(100vh - 6rem))'
              : 'min(620px, calc(100vh - 6rem))',
          }}
          role="dialog"
          aria-label="SINAG mini assistant"
          aria-modal={expanded}
          aria-hidden={!open}
        >
        <div className="flex flex-col w-full h-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">

          {/* Branded header */}
          <div className="relative bg-gradient-to-br from-[#0C0B5D] via-[#13127a] to-[#1a1a8a] px-4 py-4 text-white">
            <div className="flex items-start gap-3">
              <div className="flex flex-shrink-0 items-center gap-2">
                {/* SESAM (institutional anchor) — colored seal on white */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow ring-1 ring-white/20">
                  <Image
                    src="/images/sesam-logo.png"
                    alt="SESAM seal"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                {/* SINAG (primary application) — sparkle mark on navy with subtle ring */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0a0a4a] ring-2 ring-white/30 shadow">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-white/70 leading-tight">
                  A SESAM Initiative · UPLB
                </p>
                <h3 className="text-base font-bold leading-tight mt-0.5">SINAG Assistant</h3>
                <p className="text-[10.5px] text-white/70 leading-tight mt-0.5 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Guest mode · Ask freely
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleNewChat}
                  title="New conversation"
                  aria-label="Start new conversation"
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setExpanded((v) => !v)}
                  title={expanded ? 'Restore size' : 'Expand panel'}
                  aria-label={expanded ? 'Restore size' : 'Expand panel'}
                  aria-pressed={expanded}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    // Reset to default size so the next open starts in the corner.
                    setTimeout(() => setExpanded(false), 400);
                  }}
                  title="Close"
                  aria-label="Close assistant"
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div ref={scrollerRef} className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/40 to-white">
            {/* Guest intro card */}
            {showGuestIntro ? (
              <div className="p-4 sinag-bot-fadein">
                <div className="rounded-2xl border border-[#0C0B5D]/10 bg-gradient-to-br from-[#0C0B5D]/[0.04] to-amber-50/40 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-[9.5px] font-semibold uppercase tracking-wider text-amber-800">
                      <Sparkles className="w-2.5 h-2.5" /> Welcome
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#0C0B5D] leading-snug">
                    Hi there! I&apos;m SINAG.
                  </h4>
                  <p className="text-[12px] text-gray-700 mt-1.5 leading-relaxed">
                    SINAG is the <strong>SESAM Intelligent Natural-language Advising Guide</strong> —
                    an AI companion for graduate thesis and dissertation advising at UPLB&apos;s
                    School of Environmental Science and Management.
                  </p>

                  <div className="mt-3 grid grid-cols-1 gap-1.5">
                    <div className="flex items-start gap-2 text-[11.5px] text-gray-700">
                      <span className="mt-0.5 inline-block w-1.5 h-1.5 rounded-full bg-[#0C0B5D] flex-shrink-0" />
                      <span>Ask about <strong>SESAM programs</strong>, admissions, and timelines.</span>
                    </div>
                  </div>

                  <p className="mt-3 text-[10.5px] text-gray-500 italic leading-relaxed">
                    You&apos;re chatting as a guest — sign in for full access to advising
                    workflows, document submission, and personalized history.
                  </p>

                  <button
                    onClick={() => setIntroAcknowledged(true)}
                    className="mt-3 w-full py-2 text-[12px] font-semibold text-white bg-[#0C0B5D] hover:bg-[#0a0949] rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Start chatting
                  </button>
                </div>
              </div>
            ) : (
              <div className={`px-3 py-4 space-y-3 transition-all duration-400 ${expanded ? 'max-w-3xl mx-auto w-full sm:px-6' : ''}`}>
                {showStarters && (
                  <div className="sinag-bot-fadein">
                    <div className={`grid gap-2 px-1 ${expanded ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {STARTERS.map((s, i) => {
                        const Icon = s.icon;
                        return (
                          <button
                            key={s.text}
                            onClick={() => handleSend(s.text)}
                            style={{ animation: `sinagBotSlideUp 320ms ease-out ${80 + i * 60}ms both` }}
                            className="group text-left text-xs text-gray-700 bg-white hover:bg-[#0C0B5D] hover:text-white border border-gray-200 hover:border-[#0C0B5D] rounded-xl px-3 py-2.5 transition-colors shadow-sm flex items-center gap-2"
                          >
                            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#0C0B5D]/5 group-hover:bg-white/15 transition-colors">
                              <Icon className="w-3.5 h-3.5 text-[#0C0B5D] group-hover:text-white" />
                            </span>
                            <span className="flex-1">{s.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
              </div>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div className="px-3 py-2 text-[11px] text-red-700 bg-red-50 border-t border-red-100">
              {error}
            </div>
          )}

          {/* Input — disabled until guest intro is acknowledged */}
          <div className={`border-t border-gray-200 bg-white p-3 ${expanded ? 'sm:px-6' : ''}`}>
            <div className={`flex items-end gap-2 bg-gray-50 border rounded-xl px-3 py-2 transition-all duration-400 ${
              expanded ? 'max-w-3xl mx-auto' : ''
            } ${
              showGuestIntro ? 'border-gray-200 opacity-60' : 'border-gray-200 focus-within:border-[#0C0B5D] focus-within:bg-white'
            }`}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder={
                  showGuestIntro
                    ? 'Tap "Start chatting" to begin…'
                    : 'Ask about SINAG, SESAM, or admissions…'
                }
                disabled={loading || authLoading || showGuestIntro}
                className="flex-1 bg-transparent resize-none text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none max-h-24 leading-relaxed disabled:cursor-not-allowed"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading || showGuestIntro}
                aria-label="Send message"
                className="flex-shrink-0 p-2 rounded-lg bg-[#0C0B5D] text-white hover:bg-[#0a0949] disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
              AI-generated · verify with SESAM staff
            </p>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

// ── Message bubble ────────────────────────────────────────────────────
function MessageBubble({ message }: { message: MiniMessage }) {
  const isUser = message.role === 'user';
  const showCursor = message.isStreaming && message.role === 'assistant';

  // Parse the assistant body to separate the "## References" section, drop
  // uncited citations, and re-render `[N]` markers as small superscript chips
  // — same pipeline as the full AIChat so visuals stay uniform.
  const { body, mergedRefs } = useMemo(() => {
    if (isUser) return { body: message.content, mergedRefs: [] as ReturnType<typeof mergeRefsWithSources> };
    const { body: rawBody, parsedRefs } = parseAssistantContent(message.content);
    const allRefs = mergeRefsWithSources(parsedRefs, message.sources);
    const { body: cleaned, refs } = processCitations(rawBody, allRefs);
    return { body: cleaned, mergedRefs: refs };
  }, [isUser, message.content, message.sources]);

  const hasRefs = !isUser && !message.isStreaming && mergedRefs.length > 0;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} sinag-bot-msg`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-[#0C0B5D] flex items-center justify-center mr-2 flex-shrink-0 self-end shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed shadow-sm break-words ${
          isUser
            ? 'bg-[#0C0B5D] text-white rounded-br-md whitespace-pre-wrap'
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
        }`}
      >
        {isUser ? (
          message.content
        ) : body ? (
          <MarkdownMessage content={body} className="sinag-bot-md" />
        ) : message.isStreaming ? (
          <TypingDots />
        ) : null}
        {showCursor && body && (
          <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-current animate-pulse" />
        )}

        {/* References card — same visual treatment as the full AIChat */}
        {hasRefs && (
          <div className="mt-2.5 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/40 border border-amber-300 shadow-sm p-2.5">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-amber-200">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-amber-600 flex items-center justify-center shadow-sm">
                  <BookMarked className="w-3 h-3 text-white" />
                </div>
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                  References
                </span>
              </div>
              <span className="text-[9px] font-semibold text-amber-700 bg-white border border-amber-300 px-1.5 py-0.5 rounded-full">
                {mergedRefs.length} cited
              </span>
            </div>
            <ol className="space-y-1">
              {mergedRefs.map((ref, i) => (
                <li
                  key={i}
                  className="flex gap-1.5 text-[11px] text-gray-800 leading-snug"
                >
                  <span className="font-bold text-amber-800 flex-shrink-0 min-w-[1.25rem]">
                    [{i + 1}]
                  </span>
                  {ref.url ? (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-1 text-[#0C0B5D] hover:text-amber-900 hover:underline break-words"
                    >
                      <span>{ref.text}</span>
                      <ExternalLink className="w-2.5 h-2.5 mt-0.5 opacity-60 flex-shrink-0" />
                    </a>
                  ) : (
                    <span className="break-words">{ref.text}</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 sinag-bot-dot" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 sinag-bot-dot" style={{ animationDelay: '160ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 sinag-bot-dot" style={{ animationDelay: '320ms' }} />
    </span>
  );
}
