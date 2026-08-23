import { BASIC_EMOJIS } from "../constants/emojis";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ open, onClose, onSelect }: Props) {
  if (!open) {
    return null;
  }

  return (
    <>
      <button
        aria-label="Закрыть"
        className="fixed inset-0 z-10"
        onClick={onClose}
        type="button"
      />
      <div className="absolute right-2 bottom-[calc(100%+0.5rem)] z-20 w-[min(16rem,calc(100vw-1rem))] rounded-xl border tg-dropdown p-3 md:right-12 md:bottom-12 md:w-64">
        <p className="mb-2 text-xs font-medium tg-text-muted">Эмодзи</p>
        <div className="grid grid-cols-6 gap-1">
          {BASIC_EMOJIS.map((emoji) => (
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xl transition tg-hover"
              key={emoji}
              onClick={() => {
                onSelect(emoji);
                onClose();
              }}
              type="button"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
