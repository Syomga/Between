import type { Message } from "@prisma/client";
import type { CulturalHighlight } from "../types/chat";

export type SerializedMessage = Omit<Message, "createdAt" | "culturalHighlights"> & {
  createdAt: string;
  culturalHighlights: CulturalHighlight[];
};

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

export function serializeMessage(message: Message): SerializedMessage {
  return {
    ...message,
    senderId: message.senderId,
    createdAt: message.createdAt.toISOString(),
    culturalHighlights: parseHighlights(message.culturalHighlights),
  };
}

export function normalizeMessageHighlights<T extends { culturalHighlights?: unknown }>(
  message: T,
): T & { culturalHighlights: CulturalHighlight[] } {
  return {
    ...message,
    culturalHighlights: parseHighlights(message.culturalHighlights),
  };
}
