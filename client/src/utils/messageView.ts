import type { CulturalHighlight, Message } from "../types/chat";

export type HighlightMode = "source" | "target";

export interface MessageView {
  text: string;
  mode: HighlightMode;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

export function getMessageView(
  message: Message,
  isMine: boolean,
  showAlternate: boolean,
): MessageView {
  const original = message.originalText;
  const translated = message.translatedText || message.originalText;

  const mode: HighlightMode = isMine
    ? showAlternate
      ? "target"
      : "source"
    : showAlternate
      ? "source"
      : "target";

  const text = mode === "source" ? original : translated;

  return { text, mode };
}

export function hasTranslationToggle(message: Message): boolean {
  return normalizeText(message.originalText) !== normalizeText(message.translatedText);
}

export function getHighlightExplanation(
  highlight: CulturalHighlight,
  mode: HighlightMode,
): string {
  if (mode === "source") {
    return highlight.explanationSource || highlight.explanation;
  }
  return highlight.explanation;
}

export function getHighlightPhrase(highlight: CulturalHighlight, mode: HighlightMode): string {
  return mode === "source" ? highlight.originalPhrase : highlight.translation;
}

export function getPreviewText(
  lastMessage: NonNullable<Message> | Pick<Message, "originalText" | "translatedText" | "senderId">,
  currentUserId: string,
): string {
  if (lastMessage.senderId === currentUserId) {
    return lastMessage.originalText;
  }
  return lastMessage.translatedText || lastMessage.originalText;
}
