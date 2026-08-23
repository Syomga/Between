import type { CulturalHighlight } from "../types/chat";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface Props {
  highlight: CulturalHighlight;
  children: React.ReactNode;
}

export function CultureWidget({ highlight, children }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="rounded bg-amber-100 px-1 text-amber-900 underline decoration-dotted"
          type="button"
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="mb-1 text-xs uppercase text-slate-400">{highlight.category}</p>
        <p className="font-medium text-slate-800">{highlight.translation}</p>
        <p className="mt-1 text-sm text-slate-700">{highlight.explanation}</p>
      </PopoverContent>
    </Popover>
  );
}
