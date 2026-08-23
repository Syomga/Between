import type { Message } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { serializeMessage, type SerializedMessage } from "../lib/messageSerializer";
import { translateForViewer, translateWithCulture } from "../services/aiService";

export async function enrichMessageForViewer(
  message: Message,
  viewer: { id: string; nativeLang: string },
): Promise<SerializedMessage> {
  const serialized = serializeMessage(message);
  const original = message.originalText.trim();
  const translated = (message.translatedText || message.originalText).trim();

  if (message.senderId === viewer.id) {
    return serialized;
  }

  if (original !== translated) {
    return serialized;
  }

  const result = await translateForViewer(
    message.originalText,
    viewer.nativeLang,
    message.sourceLang,
  );

  if (result.translatedText.trim() === original) {
    return serialized;
  }

  const updated = await prisma.message.update({
    where: { id: message.id },
    data: {
      translatedText: result.translatedText,
      targetLang: viewer.nativeLang,
      culturalHighlights: result.culturalHighlights as unknown as Prisma.InputJsonValue,
    },
  });

  return serializeMessage(updated);
}

export async function enrichMessagesForViewer(
  messages: Message[],
  viewer: { id: string; nativeLang: string },
): Promise<SerializedMessage[]> {
  return Promise.all(messages.map((message) => enrichMessageForViewer(message, viewer)));
}

export { translateWithCulture };
