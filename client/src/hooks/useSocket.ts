import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { api } from "../api/client";
import { useChatStore } from "../store/useChatStore";
import type { Dialogue, Message } from "../types/chat";

import { getSocketUrl } from "../utils/apiUrl";

const SOCKET_URL = getSocketUrl();

export function useSocket(): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);
  const currentUser = useChatStore((state) => state.currentUser);
  const dialogues = useChatStore((state) => state.dialogues);
  const upsertDialogue = useChatStore((state) => state.upsertDialogue);
  const addMessage = useChatStore((state) => state.addMessage);

  useEffect(() => {
    if (!currentUser) {
      setSocket(null);
      return;
    }

    let active = true;
    let nextSocket: Socket | null = null;

    async function connect() {
      try {
        const { token } = await api.getSocketToken();
        if (!active) {
          return;
        }

        nextSocket = io(SOCKET_URL, {
          query: { token },
        });

        nextSocket.on("connect", () => {
          const ids = useChatStore.getState().dialogues.map((dialogue) => dialogue.id);
          nextSocket?.emit("join-dialogues", ids);
        });

        nextSocket.on("new-dialogue", (dialogue: Dialogue) => {
          upsertDialogue(dialogue);
          nextSocket?.emit("join-dialogues", [dialogue.id]);
        });

        nextSocket.on("new-message", (message: Message) => {
          if (!message?.senderId) {
            return;
          }
          addMessage(message);
        });

        setSocket(nextSocket);
      } catch {
        if (active) {
          setSocket(null);
        }
      }
    }

    void connect();
    return () => {
      active = false;
      nextSocket?.disconnect();
      setSocket(null);
    };
  }, [addMessage, currentUser?.id, upsertDialogue]);

  useEffect(() => {
    if (!socket || !dialogues.length) {
      return;
    }

    socket.emit(
      "join-dialogues",
      dialogues.map((dialogue) => dialogue.id),
    );
  }, [dialogues, socket]);

  return socket;
}
