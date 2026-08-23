import { useState } from "react";
import { api } from "../api/client";
import { useChatStore } from "../store/useChatStore";

export function FindRandomButton() {
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
      setError(requestError instanceof Error ? requestError.message : "Failed to find user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
        disabled={loading}
        onClick={() => {
          void findRandom();
        }}
        type="button"
      >
        Найти случайного
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
