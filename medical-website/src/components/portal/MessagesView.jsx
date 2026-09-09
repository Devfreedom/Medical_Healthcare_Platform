import { useState } from 'react';
import { MessageSquare, SendHorizonal } from 'lucide-react';
import { messageThreads } from '../../data/messageThreads';

export default function MessagesView() {
  const [activeThreadId, setActiveThreadId] = useState(messageThreads[0].id);
  const [draft, setDraft] = useState('');

  const activeThread = messageThreads.find((thread) => thread.id === activeThreadId) || messageThreads[0];

  const handleSend = () => {
    if (!draft.trim()) return;
    setDraft('');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.5fr]">
      <aside className="rounded-2xl border border-nb-line bg-white p-4 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
        <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-nb-teal">
          <MessageSquare className="h-5 w-5" />
          Messages
        </div>

        <div className="space-y-3">
          {messageThreads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => setActiveThreadId(thread.id)}
              className={`w-full rounded-2xl p-3 text-left transition ${
                activeThreadId === thread.id ? 'bg-nb-sand' : 'bg-nb-paper'
              }`}
            >
              <div className="font-medium text-nb-ink">{thread.name}</div>
              <div className="mt-1 text-sm text-nb-ink/60">{thread.preview}</div>
            </button>
          ))}
        </div>
      </aside>

      <div className="rounded-2xl border border-nb-line bg-white p-4 shadow-[0_12px_24px_rgba(19,42,44,0.04)]">
        <div className="mb-4 flex items-center gap-3 border-b border-nb-line pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nb-sand font-semibold text-nb-teal">
            {activeThread.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
          </div>
          <div>
            <div className="font-semibold text-nb-ink">{activeThread.name}</div>
            <div className="text-sm text-nb-ink/60">Online</div>
          </div>
        </div>

        <div className="space-y-3">
          {activeThread.messages.map((message, index) => (
            <div key={`${message.from}-${index}`} className={`flex ${message.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-6 ${
                  message.from === 'me' ? 'bg-nb-teal text-white' : 'bg-nb-sand text-nb-ink'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3 border-t border-nb-line pt-3">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a message"
            className="flex-1 rounded-full border border-nb-line bg-nb-paper px-4 py-3 text-sm outline-none focus:border-nb-teal"
          />
          <button type="button" onClick={handleSend} className="inline-flex items-center gap-2 rounded-full bg-nb-teal px-4 py-3 text-sm font-semibold text-white">
            Send
            <SendHorizonal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
