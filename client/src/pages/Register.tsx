import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { ThemeToggle } from "../components/ThemeToggle";
import { COUNTRIES, NATIVE_LANGUAGES } from "../constants/localeOptions";
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
    setError(null);

    if (!form.country) {
      setError("Выберите страну");
      return;
    }
    if (!form.nativeLang) {
      setError("Выберите родной язык");
      return;
    }

    setLoading(true);
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
    <div className="relative flex min-h-screen items-center justify-center tg-bg-app p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle compact />
      </div>
      <form
        className="w-full max-w-sm space-y-3 rounded-2xl border tg-card p-6"
        onSubmit={submit}
      >
        <div className="mb-2">
          <h1 className="text-2xl font-semibold tg-text">Регистрация</h1>
          <p className="text-sm tg-text-muted">Укажите страну и родной язык</p>
        </div>
        <input
          className="tg-input w-full rounded-xl px-3 py-2.5"
          onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
          placeholder="Username"
          required
          value={form.username}
        />
        <input
          className="tg-input w-full rounded-xl px-3 py-2.5"
          minLength={6}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          placeholder="Password"
          required
          type="password"
          value={form.password}
        />
        <select
          className="tg-select w-full rounded-xl px-3 py-2.5"
          onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
          required
          value={form.country}
        >
          <option disabled value="">
            Выберите страну
          </option>
          {COUNTRIES.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>
        <select
          className="tg-select w-full rounded-xl px-3 py-2.5"
          onChange={(event) => setForm((prev) => ({ ...prev, nativeLang: event.target.value }))}
          required
          value={form.nativeLang}
        >
          <option disabled value="">
            Выберите родной язык
          </option>
          {NATIVE_LANGUAGES.map((language) => (
            <option key={language.value} value={language.value}>
              {language.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          className="w-full rounded-xl tg-btn-primary px-4 py-2.5 font-medium disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          Создать аккаунт
        </button>
        <p className="text-sm tg-text-muted">
          Уже есть аккаунт?{" "}
          <Link className="tg-text-accent hover:underline" to="/login">
            Войти
          </Link>
        </p>
      </form>
    </div>
  );
}
