import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { auth } from '../../lib/firebase';
import { useChatStore } from '../../stores/useChatStore';
import { useReaderStore } from '../../stores/useReaderStore';
import { MessageBubble } from './MessageBubble';

const QUICK_ACTIONS = [
  { label: 'Explain the context', prompt: 'Explain the historical and literary context of the passage I\'m reading.' },
  { label: 'Original language insight', prompt: 'What are the key Hebrew or Greek words in this passage, and what do they carry that English misses?' },
  { label: 'Cross references', prompt: 'What other passages connect to what I\'m reading, and how?' },
  { label: 'Explain it simply', prompt: 'Explain this passage simply, as if I\'m completely new to the Bible.' },
];

export function ChatPanel() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { open, setOpen, messages, append, appendToLast, streaming, setStreaming, clear } =
    useChatStore();
  const book = useReaderStore((s) => s.book);
  const chapter = useReaderStore((s) => s.chapter);
  const selection = useReaderStore((s) => s.selection);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  if (!user || pathname === '/login') return null;

  async function send(text: string) {
    const question = text.trim();
    if (!question || streaming) return;
    setInput('');
    append({ role: 'user', content: question });
    append({ role: 'assistant', content: '' });
    setStreaming(true);
    try {
      const token = await auth?.currentUser?.getIdToken();
      const history = [...useChatStore.getState().messages];
      history.pop(); // drop the empty assistant placeholder
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: history.slice(-20),
          context: {
            book,
            chapter,
            verse_start: selection?.start ?? null,
            verse_end: selection?.end ?? null,
          },
        }),
      });
      if (!response.ok || !response.body) {
        const detail = await response.text().catch(() => '');
        appendToLast(`*The study companion is unavailable right now (${response.status}).* ${detail.slice(0, 200)}`);
        return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        appendToLast(decoder.decode(value, { stream: true }));
      }
    } catch {
      appendToLast('*Connection lost — please try again.*');
    } finally {
      setStreaming(false);
    }
  }

  const contextLabel = `${book} ${chapter}${
    selection ? `:${selection.start}${selection.end !== selection.start ? `–${selection.end}` : ''}` : ''
  }`;

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open study companion"
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-teal text-white shadow-xl transition hover:bg-teal-deep dark:bg-gold dark:text-parchment-900"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end sm:inset-auto sm:bottom-5 sm:right-5 sm:top-20">
          <div className="hidden flex-1 sm:hidden" onClick={() => setOpen(false)} />
          <div className="flex w-full flex-col border-parchment-300 bg-parchment-50 shadow-2xl sm:w-[420px] sm:rounded-2xl sm:border dark:border-parchment-700 dark:bg-parchment-800">
            <header className="flex items-center justify-between border-b border-parchment-300 px-4 py-3 dark:border-parchment-700">
              <div>
                <h2 className="font-display text-lg leading-tight">Study companion</h2>
                <p className="text-xs text-ink-faint">Reading {contextLabel}</p>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clear}
                    disabled={streaming}
                    className="rounded-lg px-2 py-1 text-xs text-ink-faint hover:bg-parchment-200 disabled:opacity-40 dark:hover:bg-parchment-700"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="rounded-lg p-1.5 text-ink-faint hover:bg-parchment-200 dark:hover:bg-parchment-700"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </header>

            <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="pt-6 text-center">
                  <p className="font-display text-xl text-ink-faint">Ask anything about the text</p>
                  <p className="mx-auto mt-2 max-w-[30ch] text-xs leading-relaxed text-ink-faint">
                    Grounded in Scripture, public-domain commentaries, and mainstream scholarship.
                    Where traditions differ, you&apos;ll hear the main views — not a verdict.
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <MessageBubble
                  key={i}
                  message={m}
                  streaming={streaming && i === messages.length - 1}
                />
              ))}
            </div>

            <div className="border-t border-parchment-300 p-3 dark:border-parchment-700">
              <div className="mb-2 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {QUICK_ACTIONS.map((qa) => (
                  <button
                    key={qa.label}
                    onClick={() => send(qa.prompt)}
                    disabled={streaming}
                    className="shrink-0 rounded-full border border-parchment-300 bg-white px-3 py-1 text-xs text-ink-soft transition hover:border-gold disabled:opacity-40 dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert"
                  >
                    {qa.label}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask about ${contextLabel}…`}
                  disabled={streaming}
                  className="min-w-0 flex-1 rounded-xl border border-parchment-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-gold disabled:opacity-60 dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert"
                />
                <button
                  type="submit"
                  disabled={streaming || !input.trim()}
                  aria-label="Send"
                  className="rounded-xl bg-teal px-4 text-white transition hover:bg-teal-deep disabled:opacity-50 dark:bg-gold dark:text-parchment-900"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
