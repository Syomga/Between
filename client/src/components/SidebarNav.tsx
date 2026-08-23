import { LogOut, MessageCircle, Settings } from "lucide-react";
import { cn } from "../utils/cn";
import { ThemeToggle } from "./ThemeToggle";

interface Props {
  onLogout: () => void;
  className?: string;
}

export function SidebarNav({ onLogout, className }: Props) {
  return (
    <nav
      className={cn(
        "flex h-full w-[72px] shrink-0 flex-col items-center border-r tg-border tg-bg-panel py-3",
        className,
      )}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full tg-btn-primary text-sm font-bold">
        B
      </div>

      <button
        className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl tg-bg-active tg-text-accent"
        title="Чаты"
        type="button"
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      <div className="mt-auto flex flex-col items-center gap-2">
        <ThemeToggle />
        <button
          className="flex h-12 w-12 items-center justify-center rounded-xl tg-icon-btn"
          title="Настройки"
          type="button"
        >
          <Settings className="h-5 w-5" />
        </button>
        <button
          className="flex h-12 w-12 items-center justify-center rounded-xl tg-icon-btn hover:text-red-500"
          onClick={onLogout}
          title="Выход"
          type="button"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
}
