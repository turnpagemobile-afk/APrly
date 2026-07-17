import { useState } from "react";
import { easyStepsContent } from "@/content/landing";
import { landingAsset } from "@/lib/landing-assets";
import { cn } from "@/lib/utils";

type Step = (typeof easyStepsContent.steps)[number];

const STEP_IMAGES = ["1.png", "2.png", "3.png"] as const;

/** Native heights of synced `#1` / `#2` / `#3` PNGs (not square-cropped). */
const STEP_NUMBER_CLASS: Record<(typeof STEP_IMAGES)[number], string> = {
  "1.png": "h-[101px] w-auto",
  "2.png": "h-[104px] w-auto",
  "3.png": "h-[104px] w-auto",
};

const ROW_JUSTIFY = ["justify-start", "justify-center", "justify-end"] as const;

const CARD_WIDTH = "w-[83%] min-[600px]:w-[577px] bp840:w-[600px] shrink-0";

function EasyStepCard({
  step,
  image,
  defaultOpen = false,
}: {
  step: Step;
  image: (typeof STEP_IMAGES)[number];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article
      className={cn(
        CARD_WIDTH,
        "rounded-[12px] bg-[#FFF] p-5",
        "shadow-[var(--landing-shadow)]",
      )}
    >
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-4 text-left"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <img
          src={landingAsset(`landing/easy-steps/${image}`)}
          alt=""
          aria-hidden
          className={cn(
            "shrink-0 select-none object-contain",
            STEP_NUMBER_CLASS[image],
          )}
        />
        <h3 className="app-header-h5 text-title min-w-0 flex-1">{step.title}</h3>
        <img
          src={landingAsset(
            open
              ? "landing/faq/faq_chevron_in_circle_up.svg"
              : "landing/easy-steps/arrow-down.svg",
          )}
          alt=""
          aria-hidden
          className="h-8 w-8 shrink-0 select-none"
        />
      </button>

      {open ? (
        <p className="app-text-p1-regular mt-4 text-[var(--neutral-theme-900)]">
          {step.body}
        </p>
      ) : null}
    </article>
  );
}

export function EasyStepsSection() {
  return (
    <section
      id="how"
      className="scroll-mt-24 overflow-x-clip bg-[var(--page-bg)] px-4 py-14 bp840:py-16 bp1200:py-20"
    >
      <div className="app-page-marketing app-page-marketing-content">
        <h2 className="app-header-h3 text-title text-center">
          {easyStepsContent.title}
        </h2>

        <div className="mt-10 flex w-full flex-col gap-5 bp840:mt-14">
          {easyStepsContent.steps.map((step, i) => {
            const image = STEP_IMAGES[i] ?? STEP_IMAGES[0];
            const rowJustify = ROW_JUSTIFY[i] ?? "justify-start";

            return (
              <div
                key={step.number}
                className={cn("flex w-full flex-row", rowJustify)}
              >
                <EasyStepCard step={step} image={image} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
