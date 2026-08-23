import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { translateWithCulture } from "./aiService";

export async function createDialogueMessage(dialogueId: string, senderId: string, text: string) {
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

  const translation = await translateWithCulture(text, sender.nativeLang, receiver.nativeLang);

  const message = await prisma.message.create({
    data: {
      dialogueId,
      senderId,
      originalText: text,
      translatedText: translation.translatedText,
      sourceLang: sender.nativeLang,
      targetLang: receiver.nativeLang,
      culturalHighlights: translation.culturalHighlights as unknown as Prisma.InputJsonValue,
    },
  });

  await prisma.dialogue.update({
    where: { id: dialogueId },
    data: { updatedAt: new Date() },
  });

  return {
    ...message,
    culturalHighlights: translation.culturalHighlights,
  };
}
