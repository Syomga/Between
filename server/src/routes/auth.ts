import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {
  clearAuthCookie,
  hashPassword,
  setAuthCookie,
  signAuthToken,
  verifyPassword,
} from "../services/authService";
import { authMiddleware } from "../middleware/auth";
import type { AuthenticatedRequest } from "../types/express";

const registerSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6).max(128),
  country: z.string().min(2).max(64),
  nativeLang: z.string().min(2).max(64),
});

const loginSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6).max(128),
});

export const authRouter = Router();

authRouter.post("/register", async (request, response, next) => {
  try {
    const payload = registerSchema.parse(request.body);

    const existingUser = await prisma.user.findUnique({
      where: { username: payload.username },
    });
    if (existingUser) {
      response.status(409).json({ error: "Username already exists" });
      return;
    }

    const passwordHash = await hashPassword(payload.password);
    const user = await prisma.user.create({
      data: {
        username: payload.username,
        passwordHash,
        country: payload.country,
        nativeLang: payload.nativeLang,
        preferredCountries: Prisma.JsonNull,
      },
    });

    const token = signAuthToken(user.id, user.username);
    setAuthCookie(response, token);

    response.status(201).json({
      id: user.id,
      username: user.username,
      country: user.country,
      nativeLang: user.nativeLang,
      preferredCountries: user.preferredCountries,
      token,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (request, response, next) => {
  try {
    const payload = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({
      where: { username: payload.username },
    });
    if (!user) {
      response.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isValid = await verifyPassword(payload.password, user.passwordHash);
    if (!isValid) {
      response.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signAuthToken(user.id, user.username);
    setAuthCookie(response, token);

    response.json({
      id: user.id,
      username: user.username,
      country: user.country,
      nativeLang: user.nativeLang,
      preferredCountries: user.preferredCountries,
      token,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", authMiddleware, async (request: AuthenticatedRequest, response) => {
  const userId = request.user?.userId;
  if (!userId) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      country: true,
      nativeLang: true,
      preferredCountries: true,
    },
  });
  if (!user) {
    response.status(404).json({ error: "User not found" });
    return;
  }

  response.json(user);
});

authRouter.get(
  "/socket-token",
  authMiddleware,
  async (request: AuthenticatedRequest, response) => {
    const userId = request.user?.userId;
    if (!userId) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });
    if (!user) {
      response.status(404).json({ error: "User not found" });
      return;
    }

    const token = signAuthToken(userId, user.username);
    response.json({ token });
  },
);

authRouter.post("/logout", (_request, response) => {
  clearAuthCookie(response);
  response.json({ ok: true });
});
