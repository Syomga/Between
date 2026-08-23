import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import type { AuthenticatedRequest } from "../types/express";
import { createDialogueMessage } from "../services/messageService";
import { emitNewMessage } from "../socket/realtime";

const createMessageSchema = z.object({
  dialogueId: z.string().min(1),
  text: z.string().trim().min(1).max(4000),
});

const paramsSchema = z.object({
  dialogueId: z.string().min(1),
});

export const messagesRouter = Router();
messagesRouter.use(authMiddleware);

messagesRouter.get("/:dialogueId", async (request: AuthenticatedRequest, response, next) => {
  try {
    const userId = request.user?.userId;
    if (!userId) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { dialogueId } = paramsSchema.parse(request.params);
    const participant = await prisma.dialogueParticipant.findFirst({
      where: { dialogueId, userId },
    });
    if (!participant) {
      response.status(403).json({ error: "Forbidden" });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { dialogueId },
      orderBy: { createdAt: "asc" },
    });

    response.json(messages);
  } catch (error) {
    next(error);
  }
});

messagesRouter.post("/", async (request: AuthenticatedRequest, response, next) => {
  try {
    const userId = request.user?.userId;
    if (!userId) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    const payload = createMessageSchema.parse(request.body);
    const participant = await prisma.dialogueParticipant.findFirst({
      where: { dialogueId: payload.dialogueId, userId },
    });
    if (!participant) {
      response.status(403).json({ error: "Forbidden" });
      return;
    }

    const message = await createDialogueMessage(payload.dialogueId, userId, payload.text);
    emitNewMessage(payload.dialogueId, message);

    response.status(201).json(message);
  } catch (error) {
    next(error);
  }
});
