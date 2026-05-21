const STORAGE_KEY = "aprly_guest_sid";

export function getOrCreateGuestSessionId(): string {
  if (typeof localStorage === "undefined") {
    return crypto.randomUUID();
  }
  const existing = localStorage.getItem(STORAGE_KEY)?.trim();
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}

export function readGuestSessionId(): string | null {
  if (typeof localStorage === "undefined") return null;
  const id = localStorage.getItem(STORAGE_KEY)?.trim();
  return id || null;
}
