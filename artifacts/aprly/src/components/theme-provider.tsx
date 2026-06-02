import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export interface ThemeProviderProps {
  children: ReactNode;
  /** When set (e.g. landing SPA), overrides stored theme preference. */
  forcedTheme?: "light" | "dark";
}

/**
 * Wraps `next-themes` with the project defaults.
 *
 * - `attribute="class"` toggles the `dark` class on <html>, which our
 *   theme-tokens.css and shadcn aliases key off.
 * - `defaultTheme="dark"` because dark is the priority theme for APRly.
 * - `enableSystem={false}` avoids surprising the user with their OS
 *   preference until we ship a real theme switcher in the UI.
 * - We deliberately do NOT render a toggle yet; switching is possible
 *   programmatically (e.g. for testing) via the `useTheme()` hook.
 */
export function ThemeProvider({ children, forcedTheme }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme={forcedTheme}
      enableSystem={false}
      storageKey="aprly-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
