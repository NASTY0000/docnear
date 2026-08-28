"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  body: string;
  createdAt: string;
  senderUserId: string;
  sender: { id: string; name: string; role: string };
};

export function ChatPanel({
  consultId,
  meId,
  closed,
}: {
  consultId: string;
  meId: string;
  closed: boolean;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`/api/consults/${consultId}/messages`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not load messages");
      return;
    }
    setError(null);
    setMessages(data.messages);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultId]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages.length]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    const res = await fetch(`/api/consults/${consultId}/messages`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) {
      setError(data.error || "Could not send");
      return;
    }
    setBody("");
    await load();
  }

  return (
    <div className="card flex h-[28rem] flex-col overflow-hidden">
      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-ink-700/70 dark:text-tide-300">
            Start the conversation. Share what is going on — this is advice and triage, not an emergency service.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderUserId === meId;
            return (
              <div key={m.id} className={`max-w-[85%] ${mine ? "ml-auto" : ""}`}>
                <p className="mb-0.5 text-[11px] uppercase tracking-wide text-ink-700/60 dark:text-tide-400">
                  {mine ? "You" : m.sender.name}
                </p>
                <div
                  className={`rounded-2xl px-3 py-2 text-sm ${
                    mine
                      ? "bg-tide-800 text-white dark:bg-tide-400 dark:text-tide-950"
                      : "bg-tide-50 text-ink-900 dark:bg-tide-800 dark:text-sand-50"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            );
          })
        )}
      </div>
      {error ? <p className="px-4 text-sm text-coral-700">{error}</p> : null}
      {closed ? (
        <p className="border-t border-tide-100 px-4 py-3 text-sm dark:border-tide-800">This consult is closed.</p>
      ) : (
        <form onSubmit={onSubmit} className="flex gap-2 border-t border-tide-100 p-3 dark:border-tide-800">
          <input
            className="input"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a message"
            maxLength={4000}
          />
          <button className="btn-primary shrink-0" disabled={sending} type="submit">
            Send
          </button>
        </form>
      )}
    </div>
  );
}
