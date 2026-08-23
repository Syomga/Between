import { useEffect } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { ChatWindow } from "../components/ChatWindow";
import { CountryFilter } from "../components/CountryFilter";
import { DialogueList } from "../components/DialogueList";
import { FindRandomButton } from "../components/FindRandomButton";
import { SidebarNav } from "../components/SidebarNav";
import { ThemeToggle } from "../components/ThemeToggle";
import { UserSearch } from "../components/UserSearch";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import { useChatStore } from "../store/useChatStore";
import { avatarColor, avatarInitial } from "../utils/avatar";
import { cn } from "../utils/cn";

export function ChatPage() {
  const { loading } = useAuth(true);
  const navigate = useNavigate();
  useSocket();

  const currentUser = useChatStore((state) => state.currentUser);
  const activeDialogueId = useChatStore((state) => state.activeDialogueId);
  const setActiveDialogueId = useChatStore((state) => state.setActiveDialogueId);
  const setDialogues = useChatStore((state) => state.setDialogues);
  const setCountryFilter = useChatStore((state) => state.setCountryFilter);
  const clearStore = useChatStore((state) => state.clear);

  const mobileChatOpen = Boolean(activeDialogueId);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const dialogues = await api.getDialogues();
      if (cancelled) {
        return;
      }
      setDialogues(dialogues);
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
  }, [currentUser, setCountryFilter, setDialogues]);

  async function logout() {
    try {
      await api.logout();
    } catch {
      // Clear local session even if the server request fails.
    } finally {
      clearStore();
      navigate("/login", { replace: true });
    }
  }

  if (loading || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center tg-bg-app tg-text-muted">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden tg-bg-app">
      <SidebarNav className="hidden md:flex" onLogout={() => void logout()} />

      <aside
        className={cn(
          "flex min-w-0 flex-col border-r tg-border tg-bg-panel",
          "w-full md:w-[360px] md:shrink-0",
          mobileChatOpen && "hidden md:flex",
        )}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-3 md:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full tg-btn-primary text-sm font-bold md:hidden">
              B
            </div>
            <h1 className="truncate text-lg font-semibold tg-text md:text-xl">Чаты</h1>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
            <ThemeToggle className="md:hidden" compact />
            <FindRandomButton compact />
            <CountryFilter compact />
          </div>
        </div>

        <div className="px-3 pb-2">
          <UserSearch />
        </div>

        <div className="tg-scroll min-h-0 flex-1 overflow-y-auto">
          <DialogueList />
        </div>

        <div className="flex items-center gap-3 border-t tg-border px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] md:px-4 md:py-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: avatarColor(currentUser.username) }}
          >
            {avatarInitial(currentUser.username)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium tg-text">{currentUser.username}</p>
            <p className="truncate text-xs tg-text-muted">
              {currentUser.country} · {currentUser.nativeLang}
            </p>
          </div>
          <button
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm tg-text-muted transition tg-hover hover:text-red-500"
            onClick={() => void logout()}
            title="Выйти из аккаунта"
            type="button"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Выход</span>
          </button>
        </div>
      </aside>

      <main
        className={cn(
          "min-h-0 min-w-0 flex-1",
          !mobileChatOpen && "hidden md:block",
          mobileChatOpen && "fixed inset-0 z-20 md:static md:z-auto",
        )}
      >
        <ChatWindow onBack={() => setActiveDialogueId(null)} />
      </main>
    </div>
  );
}
