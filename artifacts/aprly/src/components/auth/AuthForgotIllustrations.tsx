import { cn } from "@/lib/utils";

type IllustrationProps = {
  className?: string;
};

function IllustrationBackdrop({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative mx-auto flex h-[120px] w-[200px] items-center justify-center", className)}>
      <div
        className="absolute left-6 top-4 h-14 w-20 rounded-full opacity-60"
        style={{ background: "var(--info-theme-100, #E8F4FC)" }}
        aria-hidden
      />
      <div
        className="absolute right-4 top-8 h-10 w-16 rounded-full opacity-50"
        style={{ background: "var(--info-theme-100, #E8F4FC)" }}
        aria-hidden
      />
      {children}
    </div>
  );
}

export function AuthForgotLockIllustration({ className }: IllustrationProps) {
  return (
    <IllustrationBackdrop className={className}>
      <svg
        width="72"
        height="88"
        viewBox="0 0 72 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
        aria-hidden
      >
        <path
          d="M20 36V28C20 16.9543 28.9543 8 40 8C51.0457 8 60 16.9543 60 28V36"
          stroke="var(--action-default-color, #4A90E2)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <rect
          x="12"
          y="36"
          width="56"
          height="44"
          rx="10"
          fill="var(--info-theme-100, #E8F4FC)"
          stroke="var(--action-default-color, #4A90E2)"
          strokeWidth="3"
        />
        <text
          x="40"
          y="66"
          textAnchor="middle"
          fill="var(--action-default-color, #4A90E2)"
          fontSize="18"
          fontWeight="700"
          fontFamily="var(--app-font-display, sans-serif)"
        >
          ***
        </text>
      </svg>
    </IllustrationBackdrop>
  );
}

export function AuthForgotEmailIllustration({ className }: IllustrationProps) {
  return (
    <IllustrationBackdrop className={className}>
      <svg
        width="88"
        height="64"
        viewBox="0 0 88 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
        aria-hidden
      >
        <rect
          x="8"
          y="12"
          width="72"
          height="44"
          rx="8"
          fill="var(--info-theme-100, #E8F4FC)"
          stroke="var(--action-default-color, #4A90E2)"
          strokeWidth="3"
        />
        <path
          d="M8 20L44 42L80 20"
          stroke="var(--action-default-color, #4A90E2)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </IllustrationBackdrop>
  );
}
