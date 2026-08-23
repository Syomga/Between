import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { translateWithCulture } from "./messageTranslation";
import type { CreateMessageInput, MessageAttachmentInput } from "../types/message";

export async function createDialogueMessage(
  dialogueId: string,
  senderId: string,
  input: CreateMessageInput,
) {
  const text = input.text?.trim() ?? "";
  const attachment = input.attachment;

  if (!text && !attachment) {
    throw new Error("Message must include text or attachment");
  }

  const dialogue = await prisma.dialogue.findUnique({
    where: { id: dialogueId },
    include: {
      participants: {
        include: { user: true },
      },
    },
  });

  if (!dialogue) {
    throw new Error("Dialogue not found");
  }

  const sender = dialogue.participants.find(
    (participant: (typeof dialogue.participants)[number]) => participant.userId === senderId,
  )?.user;
  const receiver = dialogue.participants.find(
    (participant: (typeof dialogue.participants)[number]) => participant.userId !== senderId,
  )?.user;
  if (!sender || !receiver) {
    throw new Error("Receiver not found");
  }

  const fallbackText = attachment ? `📎 ${attachment.name}` : text;
  let translatedText = fallbackText;
  let culturalHighlights: Prisma.InputJsonValue = [];

  if (text) {
    const translation = await translateWithCulture(text, sender.nativeLang, receiver.nativeLang);
    translatedText = translation.translatedText;
    culturalHighlights = translation.culturalHighlights as unknown as Prisma.InputJsonValue;
  }

  const originalText = text || fallbackText;

  const message = await prisma.message.create({
    data: {
      dialogueId,
      senderId,
      originalText,
      translatedText,
      sourceLang: sender.nativeLang,
      targetLang: receiver.nativeLang,
      culturalHighlights,
      attachmentUrl: attachment?.url,
      attachmentName: attachment?.name,
      attachmentMimeType: attachment?.mimeType,
      attachmentSize: attachment?.size,
    },
  });

  await prisma.dialogue.update({
    where: { id: dialogueId },
    data: { updatedAt: new Date() },
  });

  return message;
}

export function buildAttachmentFromFile(
  filename: string,
  originalName: string,
  mimeType: string,
  size: number,
): MessageAttachmentInput {
  return {
    url: `/uploads/${filename}`,
    name: originalName,
    mimeType,
    size,
  };
}
