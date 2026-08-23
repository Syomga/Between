import type { Dialogue, Message, MessageAttachment, User, UserPreview } from "../types/chat";
import { getApiUrl } from "../utils/apiUrl";

const API_URL = getApiUrl();

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
  uploadAttachment(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${API_URL}/api/messages/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    }).then(async (response) => {
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }
      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(body.error ?? "Upload failed");
      }
      return response.json() as Promise<MessageAttachment>;
    });
  },
  sendMessage(
    dialogueId: string,
    payload: { text?: string; attachment?: MessageAttachment },
  ) {
    return apiFetch<Message>("/api/messages", {
      method: "POST",
      body: JSON.stringify({ dialogueId, ...payload }),
    });
  },
};
