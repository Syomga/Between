import type { Message } from "@prisma/client";
import type { Server } from "socket.io";
import { prisma } from "../lib/prisma";
import { enrichMessageForViewer } from "../services/messageTranslation";

let io: Server | null = null;

export function attachIO(server: Server): void {
  io = server;
}

export function getDialogueRoom(dialogueId: string): string {
  return `dialogue:${dialogueId}`;
}

export function getUserRoom(userId: string): string {
  return `user:${userId}`;
}

export function emitNewDialogue(userIds: string[], payload: unknown): void {
  if (!io) {
    return;
  }
  for (const userId of userIds) {
    io.to(getUserRoom(userId)).emit("new-dialogue", payload);
  }
}

export function emitDialogueToUser(userId: string, payload: unknown): void {
  if (!io) {
    return;
  }
  io.to(getUserRoom(userId)).emit("new-dialogue", payload);
}

export async function emitNewMessageToParticipants(
  dialogueId: string,
  message: Message,
  participantIds: string[],
): Promise<void> {
  if (!io) {
    return;
  }

  const participants = await prisma.user.findMany({
    where: { id: { in: participantIds } },
    select: { id: true, nativeLang: true },
  });

  await Promise.all(
    participants.map(async (viewer) => {
      const payload = await enrichMessageForViewer(message, viewer);
      io?.to(getUserRoom(viewer.id)).emit("new-message", payload);
    }),
  );

  if (participants.length === 0) {
    io.to(getDialogueRoom(dialogueId)).emit("new-message", message);
  }
}
