import { useState } from "react";
import { api } from "../api/client";
import { useChatStore } from "../store/useChatStore";

export function CountryFilter() {
  const countries = useChatStore((state) => state.countries);
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
        className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        Страны
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-72 rounded-md border border-slate-200 bg-white p-3 shadow-md">
          <label className="mb-2 flex items-center gap-2 text-sm">
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
          <div className="max-h-48 space-y-1 overflow-auto border-t pt-2">
            {countries.map((country) => (
              <label className="flex items-center gap-2 text-sm" key={country}>
                <input
                  checked={allCountries ? false : selectedCountries.includes(country)}
                  disabled={allCountries || saving}
                  onChange={() => {
                    void toggleCountry(country);
                  }}
                  type="checkbox"
                />
                {country}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
