import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import type { AuthenticatedRequest } from "../types/express";

const updatePreferencesSchema = z.object({
  allCountries: z.boolean(),
  countries: z.array(z.string().min(2).max(64)).max(100).default([]),
});

export const preferencesRouter = Router();

preferencesRouter.use(authMiddleware);

preferencesRouter.put("/", async (request: AuthenticatedRequest, response, next) => {
  try {
    const userId = request.user?.userId;
    if (!userId) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    const payload = updatePreferencesSchema.parse(request.body);
    const preferredCountries =
      payload.allCountries || payload.countries.length === 0
        ? Prisma.JsonNull
        : (payload.countries as Prisma.InputJsonValue);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { preferredCountries },
      select: {
        id: true,
        username: true,
        country: true,
        nativeLang: true,
        preferredCountries: true,
      },
    });

    response.json(updated);
  } catch (error) {
    next(error);
  }
});
