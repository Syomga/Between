import { useChatStore } from "../store/useChatStore";

function avatarColor(name: string): string {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
}

export function DialogueList() {
  const dialogues = useChatStore((state) => state.dialogues);
  const activeDialogueId = useChatStore((state) => state.activeDialogueId);
  const setActiveDialogueId = useChatStore((state) => state.setActiveDialogueId);

  return (
    <div className="mt-3 space-y-2 overflow-auto">
      {dialogues.map((dialogue) => (
        <button
          className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left ${
            activeDialogueId === dialogue.id ? "bg-blue-100" : "hover:bg-slate-100"
          }`}
          key={dialogue.id}
          onClick={() => setActiveDialogueId(dialogue.id)}
          type="button"
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{
              backgroundColor: avatarColor(dialogue.peer?.username ?? "U"),
            }}
          >
            {(dialogue.peer?.username?.[0] ?? "U").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">
              {dialogue.peer?.username ?? "Unknown"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {dialogue.lastMessage?.translatedText || dialogue.lastMessage?.originalText || "Нет сообщений"}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
