import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqContent, type FaqContent } from "@/content/landing";
import { landingAsset } from "@/lib/landing-assets";
import { cn } from "@/lib/utils";

const FAQ_TWO_COL_MQ = "(min-width: 1200px)";

type FaqItem = FaqContent["items"][number];

type FaqSectionProps = {
  content?: FaqContent;
  className?: string;
};

function FaqAccordionCard({ item }: { item: FaqItem }) {
  return (
    <AccordionItem
      value={item.id}
      className="overflow-hidden rounded-xl border border-[var(--card-border-color)] border-b-0 bg-[var(--card-1lvl-bg-color)] px-4"
    >
      <AccordionTrigger className="group py-4 text-left text-sm font-bold uppercase tracking-wide text-[var(--info-theme-500)] hover:no-underline cabinet:text-base [&>svg]:hidden">
        <span className="flex flex-1 items-center justify-between gap-4">
          {item.q}
          <span className="relative h-8 w-8 shrink-0">
            <img
              src={landingAsset("landing/faq/faq_chevron_in_circle_down.svg")}
              alt=""
              className="absolute inset-0 h-8 w-8 group-data-[state=open]:hidden"
              aria-hidden
            />
            <img
              src={landingAsset("landing/faq/faq_chevron_in_circle_up.svg")}
              alt=""
              className="absolute inset-0 hidden h-8 w-8 group-data-[state=open]:block"
              aria-hidden
            />
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-4 text-sm leading-relaxed text-[var(--neutral-theme-700)]">
        {item.a}
      </AccordionContent>
    </AccordionItem>
  );
}

export function FaqSection({ content = faqContent, className }: FaqSectionProps) {
  const firstId = content.items[0]?.id;
  const [twoColumns, setTwoColumns] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(FAQ_TWO_COL_MQ);
    const sync = () => setTwoColumns(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const splitAt = Math.ceil(content.items.length / 2);
  const leftItems = content.items.slice(0, splitAt);
  const rightItems = content.items.slice(splitAt);

  return (
    <section
      id="faq"
      className={cn(
        "scroll-mt-24 bg-[var(--page-bg)] px-4 py-16 cabinet:py-24",
        className,
      )}
    >
      <div className="app-page-marketing mx-auto max-w-3xl bp1200:max-w-none">
        <h2 className="text-center text-xl font-extrabold uppercase tracking-tight text-[var(--primary-theme-900)] cabinet:text-3xl">
          {content.title}
        </h2>
        {content.subtitle ? (
          <p className="mt-3 text-center text-sm text-[var(--hint-text-color)]">
            {content.subtitle}
          </p>
        ) : null}

        <Accordion
          type="single"
          collapsible
          defaultValue={firstId}
          className="mt-10 w-full cabinet:mt-14"
        >
          {twoColumns ? (
            <div className="flex items-start gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                {leftItems.map((item) => (
                  <FaqAccordionCard key={item.id} item={item} />
                ))}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                {rightItems.map((item) => (
                  <FaqAccordionCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {content.items.map((item) => (
                <FaqAccordionCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </Accordion>
      </div>
    </section>
  );
}
