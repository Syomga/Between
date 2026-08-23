import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import type { AuthenticatedRequest } from "../types/express";
import { parsePreferredCountries } from "../lib/preferences";

const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(64),
});

export const usersRouter = Router();

usersRouter.use(authMiddleware);

usersRouter.get("/search", async (request: AuthenticatedRequest, response, next) => {
  try {
    const userId = request.user?.userId;
    if (!userId) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    const parsed = searchQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      response.json([]);
      return;
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferredCountries: true },
    });

    const preferredCountries = parsePreferredCountries(currentUser?.preferredCountries ?? null);

    const results = await prisma.user.findMany({
      where: {
        id: { not: userId },
        username: {
          contains: parsed.data.q,
        },
        ...(preferredCountries
          ? {
              country: {
                in: preferredCountries,
              },
            }
          : {}),
      },
      select: {
        id: true,
        username: true,
        country: true,
        nativeLang: true,
      },
      take: 20,
      orderBy: { username: "asc" },
    });

    response.json(results);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/countries", async (_request, response, next) => {
  try {
    const countries = await prisma.user.findMany({
      distinct: ["country"],
      select: { country: true },
      orderBy: { country: "asc" },
    });
    response.json(countries.map((entry: { country: string }) => entry.country));
  } catch (error) {
    next(error);
  }
});
