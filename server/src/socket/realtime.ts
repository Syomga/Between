import type { Server } from "socket.io";

let io: Server | null = null;

export function attachIO(server: Server): void {
  io = server;
}

export function getDialogueRoom(dialogueId: string): string {
  return `dialogue:${dialogueId}`;
}

export function getUserRoom(userId: string): string {
  return `user:${userId}`;
}

export function emitNewDialogue(userIds: string[], payload: unknown): void {
  if (!io) {
    return;
  }
  for (const userId of userIds) {
    io.to(getUserRoom(userId)).emit("new-dialogue", payload);
  }
}

export function emitDialogueToUser(userId: string, payload: unknown): void {
  if (!io) {
    return;
  }
  io.to(getUserRoom(userId)).emit("new-dialogue", payload);
}

export function emitNewMessage(dialogueId: string, payload: unknown): void {
  if (!io) {
    return;
  }
  io.to(getDialogueRoom(dialogueId)).emit("new-message", payload);
}
