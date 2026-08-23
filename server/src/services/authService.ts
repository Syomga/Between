import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Response } from "express";

const JWT_COOKIE_NAME = "between_token";
const JWT_EXPIRES_IN = "7d";

function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAuthToken(userId: string, username: string): string {
  return jwt.sign({ userId, username }, requireJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyAuthToken(token: string): { userId: string; username: string } {
  return jwt.verify(token, requireJwtSecret()) as { userId: string; username: string };
}

export function setAuthCookie(response: Response, token: string): void {
  response.cookie(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(response: Response): void {
  response.clearCookie(JWT_COOKIE_NAME);
}

export const authCookieName = JWT_COOKIE_NAME;
