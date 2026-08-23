import type { CulturalHighlight } from "../types/chat";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function splitWithHighlights(
  text: string,
  highlights: CulturalHighlight[],
): Array<{ type: "text" | "highlight"; value: string; data?: CulturalHighlight }> {
  if (!highlights.length) {
    return [{ type: "text", value: text }];
  }

  const sorted = [...highlights].sort(
    (a, b) => b.originalPhrase.length - a.originalPhrase.length,
  );

  let result = text;
  sorted.forEach((item, index) => {
    const token = `__HL_${index}__`;
    const regex = new RegExp(escapeRegExp(item.translation), "gi");
    result = result.replace(regex, token);
  });

  const parts = result.split(/(__HL_\d+__)/g).filter(Boolean);
  return parts.map((part) => {
    const match = part.match(/^__HL_(\d+)__$/);
    if (!match) {
      return { type: "text", value: part };
    }
    const idx = Number(match[1]);
    const data = sorted[idx];
    return {
      type: "highlight",
      value: data.translation,
      data,
    };
  });
}
