import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useChatStore } from "../store/useChatStore";

export function RegisterPage() {
  const navigate = useNavigate();
  const setCurrentUser = useChatStore((state) => state.setCurrentUser);
  const [form, setForm] = useState({
    username: "",
    password: "",
    country: "",
    nativeLang: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await api.register(form);
      setCurrentUser(user);
      navigate("/");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form className="w-full max-w-sm space-y-3 rounded-xl bg-white p-6 shadow" onSubmit={submit}>
        <h1 className="text-2xl font-semibold text-slate-900">Регистрация Between</h1>
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
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
          placeholder="Country"
          value={form.country}
        />
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          onChange={(event) => setForm((prev) => ({ ...prev, nativeLang: event.target.value }))}
          placeholder="Native language"
          value={form.nativeLang}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          Создать аккаунт
        </button>
        <p className="text-sm text-slate-600">
          Уже есть аккаунт?{" "}
          <Link className="text-blue-600 underline" to="/login">
            Войти
          </Link>
        </p>
      </form>
    </div>
  );
}
