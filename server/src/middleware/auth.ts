import type { NextFunction, Response } from "express";
import { authCookieName, verifyAuthToken } from "../services/authService";
import type { AuthenticatedRequest } from "../types/express";

export function authMiddleware(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
): void {
  const bearer = request.headers.authorization?.startsWith("Bearer ")
    ? request.headers.authorization.replace("Bearer ", "")
    : undefined;
  const token = request.cookies?.[authCookieName] || bearer;

  if (!token) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const decoded = verifyAuthToken(token);
    request.user = {
      userId: decoded.userId,
      username: decoded.username,
    };
    next();
  } catch {
    response.status(401).json({ error: "Unauthorized" });
  }
}
