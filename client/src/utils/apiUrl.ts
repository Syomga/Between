export function getApiUrl(): string {
  const configured = import.meta.env.VITE_API_URL;
  if (configured) {
    return configured;
  }
  if (import.meta.env.PROD) {
    return "";
  }
  return "http://localhost:4000";
}

export function getSocketUrl(): string {
  const configured = import.meta.env.VITE_API_URL;
  if (configured) {
    return configured;
  }
  if (import.meta.env.PROD && typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:4000";
}
