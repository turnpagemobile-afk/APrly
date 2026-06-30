import { brandContent } from "@/content/landing";
import { sharedAsset } from "@/lib/shared-assets";
import { cn } from "@/lib/utils";

type AuthBrandLogoProps = {
  className?: string;
  size?: "header" | "hero";
  /** When true, render the shared logo image instead of the text mark. */
  useImage?: boolean;
};

export function AuthBrandLogo({
  className,
  size = "hero",
  useImage = true,
}: AuthBrandLogoProps) {
  if (useImage) {
    return (
      <img
        src={sharedAsset("logo.png")}
        alt={brandContent.name}
        className={cn(
          "w-auto object-contain",
          size === "header" ? "h-8" : "mx-auto h-12 bp600:h-14",
          className,
        )}
      />
    );
  }

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
      <span className="text-[var(--primary-theme-500)]">{brandContent.logoApr}</span>
      <span className="text-[var(--neutral-theme-900)]">{brandContent.logoLy}</span>
    </p>
  );
}
