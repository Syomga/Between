import type { CulturalHighlight, Message } from "../types/chat";

function parseHighlights(value: unknown): CulturalHighlight[] {
  if (Array.isArray(value)) {
    return value as CulturalHighlight[];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? (parsed as CulturalHighlight[]) : [];
    } catch {
      return [];
    }
  }

  return [];
}

export function normalizeClientMessage(message: Message): Message {
  return {
    ...message,
    culturalHighlights: parseHighlights(message.culturalHighlights),
  };
}
