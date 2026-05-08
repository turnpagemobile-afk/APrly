import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqContent } from "@/content/landing";

export function FaqSection() {
  const firstId = faqContent.items[0]?.id;
  return (
    <section id="faq" className="px-4 py-16 md:py-24 scroll-mt-24">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {faqContent.title}
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">
            {faqContent.subtitle}
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          defaultValue={firstId}
          className="mt-10 md:mt-14 w-full"
        >
          {faqContent.items.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border-b border-border/60"
            >
              <AccordionTrigger className="text-left text-sm md:text-base font-bold text-primary hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm md:text-[15px] text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
