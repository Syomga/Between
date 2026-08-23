import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface Props {
  phrase: string;
  explanation: string;
  category: string;
  children: React.ReactNode;
  isMine?: boolean;
}

export function CultureWidget({ phrase, explanation, category, children, isMine = false }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`rounded px-1 underline decoration-dotted ${
            isMine ? "tg-culture-mine" : "tg-culture-other"
          }`}
          type="button"
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="mb-1 text-xs uppercase tg-text-subtle">{category}</p>
        <p className="font-medium tg-text">{phrase}</p>
        <p className="mt-1 text-sm tg-text-muted">{explanation}</p>
      </PopoverContent>
    </Popover>
  );
}
