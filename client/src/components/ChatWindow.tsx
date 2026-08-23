import { useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { api } from "../api/client";
import { useChatStore } from "../store/useChatStore";
import { MessageBubble } from "./MessageBubble";

interface Props {
  socket: Socket | null;
}

export function ChatWindow({ socket }: Props) {
  const activeDialogueId = useChatStore((state) => state.activeDialogueId);
  const currentUser = useChatStore((state) => state.currentUser);
  const setMessages = useChatStore((state) => state.setMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const messagesByDialogueId = useChatStore((state) => state.messagesByDialogueId);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = useMemo(
    () => (activeDialogueId ? messagesByDialogueId[activeDialogueId] || [] : []),
    [activeDialogueId, messagesByDialogueId],
  );

  useEffect(() => {
    if (!activeDialogueId) {
      return;
    }

    let cancelled = false;
    const dialogueId = activeDialogueId;
    async function loadHistory() {
      const history = await api.getMessages(dialogueId);
      if (!cancelled) {
        setMessages(dialogueId, history);
      }
    }

    void loadHistory();
    return () => {
      cancelled = true;
    };
  }, [activeDialogueId, setMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  async function sendMessage() {
    if (!activeDialogueId || !text.trim()) {
      return;
    }

    setSending(true);
    const payload = { dialogueId: activeDialogueId, text: text.trim() };
    setText("");

    try {
      if (socket?.connected) {
        socket.emit("send-message", payload);
      } else {
        const message = await api.sendMessage(activeDialogueId, payload.text);
        addMessage(message);
      }
    } finally {
      setSending(false);
    }
  }

  if (!activeDialogueId) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        Выберите диалог, чтобы начать общение
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto px-4 py-3" ref={scrollRef}>
        {messages.map((message) => (
          <MessageBubble
            isMine={message.senderId === currentUser?.id}
            key={message.id}
            message={message}
          />
        ))}
      </div>
      <div className="border-t border-slate-200 p-3">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            onChange={(event) => setText(event.target.value)}
            placeholder="Введите сообщение..."
            value={text}
          />
          <button
            className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
            disabled={sending}
            onClick={() => {
              void sendMessage();
            }}
            type="button"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}
