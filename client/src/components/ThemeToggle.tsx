import { Moon, Sun } from "lucide-react";
import { cn } from "../utils/cn";
import { useThemeStore } from "../store/useThemeStore";

interface Props {
  className?: string;
  compact?: boolean;
}

export function ThemeToggle({ className, compact = false }: Props) {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === "dark";

  return (
    <button
      className={cn(
        compact
          ? "flex h-9 w-9 items-center justify-center rounded-full tg-text-muted transition tg-hover hover:tg-text"
          : "flex h-12 w-12 items-center justify-center rounded-xl tg-text-muted transition tg-hover hover:tg-text",
        className,
      )}
      onClick={toggleTheme}
      title={isDark ? "Светлая тема" : "Тёмная тема"}
      type="button"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
