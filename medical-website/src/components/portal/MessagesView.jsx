import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, SendHorizonal, TriangleAlert } from 'lucide-react';
import { api } from '../../lib/api';

// Must match MESSAGE_MAX_LENGTH in backend/src/utils/validation.js.
const MESSAGE_MAX_LENGTH = 2000;

export default function MessagesView() {
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);

  const retryLoad = () => {
    setLoading(true);
    setLoadError('');
    setLoadAttempt((attempt) => attempt + 1);
  };

  useEffect(() => {
    let cancelled = false;

    api('/api/messages')
      .then((result) => {
        if (cancelled) return;
        const next = result.threads || [];
        setThreads(next);
        setActiveThreadId((current) =>
          next.some((thread) => thread.id === current) ? current : next[0]?.id || ''
        );
      })
      .catch((requestError) => {
        if (cancelled) return;
        setLoadError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [loadAttempt]);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) || threads[0],
    [threads, activeThreadId],
  );

  const trimmedDraft = draft.trim();
  const tooLong = trimmedDraft.length > MESSAGE_MAX_LENGTH;
  const canSend = Boolean(trimmedDraft) && !tooLong && !sending;

  const send = async () => {
    if (!canSend || !activeThread) return;

    setSending(true);
    setError('');
    setStatus('');

    try {
      const result = await api('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ threadName: activeThread.name, body: trimmedDraft }),
      });

      setThreads((current) => current.map((thread) => thread.id === activeThread.id
        ? { ...thread, preview: result.message.text, messages: [...thread.messages, result.message] }
        : thread));
      setDraft('');
      setStatus('Saved to this demo. This message has not been sent to clinic staff.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="rounded-2xl border border-nb-line bg-white p-8 text-center text-sm text-nb-ink/60">Loading messages…</div>;
  }

  if (loadError) {
    return (
      <div role="alert" className="rounded-2xl border border-nb-line bg-white p-6 text-center">
        <p className="text-sm text-red-600">{loadError}</p>
        <button
          type="button"
          onClick={retryLoad}
          className="mt-4 rounded-full bg-nb-teal px-5 py-2.5 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.5fr]">
      <aside className="rounded-2xl border border-nb-line bg-white p-4 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
        <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-nb-teal"><MessageSquare className="h-5 w-5" />Messages</div>
        {threads.length === 0 ? <p className="rounded-2xl bg-nb-paper p-4 text-sm text-nb-ink/60">No conversations yet.</p> : (
          <div className="space-y-3">
            {threads.map((thread) => (
              <button key={thread.id} type="button" aria-current={activeThreadId === thread.id ? 'true' : undefined} onClick={() => setActiveThreadId(thread.id)} className={`w-full rounded-2xl p-3 text-left ${activeThreadId === thread.id ? 'bg-nb-sand' : 'bg-nb-paper'}`}>
                <div className="font-medium text-nb-ink">{thread.name}</div>
                <div className="mt-1 text-sm text-nb-ink/60">{thread.preview}</div>
              </button>
            ))}
          </div>
        )}
      </aside>

      {activeThread ? (
        <div className="rounded-2xl border border-nb-line bg-white p-4 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
          <div className="mb-4 flex items-center gap-3 border-b border-nb-line pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nb-sand font-semibold text-nb-teal">{activeThread.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
            <div><div className="font-semibold text-nb-ink">{activeThread.name}</div><div className="text-sm text-nb-ink/60">Demo conversation</div></div>
          </div>

          <p className="mb-4 flex items-start gap-2 rounded-2xl bg-nb-paper p-3 text-sm text-nb-ink/75">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-nb-teal" aria-hidden="true" />
            <span>This is a demo messaging feature. Messages are saved in this demo only — they are not delivered to, or read by, clinic staff, and no clinician will reply. Do not send urgent or sensitive medical information here. For anything urgent, call the clinic directly.</span>
          </p>

          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {activeThread.messages.length === 0 ? (
              <p className="text-sm text-nb-ink/60">No messages in this conversation yet.</p>
            ) : activeThread.messages.map((message) => (
              <div key={message.id} className={`flex ${message.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-6 ${message.from === 'me' ? 'bg-nb-teal text-white' : 'bg-nb-sand text-nb-ink'}`}>{message.text}</div>
              </div>
            ))}
          </div>

          <div aria-live="polite" className="mt-3 space-y-2">
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            {status && <p role="status" className="rounded-2xl bg-nb-paper px-4 py-2 text-sm text-nb-ink/70">{status}</p>}
          </div>

          {tooLong && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              Message must be {MESSAGE_MAX_LENGTH.toLocaleString()} characters or fewer.
            </p>
          )}

          <div className="mt-3 flex items-center gap-3 border-t border-nb-line pt-3">
            <input
              value={draft}
              aria-label="Type a message"
              aria-describedby="message-remaining"
              maxLength={MESSAGE_MAX_LENGTH + 200}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') send(); }}
              placeholder="Type a message"
              className="flex-1 rounded-full border border-nb-line bg-nb-paper px-4 py-3 text-sm outline-none focus:border-nb-teal"
            />
            <button disabled={!canSend} type="button" onClick={send} aria-label="Send message" aria-busy={sending} className="inline-flex items-center gap-2 rounded-full bg-nb-teal px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{sending ? 'Saving…' : 'Save'}<SendHorizonal className="h-4 w-4" /></button>
          </div>
          <p id="message-remaining" className="mt-2 text-xs text-nb-ink/50">
            {trimmedDraft.length.toLocaleString()} / {MESSAGE_MAX_LENGTH.toLocaleString()} characters
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-nb-line bg-white p-10 text-center text-sm text-nb-ink/60">Select a conversation to begin.</div>
      )}
    </div>
  );
}