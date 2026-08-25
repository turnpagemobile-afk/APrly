import type { RefObject } from "react";
import { motion } from "framer-motion";
import { PillButton } from "@/components/shared/PillButton";
import { optimizerContent } from "@/content/landing";
import { sharedAsset } from "@/lib/shared-assets";
import { cn } from "@/lib/utils";

export interface OptimizerStep1Props {
  onPlaidConnect: () => void;
  plaidBusy?: boolean;
  connectButtonRef?: RefObject<HTMLButtonElement | null>;
}

export function OptimizerStep1({
  onPlaidConnect,
  plaidBusy = false,
  connectButtonRef,
}: OptimizerStep1Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col"
    >
      <div className="flex justify-center pt-2">
        <PillButton
          ref={connectButtonRef}
          type="button"
          variant="primary"
          size="xxl"
          disabled={plaidBusy}
          onClick={onPlaidConnect}
          className="h-[104px] w-[420px] max-w-full px-7"
        >
          {optimizerContent.step1.connectPlaid}
        </PillButton>
      </div>

      <div
        className={cn(
          "mx-auto mt-8 w-full max-w-[698px] overflow-hidden rounded-[20px] border border-[var(--primary-theme-200)] px-[30px] py-5",
          "bg-[linear-gradient(0deg,var(--primary-theme-050),var(--primary-theme-050)),radial-gradient(100%_100%_at_100%_0%,rgba(16,185,129,0.1)_0%,rgba(16,185,129,0)_100%)]",
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <img
            src={sharedAsset("plaid-logo.png")}
            alt="Plaid"
            className="h-10 w-[106px] object-contain"
            loading="lazy"
          />
          <span className="flex items-center gap-1.5">
            <img
              src={sharedAsset("checked-circle.svg")}
              alt=""
              className="h-6 w-6"
              aria-hidden
            />
            <span
              className="text-[22px] font-extrabold uppercase leading-9 text-[var(--primary-theme-600)]"
              style={{ fontFamily: "var(--app-font-bricolage)" }}
            >
              {optimizerContent.step1.plaidBanner.verified}
            </span>
          </span>
        </div>
        <p className="app-text-p1-regular text-average mt-4">
          {optimizerContent.step1.plaidBanner.securityNote}
        </p>
      </div>
    </motion.div>
  );
}
