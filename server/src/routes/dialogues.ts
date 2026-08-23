import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import type { AuthenticatedRequest } from "../types/express";
import { parsePreferredCountries } from "../lib/preferences";
import { findRandomMatchCandidate } from "../lib/randomMatch";
import { emitDialogueToUser } from "../socket/realtime";

const createDialogueSchema = z.object({
  participantId: z.string().min(1),
});

function dialogueToView(
  dialogue: {
    id: string;
    participants: Array<{
      user: {
        id: string;
        username: string;
        country: string;
        nativeLang: string;
      };
      userId: string;
    }>;
    messages?: Array<{
      id: string;
      originalText: string;
      translatedText: string | null;
      createdAt: Date;
      senderId: string;
    }>;
  },
  currentUserId: string,
) {
  const peer = dialogue.participants.find((participant) => participant.userId !== currentUserId)?.user;
  return {
    id: dialogue.id,
    peer,
    lastMessage: dialogue.messages?.[0] ?? null,
  };
}

export const dialoguesRouter = Router();
dialoguesRouter.use(authMiddleware);

dialoguesRouter.get("/", async (request: AuthenticatedRequest, response, next) => {
  try {
    const userId = request.user?.userId;
    if (!userId) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    const dialogues = await prisma.dialogue.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                country: true,
                nativeLang: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    response.json(dialogues.map((dialogue: (typeof dialogues)[number]) => dialogueToView(dialogue, userId)));
  } catch (error) {
    next(error);
  }
});

dialoguesRouter.post("/", async (request: AuthenticatedRequest, response, next) => {
  try {
    const userId = request.user?.userId;
    if (!userId) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    const payload = createDialogueSchema.parse(request.body);
    if (payload.participantId === userId) {
      response.status(400).json({ error: "Cannot create dialogue with yourself" });
      return;
    }

    const existing = await prisma.dialogue.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: payload.participantId } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                country: true,
                nativeLang: true,
              },
            },
          },
        },
      },
    });

    if (existing && existing.participants.length === 2) {
      const normalized = dialogueToView(existing, userId);
      response.json(normalized);
      return;
    }

    const created = await prisma.dialogue.create({
      data: {
        participants: {
          create: [{ userId }, { userId: payload.participantId }],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                country: true,
                nativeLang: true,
              },
            },
          },
        },
      },
    });

    const creatorView = dialogueToView(created, userId);
    const participantView = dialogueToView(created, payload.participantId);

    emitDialogueToUser(userId, creatorView);
    emitDialogueToUser(payload.participantId, participantView);

    response.status(201).json(creatorView);
  } catch (error) {
    next(error);
  }
});

dialoguesRouter.post("/random", async (request: AuthenticatedRequest, response, next) => {
  try {
    const userId = request.user?.userId;
    if (!userId) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        nativeLang: true,
        preferredCountries: true,
      },
    });
    if (!me) {
      response.status(404).json({ error: "User not found" });
      return;
    }

    const preferredCountries = parsePreferredCountries(me.preferredCountries);
    const candidate = await findRandomMatchCandidate(userId, me);

    if (!candidate) {
      response.status(404).json({
        error:
          preferredCountries && preferredCountries.length > 0
            ? "No matching user found for selected countries"
            : "No matching user found",
      });
      return;
    }

    const existing = await prisma.dialogue.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: candidate.id } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                country: true,
                nativeLang: true,
              },
            },
          },
        },
      },
    });

    if (existing && existing.participants.length === 2) {
      response.json(dialogueToView(existing, userId));
      return;
    }

    const dialogue = await prisma.dialogue.create({
      data: {
        participants: {
          create: [{ userId }, { userId: candidate.id }],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                country: true,
                nativeLang: true,
              },
            },
          },
        },
      },
    });

    const creatorView = dialogueToView(dialogue, userId);
    const participantView = dialogueToView(dialogue, candidate.id);

    emitDialogueToUser(userId, creatorView);
    emitDialogueToUser(candidate.id, participantView);
    response.status(201).json(creatorView);
  } catch (error) {
    next(error);
  }
});
