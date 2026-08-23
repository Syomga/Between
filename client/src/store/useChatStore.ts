import { create } from "zustand";
import type { Dialogue, Message, User, UserPreview } from "../types/chat";

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
        [dialogueId]: messages,
      },
    })),
  addMessage: (message) =>
    set((state) => {
      const existing = state.messagesByDialogueId[message.dialogueId] ?? [];
      const alreadyExists = existing.some((entry) => entry.id === message.id);
      const messages = alreadyExists ? existing : [...existing, message];
      return {
        messagesByDialogueId: {
          ...state.messagesByDialogueId,
          [message.dialogueId]: messages,
        },
        dialogues: sortDialogues(
          state.dialogues.map((dialogue) =>
            dialogue.id === message.dialogueId
              ? {
                  ...dialogue,
                  lastMessage: {
                    id: message.id,
                    originalText: message.originalText,
                    translatedText: message.translatedText,
                    createdAt: message.createdAt,
                    senderId: message.senderId,
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
