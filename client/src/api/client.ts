import type { Dialogue, Message, User, UserPreview } from "../types/chat";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(body.error ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export const api = {
  register(payload: {
    username: string;
    password: string;
    country: string;
    nativeLang: string;
  }) {
    return apiFetch<User>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  login(payload: { username: string; password: string }) {
    return apiFetch<User>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  me() {
    return apiFetch<User>("/api/auth/me");
  },
  getSocketToken() {
    return apiFetch<{ token: string }>("/api/auth/socket-token");
  },
  logout() {
    return apiFetch<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
  },
  getDialogues() {
    return apiFetch<Dialogue[]>("/api/dialogues");
  },
  createDialogue(participantId: string) {
    return apiFetch<Dialogue>("/api/dialogues", {
      method: "POST",
      body: JSON.stringify({ participantId }),
    });
  },
  randomDialogue() {
    return apiFetch<Dialogue>("/api/dialogues/random", {
      method: "POST",
    });
  },
  searchUsers(query: string) {
    return apiFetch<UserPreview[]>(
      `/api/users/search?q=${encodeURIComponent(query)}`,
    );
  },
  getCountries() {
    return apiFetch<string[]>("/api/users/countries");
  },
  updatePreferences(payload: { allCountries: boolean; countries: string[] }) {
    return apiFetch<User>("/api/users/preferences", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  getMessages(dialogueId: string) {
    return apiFetch<Message[]>(`/api/messages/${dialogueId}`);
  },
  sendMessage(dialogueId: string, text: string) {
    return apiFetch<Message>("/api/messages", {
      method: "POST",
      body: JSON.stringify({ dialogueId, text }),
    });
  },
};
