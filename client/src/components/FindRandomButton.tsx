import { Loader2, Shuffle } from "lucide-react";
import { cn } from "../utils/cn";
import { useFindRandomDialogue } from "../hooks/useFindRandomDialogue";

interface Props {
  compact?: boolean;
  sidebar?: boolean;
}

export function FindRandomButton({ compact = false, sidebar = false }: Props) {
  const { findRandom, loading, error, clearError } = useFindRandomDialogue();

  const buttonClass = compact
    ? "flex h-9 w-9 items-center justify-center rounded-full tg-btn-primary disabled:opacity-60"
    : sidebar
      ? "flex h-12 w-12 items-center justify-center rounded-xl tg-icon-btn disabled:opacity-60"
      : "rounded-xl tg-btn-primary px-3 py-2 text-sm disabled:opacity-60";

  return (
    <>
      <div className="relative">
        <button
          className={buttonClass}
          disabled={loading}
          onClick={() => {
            void findRandom();
          }}
          title="Найти случайного"
          type="button"
        >
          {loading ? (
            <Loader2 className={cn("animate-spin", compact ? "h-4 w-4" : "h-5 w-5")} />
          ) : (
            <Shuffle className={compact ? "h-4 w-4" : "h-5 w-5"} />
          )}
          {!compact && !sidebar && " Найти случайного"}
        </button>
      </div>

      {error && (
        <div className="fixed top-4 left-1/2 z-50 flex max-w-md -translate-x-1/2 items-start gap-3 rounded-xl border tg-dropdown px-4 py-3 text-sm text-red-500 shadow-lg">
          <p className="flex-1">{error}</p>
          <button
            className="shrink-0 tg-text-muted tg-hover-text"
            onClick={clearError}
            type="button"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
