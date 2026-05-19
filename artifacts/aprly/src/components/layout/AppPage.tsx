import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Layout breakpoint: viewport < 460px = mobile; >= 460px = desktop-like. */
export const LAYOUT = {
  breakpointPx: 460,
} as const;

type AppPageProps = {
  children: ReactNode;
  className?: string;
};

/** Dashboard / cabinet routes — widens to max-w-3xl from 460px up. */
export function CabinetPage({ children, className }: AppPageProps) {
  return <div className={cn("app-page-cabinet", className)}>{children}</div>;
}

/** Landing sections container — max-w-6xl from 460px up. */
export function MarketingPage({ children, className }: AppPageProps) {
  return <div className={cn("app-page-marketing", className)}>{children}</div>;
}

export function cabinetPageClassName(className?: string) {
  return cn("app-page-cabinet", className);
}

export function marketingPageClassName(className?: string) {
  return cn("app-page-marketing", className);
}
