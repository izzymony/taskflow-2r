'use client';

import { useState, type FormEvent } from 'react';
import { Bot, MessageSquare, Send, UserRound } from 'lucide-react';

import { PageHeader, TaskflowShell } from '../taskflow-shell';
import { EmptyState, inputClass } from '@/components/ui/page-kit';
import { cn } from '@/lib/utils';

const SUGGESTIONS = [
  'What is due this week?',
  'Summarise the latest client activity',
  'Which invoices are still open?',
];

interface ChatMessage {
  id: string;
  body: string;
  from: 'user' | 'assistant';
  time: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'message-1',
    body: 'Welcome to taskflow chat. Ask about your projects, clients, or next steps.',
    from: 'assistant',
    time: '09:30',
  },
];

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const time = nowTime();
    setMessages((current) => [
      ...current,
      { id: `message-${Date.now()}-user`, body: trimmed, from: 'user', time },
      {
        id: `message-${Date.now()}-assistant`,
        body: 'Got it — this thread is ready to connect to your AI backend. For now, everything you need is on the workspace pages.',
        from: 'assistant',
        time,
      },
    ]);
    setDraft('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send(draft);
  }

  return (
    <TaskflowShell>
      <PageHeader
        eyebrow="COLLABORATE"
        title="Chat"
        description="Talk through work with your team or an assistant."
      />

      <section className="panel mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3 border-b border-[#edf0f5] pb-5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#fff0f0] text-[#ff646b]">
            <Bot className="size-5" />
          </div>
          <div>
            <h2 className="font-bold">Workspace assistant</h2>
            <p className="text-xs text-[#8b96a9]">Online · Ready to help</p>
          </div>
        </div>

        {messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Start the conversation"
            description="Ask a question about a client, a deadline or an invoice."
          />
        ) : (
          <div className="min-h-[330px] space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-2',
                  message.from === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                {message.from === 'assistant' ? (
                  <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#edf3ff] text-[#4e7cff]">
                    <Bot className="size-3.5" />
                  </span>
                ) : null}
                <div
                  className={cn(
                    'max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6',
                    message.from === 'user'
                      ? 'bg-[#172033] text-white'
                      : 'bg-[#f3f6fb] text-[#566176]',
                  )}
                >
                  <p>{message.body}</p>
                  <p
                    className={cn(
                      'mt-1 text-[10px]',
                      message.from === 'user' ? 'text-white/60' : 'text-[#a3adbc]',
                    )}
                  >
                    {message.time}
                  </p>
                </div>
                {message.from === 'user' ? (
                  <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#fff0f0] text-[#ff646b]">
                    <UserRound className="size-3.5" />
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <div className="mb-5 mt-6 flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => send(suggestion)}
              className="soft-button"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask anything about your workspace..."
            aria-label="Message"
            className={cn(inputClass, 'h-12 flex-1 px-4')}
          />
          <button type="submit" aria-label="Send message" className="primary-button px-4">
            <Send className="size-4" />
          </button>
        </form>
      </section>
    </TaskflowShell>
  );
}

export default ChatPage;
