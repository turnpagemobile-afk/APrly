/** Public landing assets (copied from design via `pnpm sync-design`). */
export function landingAsset(path: string): string {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${import.meta.env.BASE_URL}${normalized}`;
}
