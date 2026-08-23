import { ChevronDown, ChevronUp, Search, X } from "lucide-react";

interface Props {
  query: string;
  matchCount: number;
  activeMatch: number;
  onQueryChange: (value: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
}

export function MessageSearchBar({
  query,
  matchCount,
  activeMatch,
  onQueryChange,
  onPrevious,
  onNext,
  onClose,
}: Props) {
  return (
    <div className="flex items-center gap-2 border-b tg-border tg-bg-panel px-4 py-2.5">
      <Search className="h-5 w-5 shrink-0 tg-text-subtle" />
      <input
        autoFocus
        className="min-w-0 flex-1 bg-transparent text-sm tg-text outline-none placeholder:tg-text-subtle"
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (event.shiftKey) {
              onPrevious();
            } else {
              onNext();
            }
          }
          if (event.key === "Escape") {
            onClose();
          }
        }}
        placeholder="Поиск по сообщениям..."
        value={query}
      />
      {query.trim() && (
        <span className="shrink-0 text-xs tg-text-subtle">
          {matchCount > 0 ? `${activeMatch + 1} / ${matchCount}` : "0 / 0"}
        </span>
      )}
      <button
        className="rounded-lg p-1.5 tg-icon-btn disabled:opacity-40"
        disabled={matchCount === 0}
        onClick={onPrevious}
        title="Предыдущее"
        type="button"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <button
        className="rounded-lg p-1.5 tg-icon-btn disabled:opacity-40"
        disabled={matchCount === 0}
        onClick={onNext}
        title="Следующее"
        type="button"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
      <button
        className="rounded-lg p-1.5 tg-icon-btn hover:text-red-500"
        onClick={onClose}
        title="Закрыть поиск"
        type="button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
