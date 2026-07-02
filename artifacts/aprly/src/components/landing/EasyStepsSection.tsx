import { easyStepsContent } from "@/content/landing";
import { landingAsset } from "@/lib/landing-assets";
import { cn } from "@/lib/utils";

type Step = (typeof easyStepsContent.steps)[number];

const STEP_IMAGES = ["1.png", "2.png", "3.png"] as const;

const ROW_JUSTIFY = ["justify-start", "justify-center", "justify-end"] as const;

const CARD_WIDTH =
  "w-[83%] min-[600px]:w-[577px] bp840:w-[600px] shrink-0";

function EasyStepCard({
  step,
  image,
  protrudeImage = false,
}: {
  step: Step;
  image: string;
  protrudeImage?: boolean;
}) {
  return (
    <article
      className={cn(
        CARD_WIDTH,
        "relative",
        protrudeImage ? "max-[599px]:overflow-hidden" : undefined,
      )}
    >
      <img
        src={landingAsset(`landing/easy-steps/${image}`)}
        alt=""
        aria-hidden
        className={cn(
          "pointer-events-none absolute right-0 top-0 h-auto w-auto max-w-[45%] select-none",
          protrudeImage &&
            "bp600:-translate-y-1/2 max-[599px]:translate-y-0",
        )}
      />
      <div className="relative z-10 text-left">
        <h3 className="app-header-h4 text-action">{step.title}</h3>
        <p className="app-header-subheadline-regular text-average mt-4">
          {step.body}
        </p>
      </div>
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

        <div className="mt-10 flex w-full flex-col bp840:mt-14">
          {easyStepsContent.steps.map((step, i) => {
            const rowJustify = ROW_JUSTIFY[i] ?? "justify-start";
            const image = STEP_IMAGES[i] ?? STEP_IMAGES[0];
            const protrudeImage = i === 1;

            return (
              <div
                key={step.number}
                className={cn(
                  "flex w-full flex-row",
                  rowJustify,
                  i > 0 && "mt-12 bp840:mt-16",
                  i === 1 && "max-[599px]:mt-0",
                  protrudeImage && "overflow-visible bp600:pt-16",
                )}
              >
                <EasyStepCard
                  step={step}
                  image={image}
                  protrudeImage={protrudeImage}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
