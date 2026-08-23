import type { Message } from "../types/chat";

export function getMessageSearchText(message: Message): string {
  return [message.originalText, message.translatedText, message.attachmentName]
    .filter(Boolean)
    .join(" ");
}

export function findMatchingMessageIds(messages: Message[], query: string): string[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return messages
    .filter((message) => getMessageSearchText(message).toLowerCase().includes(normalized))
    .map((message) => message.id);
}
