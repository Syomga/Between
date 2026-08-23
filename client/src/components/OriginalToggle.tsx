interface Props {
  showAlternate: boolean;
  onToggle: () => void;
  isMine?: boolean;
}

export function OriginalToggle({ showAlternate, onToggle, isMine = false }: Props) {
  const label = isMine
    ? showAlternate
      ? "Скрыть перевод"
      : "Показать перевод"
    : showAlternate
      ? "Скрыть оригинал"
      : "Показать оригинал";

  return (
    <button
      className={`text-[11px] underline transition tg-text-muted tg-hover-text`}
      onClick={onToggle}
      type="button"
    >
      {label}
    </button>
  );
}
