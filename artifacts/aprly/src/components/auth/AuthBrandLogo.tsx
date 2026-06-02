import { brandContent } from "@/content/landing";
import { cn } from "@/lib/utils";

type AuthBrandLogoProps = {
  className?: string;
  size?: "header" | "hero";
};

export function AuthBrandLogo({ className, size = "hero" }: AuthBrandLogoProps) {
  return (
    <p
      className={cn(
        "font-black tracking-tight",
        size === "header"
          ? "text-2xl text-left cabinet:text-2xl"
          : "text-center text-4xl cabinet:text-5xl",
        className,
      )}
    >
      <span className="text-primary">{brandContent.logoApr}</span>
      <span className="text-[var(--neutral-theme-900)]">{brandContent.logoLy}</span>
    </p>
  );
}
