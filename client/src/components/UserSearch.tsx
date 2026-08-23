import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useChatStore } from "../store/useChatStore";

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const searchResults = useChatStore((state) => state.searchResults);
  const setSearchResults = useChatStore((state) => state.setSearchResults);
  const upsertDialogue = useChatStore((state) => state.upsertDialogue);
  const setActiveDialogueId = useChatStore((state) => state.setActiveDialogueId);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const users = await api.searchUsers(query.trim());
        if (!cancelled) {
          setSearchResults(users);
        }
      } catch {
        if (!cancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, setSearchResults]);

  async function createDialogue(participantId: string) {
    const dialogue = await api.createDialogue(participantId);
    upsertDialogue(dialogue);
    setActiveDialogueId(dialogue.id);
    setQuery("");
    setSearchResults([]);
  }

  return (
    <div className="mb-3">
      <input
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Поиск по username"
        value={query}
      />
      {loading && <p className="mt-1 text-xs text-slate-500">Поиск...</p>}
      {searchResults.length > 0 && (
        <div className="mt-2 max-h-44 overflow-auto rounded-md border border-slate-200">
          {searchResults.map((user) => (
            <button
              className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm hover:bg-slate-50"
              key={user.id}
              onClick={() => {
                void createDialogue(user.id);
              }}
              type="button"
            >
              {user.username} - {user.country}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
