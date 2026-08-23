import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api } from "../api/client";
import { useChatStore } from "../store/useChatStore";
import { avatarColor, avatarInitial } from "../utils/avatar";

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
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 tg-text-subtle" />
        <input
          className="tg-input w-full rounded-xl py-2.5 pr-3 pl-9 text-sm"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск"
          value={query}
        />
      </div>
      {loading && <p className="mt-1 px-1 text-xs tg-text-subtle">Поиск...</p>}
      {searchResults.length > 0 && (
        <div className="mt-2 max-h-52 overflow-auto rounded-xl border tg-dropdown">
          {searchResults.map((user) => (
            <button
              className="flex w-full items-center gap-3 border-b tg-border px-3 py-2.5 text-left transition last:border-b-0 tg-hover"
              key={user.id}
              onClick={() => {
                void createDialogue(user.id);
              }}
              type="button"
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: avatarColor(user.username) }}
              >
                {avatarInitial(user.username)}
              </div>
              <div>
                <p className="text-sm font-medium tg-text">{user.username}</p>
                <p className="text-xs tg-text-muted">
                  {user.country} · {user.nativeLang}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
