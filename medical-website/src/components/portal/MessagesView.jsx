import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, SendHorizonal } from 'lucide-react';
import { api } from '../../lib/api';

export default function MessagesView() {
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/messages')
      .then((result) => {
        const next = result.threads || [];
        setThreads(next);
        setActiveThreadId(next[0]?.id || '');
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const activeThread = useMemo(() => threads.find((thread) => thread.id === activeThreadId) || threads[0], [threads, activeThreadId]);

  const send = async () => {
    if (!draft.trim() || !activeThread || sending) return;
    setSending(true);
    setError('');

    try {
      const result = await api('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ threadName: activeThread.name, body: draft }),
      });

      setThreads((current) => current.map((thread) => thread.id === activeThread.id
        ? { ...thread, preview: result.message.text, messages: [...thread.messages, result.message] }
        : thread));
      setDraft('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="rounded-2xl border border-nb-line bg-white p-8 text-center text-sm text-nb-ink/60">Loading messages…</div>;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.5fr]">
      <aside className="rounded-2xl border border-nb-line bg-white p-4 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
        <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-nb-teal"><MessageSquare className="h-5 w-5" />Messages</div>
        {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
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
            <div><div className="font-semibold text-nb-ink">{activeThread.name}</div><div className="text-sm text-nb-ink/60">Care team</div></div>
          </div>
          <div className="max-h-[460px] space-y-3 overflow-y-auto pr-1">
            {activeThread.messages.map((message) => (
              <div key={message.id} className={`flex ${message.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-6 ${message.from === 'me' ? 'bg-nb-teal text-white' : 'bg-nb-sand text-nb-ink'}`}>{message.text}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3 border-t border-nb-line pt-3">
            <input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') send(); }} placeholder="Type a message" className="flex-1 rounded-full border border-nb-line bg-nb-paper px-4 py-3 text-sm outline-none focus:border-nb-teal" />
            <button disabled={sending} type="button" onClick={send} className="inline-flex items-center gap-2 rounded-full bg-nb-teal px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{sending ? 'Sending…' : 'Send'}<SendHorizonal className="h-4 w-4" /></button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-nb-line bg-white p-10 text-center text-sm text-nb-ink/60">Select a conversation to begin.</div>
      )}
    </div>
  );
}
