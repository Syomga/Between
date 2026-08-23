import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { api } from "../api/client";
import { useChatStore } from "../store/useChatStore";
import type { Dialogue, Message } from "../types/chat";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function useSocket(): Socket | null {
  const socketRef = useRef<Socket | null>(null);
  const currentUser = useChatStore((state) => state.currentUser);
  const dialogues = useChatStore((state) => state.dialogues);
  const upsertDialogue = useChatStore((state) => state.upsertDialogue);
  const addMessage = useChatStore((state) => state.addMessage);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    let active = true;

    async function connect() {
      try {
        const { token } = await api.getSocketToken();
        if (!active) {
          return;
        }

        const socket = io(SOCKET_URL, {
          query: { token },
        });

        socket.on("connect", () => {
          const ids = useChatStore.getState().dialogues.map((dialogue) => dialogue.id);
          socket.emit("join-dialogues", ids);
        });

        socket.on("new-dialogue", (dialogue: Dialogue) => {
          upsertDialogue(dialogue);
          socket.emit("join-dialogues", [dialogue.id]);
        });

        socket.on("new-message", (message: Message) => {
          addMessage(message);
        });

        socketRef.current = socket;
      } catch {
        socketRef.current = null;
      }
    }

    void connect();
    return () => {
      active = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [addMessage, currentUser, upsertDialogue]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !dialogues.length) {
      return;
    }

    socket.emit(
      "join-dialogues",
      dialogues.map((dialogue) => dialogue.id),
    );
  }, [dialogues]);

  return socketRef.current;
}
