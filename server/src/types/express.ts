import type { Request } from "express";

export interface AuthUser {
  userId: string;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}
