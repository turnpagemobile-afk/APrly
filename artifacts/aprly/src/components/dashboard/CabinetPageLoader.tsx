import { Loader2 } from "lucide-react";

type CabinetPageLoaderProps = {
  label?: string;
};

/** Full-viewport loader for cabinet routes (visible on dark theme / Android). */
export function CabinetPageLoader({ label = "Loading…" }: CabinetPageLoaderProps) {
  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center gap-2 bg-background text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
