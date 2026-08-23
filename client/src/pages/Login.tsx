import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { ThemeToggle } from "../components/ThemeToggle";
import { useChatStore } from "../store/useChatStore";

export function LoginPage() {
  const navigate = useNavigate();
  const setCurrentUser = useChatStore((state) => state.setCurrentUser);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await api.login(form);
      setCurrentUser(user);
      navigate("/");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center tg-bg-app p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle compact />
      </div>
      <form
        className="w-full max-w-sm space-y-3 rounded-2xl border tg-card p-6"
        onSubmit={submit}
      >
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full tg-btn-primary text-lg font-bold">
            B
          </div>
          <div>
            <h1 className="text-2xl font-semibold tg-text">Between</h1>
            <p className="text-sm tg-text-muted">Международное общение на своём языке</p>
          </div>
        </div>
        <input
          className="tg-input w-full rounded-xl px-3 py-2.5"
          onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
          placeholder="Username"
          value={form.username}
        />
        <input
          className="tg-input w-full rounded-xl px-3 py-2.5"
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          placeholder="Password"
          type="password"
          value={form.password}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          className="w-full rounded-xl tg-btn-primary px-4 py-2.5 font-medium disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          Войти
        </button>
        <p className="text-sm tg-text-muted">
          Нет аккаунта?{" "}
          <Link className="tg-text-accent hover:underline" to="/register">
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </div>
  );
}
