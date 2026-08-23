export function parsePreferredCountries(value: unknown): string[] | null {
  if (!value || !Array.isArray(value)) {
    return null;
  }

  const list = value.filter((entry): entry is string => typeof entry === "string");
  return list.length > 0 ? list : null;
}
