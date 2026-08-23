import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { prisma } from "../lib/prisma";
import { verifyAuthToken } from "../services/authService";
import { attachIO, emitNewMessage, getDialogueRoom, getUserRoom } from "./realtime";
import { createDialogueMessage } from "../services/messageService";

interface SendMessagePayload {
  dialogueId: string;
  text: string;
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
      if (!payload?.dialogueId || !payload?.text?.trim()) {
        return;
      }

      const isParticipant = await prisma.dialogueParticipant.findFirst({
        where: { dialogueId: payload.dialogueId, userId },
      });
      if (!isParticipant) {
        return;
      }

      try {
        const message = await createDialogueMessage(payload.dialogueId, userId, payload.text);
        emitNewMessage(payload.dialogueId, message);
      } catch {
        // No-op: malformed dialogue state or AI fallback is handled in service.
      }
    });
  });

  return io;
}
