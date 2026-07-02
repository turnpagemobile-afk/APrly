import type { RefObject } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
      <div className="space-y-6 bp600:space-y-8">
        <div className="flex w-full flex-col items-center gap-5" role="list">
          {optimizerContent.step1.features.map((feature) => (
            <article
              key={feature.title}
              role="listitem"
              className={cn(
                "relative w-full max-w-full pt-5 pl-5",
                "bp600:max-w-[557px] bp840:max-w-[690px]",
              )}
            >
              <span
                className="pointer-events-none absolute top-0 left-0 h-[70px] w-[70px] rounded-full bg-[var(--secondary-theme-200)]"
                aria-hidden
              />
              <h3 className="relative font-hero-display text-[1.625rem] font-semibold uppercase leading-[1.3] text-[var(--title-beige-color)]">
                {feature.title}
              </h3>
              <p className="relative mt-2 font-hero-body text-xl font-medium leading-[26px] text-[var(--average-text-color)]">
                {feature.body}
              </p>
            </article>
          ))}
        </div>

        <div className="flex justify-center pt-2">
          <Button
            ref={connectButtonRef}
            type="button"
            size="lg"
            disabled={plaidBusy}
            onClick={onPlaidConnect}
            className="h-12 w-full min-w-0 rounded-full bg-[var(--primary-theme-500)] px-10 text-sm font-bold uppercase tracking-wide text-white hover:bg-[var(--primary-theme-600)] bp600:w-auto bp600:min-w-[240px]"
          >
            {optimizerContent.step1.connectPlaid}
          </Button>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-[20px]">
        <div className="flex items-center justify-between bg-[var(--palette-green-forest-green-forest-500)] px-[30px] py-5 text-white">
          <img
            src={sharedAsset("plaid-logo.png")}
            alt="Plaid"
            className="h-5 w-auto object-contain"
            loading="lazy"
          />
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
            <img
              src={sharedAsset("heroicon.svg")}
              alt=""
              className="h-6 w-6"
              aria-hidden
            />
            {optimizerContent.step1.plaidBanner.verified}
          </span>
        </div>
        <p className="bg-[var(--primary-theme-100)] px-[30px] py-5 text-sm leading-relaxed text-[var(--average-text-color)]">
          {optimizerContent.step1.plaidBanner.securityNote}
        </p>
      </div>
    </motion.div>
  );
}
