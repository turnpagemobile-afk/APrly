import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqContent } from "@/content/landing";
import { cn } from "@/lib/utils";

export type FaqContent = typeof faqContent;

type FaqSectionProps = {
  content?: FaqContent;
  className?: string;
};

export function FaqSection({ content = faqContent, className }: FaqSectionProps) {
  const firstId = content.items[0]?.id;
  return (
    <section
      id="faq"
      className={cn("scroll-mt-24 px-4 py-16 cabinet:py-24", className)}
    >
      <div className="app-page-marketing max-w-3xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold tracking-tight cabinet:text-3xl">
            {content.title}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground cabinet:text-base">
            {content.subtitle}
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          defaultValue={firstId}
          className="mt-10 w-full cabinet:mt-14"
        >
          {content.items.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border-b border-border/60"
            >
              <AccordionTrigger className="text-left text-sm font-bold text-primary hover:no-underline cabinet:text-base">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground cabinet:text-[15px]">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
