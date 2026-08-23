import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { ChatWindow } from "../components/ChatWindow";
import { CountryFilter } from "../components/CountryFilter";
import { DialogueList } from "../components/DialogueList";
import { FindRandomButton } from "../components/FindRandomButton";
import { UserSearch } from "../components/UserSearch";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import { useChatStore } from "../store/useChatStore";

export function ChatPage() {
  const { loading } = useAuth(true);
  const navigate = useNavigate();
  const socket = useSocket();

  const currentUser = useChatStore((state) => state.currentUser);
  const setDialogues = useChatStore((state) => state.setDialogues);
  const setCountries = useChatStore((state) => state.setCountries);
  const setCountryFilter = useChatStore((state) => state.setCountryFilter);
  const clearStore = useChatStore((state) => state.clear);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const [dialogues, countries] = await Promise.all([
        api.getDialogues(),
        api.getCountries(),
      ]);
      if (cancelled) {
        return;
      }
      setDialogues(dialogues);
      setCountries(countries);
      setCountryFilter({
        allCountries: !currentUser?.preferredCountries,
        countries: currentUser?.preferredCountries ?? [],
      });
    }

    if (currentUser) {
      void bootstrap();
    }

    return () => {
      cancelled = true;
    };
  }, [currentUser, setCountries, setCountryFilter, setDialogues]);

  async function logout() {
    await api.logout();
    clearStore();
    navigate("/login");
  }

  if (loading || !currentUser) {
    return <div className="flex min-h-screen items-center justify-center">Загрузка...</div>;
  }

  return (
    <div className="h-screen bg-slate-100 p-3">
      <div className="mx-auto flex h-full max-w-6xl overflow-hidden rounded-xl border border-slate-200 bg-white">
        <aside className="w-[340px] border-r border-slate-200 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-900">{currentUser.username}</p>
              <p className="text-xs text-slate-500">
                {currentUser.country} - {currentUser.nativeLang}
              </p>
            </div>
            <button
              className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700"
              onClick={() => {
                void logout();
              }}
              type="button"
            >
              Выход
            </button>
          </div>
          <UserSearch />
          <div className="mb-3 flex items-center gap-2">
            <FindRandomButton />
            <CountryFilter />
          </div>
          <DialogueList />
        </aside>
        <main className="flex-1">
          <ChatWindow socket={socket} />
        </main>
      </div>
    </div>
  );
}
