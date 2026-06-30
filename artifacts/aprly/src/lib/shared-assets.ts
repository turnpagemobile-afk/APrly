/** Public shared assets (copied from design via `pnpm sync-design`). */
export function sharedAsset(path: string): string {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${import.meta.env.BASE_URL}shared/${normalized}`;
}
