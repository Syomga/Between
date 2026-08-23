import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { prisma } from "../lib/prisma";
import { verifyAuthToken } from "../services/authService";
import { attachIO, emitNewMessageToParticipants, getDialogueRoom, getUserRoom } from "./realtime";
import { createDialogueMessage } from "../services/messageService";
import type { CreateMessageInput } from "../types/message";

interface SendMessagePayload extends CreateMessageInput {
  dialogueId: string;
}

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN,
      credentials: true,
    },
  });

  attachIO(io);

  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (typeof token !== "string") {
      next(new Error("Unauthorized"));
      return;
    }

    try {
      const decoded = verifyAuthToken(token);
      socket.data.userId = decoded.userId;
      socket.data.username = decoded.username;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    socket.join(getUserRoom(userId));

    socket.on("join-dialogues", (dialogueIds: string[]) => {
      for (const dialogueId of dialogueIds) {
        socket.join(getDialogueRoom(dialogueId));
      }
    });

    socket.on("send-message", async (payload: SendMessagePayload) => {
      if (!payload?.dialogueId) {
        return;
      }

      const hasText = Boolean(payload.text?.trim());
      const hasAttachment = Boolean(payload.attachment);
      if (!hasText && !hasAttachment) {
        return;
      }

      const isParticipant = await prisma.dialogueParticipant.findFirst({
        where: { dialogueId: payload.dialogueId, userId },
      });
      if (!isParticipant) {
        return;
      }

      try {
        const message = await createDialogueMessage(payload.dialogueId, userId, {
          text: payload.text,
          attachment: payload.attachment,
        });

        const participants = await prisma.dialogueParticipant.findMany({
          where: { dialogueId: payload.dialogueId },
          select: { userId: true },
        });

        await emitNewMessageToParticipants(
          payload.dialogueId,
          message,
          participants.map((participant) => participant.userId),
        );
      } catch (error) {
        console.error("send-message failed:", error);
        // No-op: malformed dialogue state or AI fallback is handled in service.
      }
    });
  });

  return io;
}
