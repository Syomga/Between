import { useChatStore } from "../store/useChatStore";
import { avatarColor, avatarInitial, formatMessageTime } from "../utils/avatar";
import { getPreviewText } from "../utils/messageView";

export function DialogueList() {
  const dialogues = useChatStore((state) => state.dialogues);
  const activeDialogueId = useChatStore((state) => state.activeDialogueId);
  const setActiveDialogueId = useChatStore((state) => state.setActiveDialogueId);
  const currentUserId = useChatStore((state) => state.currentUser?.id);

  if (dialogues.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm tg-text-muted">
        Диалогов пока нет. Найдите собеседника через поиск или случайный подбор.
      </div>
    );
  }

  return (
    <div>
      {dialogues.map((dialogue) => {
        const peerName = dialogue.peer?.username ?? "Unknown";
        const isActive = activeDialogueId === dialogue.id;
        const preview =
          dialogue.lastMessage && currentUserId
            ? getPreviewText(dialogue.lastMessage, currentUserId)
            : dialogue.lastMessage?.originalText || "Нет сообщений";

        return (
          <button
            className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
              isActive ? "tg-bg-active" : "tg-hover"
            }`}
            key={dialogue.id}
            onClick={() => setActiveDialogueId(dialogue.id)}
            type="button"
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white"
              style={{ backgroundColor: avatarColor(peerName) }}
            >
              {avatarInitial(peerName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[15px] font-medium tg-text">{peerName}</p>
                {dialogue.lastMessage?.createdAt && (
                  <span className="shrink-0 text-xs tg-text-subtle">
                    {formatMessageTime(dialogue.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              <p className="truncate text-sm tg-text-muted">{preview}</p>
              {dialogue.peer && (
                <p className="truncate text-xs tg-text-subtle">
                  {dialogue.peer.country} · {dialogue.peer.nativeLang}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
