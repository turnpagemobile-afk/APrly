import { sharedAsset } from "@/lib/shared-assets";
import { cn } from "@/lib/utils";

type IllustrationProps = {
  className?: string;
};

export function AuthForgotLockIllustration({ className }: IllustrationProps) {
  return (
    <div className={cn("mx-auto flex justify-center", className)}>
      <img
        src={sharedAsset("locked.png")}
        alt=""
        className="h-auto w-[160px] max-w-full object-contain"
        aria-hidden
      />
    </div>
  );
}

export function AuthForgotEmailIllustration({ className }: IllustrationProps) {
  return (
    <div className={cn("mx-auto flex justify-center", className)}>
      <img
        src={sharedAsset("email_back.png")}
        alt=""
        className="h-auto w-[160px] max-w-full object-contain"
        aria-hidden
      />
    </div>
  );
}
