import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form className="w-full max-w-sm space-y-3 rounded-xl bg-white p-6 shadow" onSubmit={submit}>
        <h1 className="text-2xl font-semibold text-slate-900">Between</h1>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
          placeholder="Username"
          value={form.username}
        />
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          placeholder="Password"
          type="password"
          value={form.password}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          Войти
        </button>
        <p className="text-sm text-slate-600">
          Нет аккаунта?{" "}
          <Link className="text-blue-600 underline" to="/register">
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </div>
  );
}
