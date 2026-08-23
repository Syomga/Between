import { create } from "zustand";
import type { Dialogue, Message, User, UserPreview } from "../types/chat";
import { normalizeClientMessage } from "../utils/messageNormalize";

interface ChatState {
  currentUser: User | null;
  dialogues: Dialogue[];
  activeDialogueId: string | null;
  messagesByDialogueId: Record<string, Message[]>;
  searchResults: UserPreview[];
  countries: string[];
  allCountries: boolean;
  selectedCountries: string[];
  socketToken: string | null;
  setCurrentUser: (user: User | null) => void;
  setDialogues: (dialogues: Dialogue[]) => void;
  upsertDialogue: (dialogue: Dialogue) => void;
  setActiveDialogueId: (id: string | null) => void;
  setMessages: (dialogueId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setSearchResults: (users: UserPreview[]) => void;
  setCountries: (countries: string[]) => void;
  setCountryFilter: (payload: { allCountries: boolean; countries: string[] }) => void;
  clear: () => void;
}

function sortDialogues(dialogues: Dialogue[]): Dialogue[] {
  return [...dialogues].sort((a, b) => {
    const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}

export const useChatStore = create<ChatState>((set) => ({
  currentUser: null,
  dialogues: [],
  activeDialogueId: null,
  messagesByDialogueId: {},
  searchResults: [],
  countries: [],
  allCountries: true,
  selectedCountries: [],
  socketToken: null,
  setCurrentUser: (user) =>
    set(() => ({
      currentUser: user,
      allCountries: !user?.preferredCountries,
      selectedCountries: user?.preferredCountries ?? [],
    })),
  setDialogues: (dialogues) =>
    set(() => ({
      dialogues: sortDialogues(dialogues),
    })),
  upsertDialogue: (dialogue) =>
    set((state) => {
      const next = state.dialogues.filter((entry) => entry.id !== dialogue.id);
      return { dialogues: sortDialogues([dialogue, ...next]) };
    }),
  setActiveDialogueId: (id) => set(() => ({ activeDialogueId: id })),
  setMessages: (dialogueId, messages) =>
    set((state) => ({
      messagesByDialogueId: {
        ...state.messagesByDialogueId,
        [dialogueId]: messages.map(normalizeClientMessage),
      },
    })),
  addMessage: (message) =>
    set((state) => {
      if (!message.senderId) {
        return state;
      }

      const normalized = normalizeClientMessage(message);
      const existing = state.messagesByDialogueId[normalized.dialogueId] ?? [];
      const alreadyExists = existing.some((entry) => entry.id === normalized.id);
      const messages = alreadyExists
        ? existing.map((entry) => (entry.id === normalized.id ? normalized : entry))
        : [...existing, normalized];
      return {
        messagesByDialogueId: {
          ...state.messagesByDialogueId,
          [normalized.dialogueId]: messages,
        },
        dialogues: sortDialogues(
          state.dialogues.map((dialogue) =>
            dialogue.id === normalized.dialogueId
              ? {
                  ...dialogue,
                  lastMessage: {
                    id: normalized.id,
                    originalText: normalized.originalText,
                    translatedText: normalized.translatedText,
                    createdAt: normalized.createdAt,
                    senderId: normalized.senderId,
                  },
                }
              : dialogue,
          ),
        ),
      };
    }),
  setSearchResults: (users) => set(() => ({ searchResults: users })),
  setCountries: (countries) => set(() => ({ countries })),
  setCountryFilter: ({ allCountries, countries }) =>
    set(() => ({
      allCountries,
      selectedCountries: countries,
    })),
  clear: () =>
    set(() => ({
      currentUser: null,
      dialogues: [],
      activeDialogueId: null,
      messagesByDialogueId: {},
      searchResults: [],
      countries: [],
      allCountries: true,
      selectedCountries: [],
      socketToken: null,
    })),
}));
