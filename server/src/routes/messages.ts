import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { uploadAttachment } from "../middleware/upload";
import { prisma } from "../lib/prisma";
import type { AuthenticatedRequest } from "../types/express";
import { buildAttachmentFromFile, createDialogueMessage } from "../services/messageService";
import { enrichMessageForViewer, enrichMessagesForViewer } from "../services/messageTranslation";
import { serializeMessage } from "../lib/messageSerializer";
import { emitNewMessageToParticipants } from "../socket/realtime";

const attachmentSchema = z.object({
  url: z.string().min(1),
  name: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(128),
  size: z.number().int().positive().max(10 * 1024 * 1024),
});

const createMessageSchema = z
  .object({
    dialogueId: z.string().min(1),
    text: z.string().trim().max(4000).optional(),
    attachment: attachmentSchema.optional(),
  })
  .refine((payload) => Boolean(payload.text?.trim()) || payload.attachment, {
    message: "Message must include text or attachment",
  });

const paramsSchema = z.object({
  dialogueId: z.string().min(1),
});

export const messagesRouter = Router();
messagesRouter.use(authMiddleware);

messagesRouter.post("/upload", (request: AuthenticatedRequest, response, next) => {
  uploadAttachment(request, response, (error) => {
    if (error) {
      response.status(400).json({ error: error.message || "Upload failed" });
      return;
    }

    const file = request.file;
    if (!file) {
      response.status(400).json({ error: "No file provided" });
      return;
    }

    response.status(201).json(
      buildAttachmentFromFile(file.filename, file.originalname, file.mimetype, file.size),
    );
  });
});

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

    const viewer = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nativeLang: true },
    });
    if (!viewer) {
      response.status(404).json({ error: "User not found" });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { dialogueId },
      orderBy: { createdAt: "asc" },
    });

    const enriched = await enrichMessagesForViewer(messages, viewer);
    response.json(enriched);
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

    const viewer = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nativeLang: true },
    });

    const responseMessage = viewer
      ? await enrichMessageForViewer(message, viewer)
      : serializeMessage(message);

    response.status(201).json(responseMessage);
  } catch (error) {
    next(error);
  }
});
