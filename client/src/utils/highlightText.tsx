import type { CulturalHighlight } from "../types/chat";
import type { HighlightMode } from "./messageView";
import { getHighlightExplanation } from "./messageView";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface HighlightPart {
  type: "text" | "highlight";
  value: string;
  phrase?: string;
  explanation?: string;
  category?: CulturalHighlight["category"];
}

function pickHighlightPhrase(highlight: CulturalHighlight, text: string, mode: HighlightMode): string {
  const originalPhrase = highlight.originalPhrase?.trim() ?? "";
  const translation = highlight.translation?.trim() ?? "";

  if (mode === "source") {
    if (originalPhrase && text.includes(originalPhrase)) {
      return originalPhrase;
    }
    if (translation && text.includes(translation)) {
      return translation;
    }
    return originalPhrase || translation;
  }

  if (translation && text.includes(translation)) {
    return translation;
  }
  if (originalPhrase && text.includes(originalPhrase)) {
    return originalPhrase;
  }
  return translation || originalPhrase;
}

export function splitWithHighlights(
  text: string,
  highlights: CulturalHighlight[],
  mode: HighlightMode,
): HighlightPart[] {
  if (!highlights.length || !text) {
    return [{ type: "text", value: text }];
  }

  const matched = highlights
    .map((item) => ({
      item,
      phrase: pickHighlightPhrase(item, text, mode),
    }))
    .filter(({ phrase }) => phrase.length > 0 && text.includes(phrase));

  if (!matched.length) {
    return [{ type: "text", value: text }];
  }

  const sorted = matched.sort((a, b) => b.phrase.length - a.phrase.length);

  let result = text;
  sorted.forEach(({ phrase }, index) => {
    const token = `__HL_${index}__`;
    const regex = new RegExp(escapeRegExp(phrase), "gi");
    result = result.replace(regex, token);
  });

  const parts = result.split(/(__HL_\d+__)/g).filter(Boolean);
  return parts.map((part) => {
    const match = part.match(/^__HL_(\d+)__$/);
    if (!match) {
      return { type: "text", value: part };
    }

    const idx = Number(match[1]);
    const { item, phrase } = sorted[idx];

    return {
      type: "highlight",
      value: phrase,
      phrase,
      explanation: getHighlightExplanation(item, mode),
      category: item.category,
    };
  });
}
