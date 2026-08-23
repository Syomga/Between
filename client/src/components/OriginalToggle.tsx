interface Props {
  value: boolean;
  onToggle: () => void;
}

export function OriginalToggle({ value, onToggle }: Props) {
  return (
    <button
      className="mt-1 text-xs text-slate-500 underline"
      onClick={onToggle}
      type="button"
    >
      {value ? "Скрыть оригинал" : "Показать оригинал"}
    </button>
  );
}
