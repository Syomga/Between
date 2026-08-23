import { useState } from "react";
import { api } from "../api/client";
import { useChatStore } from "../store/useChatStore";

function mapRandomError(message: string): string {
  switch (message) {
    case "No matching user found for selected countries":
      return "Нет пользователей из выбранных стран. Откройте фильтр стран и включите «Все страны».";
    case "No matching user found":
      return "Собеседник не найден. Расширьте фильтр стран или попросите кого-то зарегистрироваться.";
    case "User not found":
      return "Пользователь не найден. Войдите заново.";
    case "UNAUTHORIZED":
      return "Сессия истекла. Войдите заново.";
    default:
      return message || "Не удалось найти собеседника";
  }
}

export function useFindRandomDialogue() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const upsertDialogue = useChatStore((state) => state.upsertDialogue);
  const setActiveDialogueId = useChatStore((state) => state.setActiveDialogueId);

  async function findRandom() {
    setError(null);
    setLoading(true);
    try {
      const dialogue = await api.randomDialogue();
      upsertDialogue(dialogue);
      setActiveDialogueId(dialogue.id);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Не удалось найти собеседника";
      setError(mapRandomError(message));
    } finally {
      setLoading(false);
    }
  }

  return {
    findRandom,
    loading,
    error,
    clearError: () => setError(null),
  };
}
