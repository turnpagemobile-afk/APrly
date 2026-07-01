/** Public admin assets (copied from design via `pnpm sync-design`). */
export function adminAsset(path: string): string {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${import.meta.env.BASE_URL}admin/${normalized}`;
}
