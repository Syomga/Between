import { useState } from "react";
import { Globe2 } from "lucide-react";
import { api } from "../api/client";
import { COUNTRIES } from "../constants/localeOptions";
import { useChatStore } from "../store/useChatStore";

interface Props {
  compact?: boolean;
}

export function CountryFilter({ compact = false }: Props) {
  const allCountries = useChatStore((state) => state.allCountries);
  const selectedCountries = useChatStore((state) => state.selectedCountries);
  const setCountryFilter = useChatStore((state) => state.setCountryFilter);
  const setCurrentUser = useChatStore((state) => state.setCurrentUser);
  const currentUser = useChatStore((state) => state.currentUser);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function saveFilter(nextAllCountries: boolean, nextCountries: string[]) {
    setSaving(true);
    try {
      const user = await api.updatePreferences({
        allCountries: nextAllCountries,
        countries: nextCountries,
      });
      setCountryFilter({ allCountries: nextAllCountries, countries: nextCountries });
      if (currentUser) {
        setCurrentUser({ ...currentUser, preferredCountries: user.preferredCountries });
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleAllCountries(nextValue: boolean) {
    if (nextValue) {
      await saveFilter(true, []);
    } else {
      await saveFilter(false, selectedCountries);
    }
  }

  async function toggleCountry(country: string) {
    const exists = selectedCountries.includes(country);
    const nextCountries = exists
      ? selectedCountries.filter((entry) => entry !== country)
      : [...selectedCountries, country];
    await saveFilter(false, nextCountries);
  }

  return (
    <div className="relative">
      <button
        className={
          compact
            ? "flex h-9 w-9 items-center justify-center rounded-full tg-btn-primary"
            : "rounded-md border tg-border px-3 py-2 text-sm tg-text-muted tg-hover"
        }
        onClick={() => setOpen((value) => !value)}
        title="Страны"
        type="button"
      >
        {compact ? <Globe2 className="h-4 w-4" /> : "Страны"}
      </button>
      {open && (
        <>
          <button
            aria-label="Закрыть"
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            type="button"
          />
          <div className="absolute top-10 right-0 z-20 w-72 rounded-xl border tg-dropdown p-3">
            <p className="mb-2 text-sm font-medium tg-text">Предпочитаемые страны</p>
            <label className="mb-2 flex items-center gap-2 text-sm tg-text-muted">
              <input
                checked={allCountries}
                disabled={saving}
                onChange={(event) => {
                  void toggleAllCountries(event.target.checked);
                }}
                type="checkbox"
              />
              Все страны
            </label>
            <div className="tg-scroll max-h-48 space-y-1 overflow-auto border-t tg-border pt-2">
              {COUNTRIES.map((country) => (
                <label className="flex items-center gap-2 text-sm tg-text-muted" key={country.value}>
                  <input
                    checked={allCountries ? false : selectedCountries.includes(country.value)}
                    disabled={allCountries || saving}
                    onChange={() => {
                      void toggleCountry(country.value);
                    }}
                    type="checkbox"
                  />
                  {country.label}
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
