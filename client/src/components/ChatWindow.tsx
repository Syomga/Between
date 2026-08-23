import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Mic, Paperclip, Search, Send, Smile } from "lucide-react";
import { api } from "../api/client";
import { useChatStore } from "../store/useChatStore";
import type { MessageAttachment } from "../types/chat";
import { avatarColor, avatarInitial } from "../utils/avatar";
import { MessageBubble } from "./MessageBubble";
import { EmojiPicker } from "./EmojiPicker";
import { MessageSearchBar } from "./MessageSearchBar";
import { findMatchingMessageIds } from "../utils/messageSearch";

interface Props {
  onBack?: () => void;
}

export function ChatWindow({ onBack }: Props) {
  const activeDialogueId = useChatStore((state) => state.activeDialogueId);
  const currentUser = useChatStore((state) => state.currentUser);
  const dialogues = useChatStore((state) => state.dialogues);
  const setMessages = useChatStore((state) => state.setMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const messagesByDialogueId = useChatStore((state) => state.messagesByDialogueId);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const activeDialogue = useMemo(
    () => dialogues.find((dialogue) => dialogue.id === activeDialogueId) ?? null,
    [activeDialogueId, dialogues],
  );

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

  const matchingMessageIds = useMemo(
    () => findMatchingMessageIds(messages, searchQuery),
    [messages, searchQuery],
  );

  const activeMatchId = matchingMessageIds[activeMatchIndex] ?? null;
  const searchActive = searchOpen && searchQuery.trim().length > 0;

  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setActiveMatchIndex(0);
  }, [activeDialogueId]);

  useEffect(() => {
    setActiveMatchIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (!activeMatchId) {
      return;
    }
    messageRefs.current[activeMatchId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeMatchId, activeMatchIndex]);

  useEffect(() => {
    if (searchActive) {
      return;
    }
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, searchActive]);

  async function dispatchMessage(payload: {
    text?: string;
    attachment?: MessageAttachment;
  }) {
    if (!activeDialogueId) {
      return;
    }

    const message = await api.sendMessage(activeDialogueId, payload);
    addMessage(message);
  }

  async function sendMessage() {
    if (!activeDialogueId || !text.trim()) {
      return;
    }

    setSending(true);
    setUploadError(null);
    const messageText = text.trim();
    setText("");

    try {
      await dispatchMessage({ text: messageText });
    } finally {
      setSending(false);
    }
  }

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !activeDialogueId) {
      return;
    }

    setSending(true);
    setUploadError(null);

    try {
      const attachment = await api.uploadAttachment(file);
      await dispatchMessage({
        text: text.trim() || undefined,
        attachment,
      });
      setText("");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Не удалось загрузить файл");
    } finally {
      setSending(false);
    }
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
    setActiveMatchIndex(0);
  }

  function goToNextMatch() {
    if (matchingMessageIds.length === 0) {
      return;
    }
    setActiveMatchIndex((index) => (index + 1) % matchingMessageIds.length);
  }

  function goToPreviousMatch() {
    if (matchingMessageIds.length === 0) {
      return;
    }
    setActiveMatchIndex(
      (index) => (index - 1 + matchingMessageIds.length) % matchingMessageIds.length,
    );
  }

  if (!activeDialogueId || !activeDialogue?.peer) {
    return (
      <div className="hidden h-full flex-col items-center justify-center tg-bg-app tg-text-muted md:flex">
        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full tg-bg-panel text-3xl shadow-sm">
          💬
        </div>
        <p className="text-lg tg-text-secondary">Выберите чат</p>
        <p className="mt-1 px-6 text-center text-sm">Начните международное общение на своём языке</p>
      </div>
    );
  }

  const peer = activeDialogue.peer;

  return (
    <div className="flex h-full flex-col tg-bg-app">
      <header className="flex items-center justify-between border-b tg-border tg-bg-panel px-2 py-2.5 md:px-4">
        <div className="flex min-w-0 items-center gap-1 md:gap-3">
          {onBack && (
            <button
              className="rounded-lg p-2 tg-icon-btn md:hidden"
              onClick={onBack}
              title="Назад к чатам"
              type="button"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: avatarColor(peer.username) }}
          >
            {avatarInitial(peer.username)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium tg-text">{peer.username}</p>
            <p className="truncate text-xs tg-text-accent">
              {peer.country} · {peer.nativeLang}
            </p>
          </div>
        </div>
        <button
          className={`rounded-lg p-2 transition ${
            searchOpen ? "tg-icon-btn-active" : "tg-icon-btn"
          }`}
          onClick={() => {
            if (searchOpen) {
              closeSearch();
            } else {
              setSearchOpen(true);
            }
          }}
          title="Поиск в чате"
          type="button"
        >
          <Search className="h-5 w-5" />
        </button>
      </header>

      {searchOpen && (
        <MessageSearchBar
          activeMatch={activeMatchIndex}
          matchCount={matchingMessageIds.length}
          onClose={closeSearch}
          onNext={goToNextMatch}
          onPrevious={goToPreviousMatch}
          onQueryChange={setSearchQuery}
          query={searchQuery}
        />
      )}

      <div className="chat-pattern tg-scroll flex-1 overflow-y-auto px-4 py-3" ref={scrollRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            ref={(element) => {
              messageRefs.current[message.id] = element;
            }}
          >
            <MessageBubble
              isActiveSearchMatch={message.id === activeMatchId}
              isMine={Boolean(currentUser?.id && message.senderId === currentUser.id)}
              message={message}
              searchDimmed={searchActive && !matchingMessageIds.includes(message.id)}
            />
          </div>
        ))}
      </div>

      <footer className="relative border-t tg-border tg-bg-panel px-2 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] md:px-4 md:py-3">
        {uploadError && <p className="mb-2 text-xs text-red-500">{uploadError}</p>}
        <EmojiPicker
          onClose={() => setEmojiOpen(false)}
          onSelect={(emoji) => {
            setText((prev) => `${prev}${emoji}`);
            inputRef.current?.focus();
          }}
          open={emojiOpen}
        />
        <div className="flex items-end gap-2">
          <input
            accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.zip"
            className="hidden"
            onChange={(event) => {
              void handleFileSelect(event);
            }}
            ref={fileInputRef}
            type="file"
          />
          <button
            className="rounded-full p-2 tg-icon-btn disabled:opacity-50"
            disabled={sending}
            onClick={() => fileInputRef.current?.click()}
            title="Прикрепить файл"
            type="button"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <div className="flex min-h-[44px] flex-1 items-center rounded-2xl border tg-border tg-bg-input-wrap px-4 py-2">
            <input
              className="w-full bg-transparent text-sm tg-text outline-none placeholder:tg-text-subtle"
              disabled={sending}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Напишите сообщение..."
              ref={inputRef}
              value={text}
            />
          </div>
          <button
            className={`rounded-full p-2 transition ${
              emojiOpen ? "tg-icon-btn-active" : "tg-icon-btn"
            }`}
            onClick={() => setEmojiOpen((value) => !value)}
            title="Эмодзи"
            type="button"
          >
            <Smile className="h-5 w-5" />
          </button>
          {text.trim() ? (
            <button
              className="rounded-full tg-btn-primary p-2 disabled:opacity-60"
              disabled={sending}
              onClick={() => {
                void sendMessage();
              }}
              title="Отправить"
              type="button"
            >
              <Send className="h-5 w-5" />
            </button>
          ) : (
            <button className="rounded-full p-2 tg-icon-btn" title="Голосовое сообщение" type="button">
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
