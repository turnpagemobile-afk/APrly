import { whyContent } from "@/content/landing";
import { landingAsset } from "@/lib/landing-assets";
import { cn } from "@/lib/utils";

const PHOTOS = ["photo1.png", "photo2.png", "photo3.png"] as const;

function WhyCard({
  item,
  photo,
}: {
  item: (typeof whyContent.items)[number];
  photo: string;
}) {
  return (
    <article
      className={cn(
        "flex overflow-hidden rounded-[20px] bg-white shadow-sm",
        "flex-col",
        "bp600:flex-row bp840:flex-col",
      )}
    >
      <div
        className={cn(
          "shrink-0 overflow-hidden",
          "aspect-[4/3] w-full",
          "bp600:aspect-auto bp600:w-[42%] bp600:max-w-[220px] bp600:min-h-[140px]",
          "bp840:aspect-[4/3] bp840:w-full bp840:max-w-none bp840:min-h-0",
        )}
      >
        <img
          src={landingAsset(`landing/why/${photo}`)}
          alt={item.imageAlt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col justify-center p-5 bp600:px-4 bp600:py-4 bp840:p-6">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-primary bp840:text-base">
          {item.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--hint-text-color)] bp840:mt-3">
          {item.body}
        </p>
      </div>
    </article>
  );
}

export function WhySection() {
  return (
    <section className="bg-gradient-to-b from-[var(--primary-theme-100)] to-[var(--page-bg)] px-4 py-14 bp840:py-20 bp1200:py-24">
      <div className="app-page-marketing">
        <h2 className="text-left text-xl font-extrabold uppercase tracking-tight text-[var(--primary-theme-900)] bp840:text-center bp840:text-3xl">
          {whyContent.title}
        </h2>

        <div className="mt-8 flex flex-col gap-6 bp600:mt-10 bp840:mt-14 bp840:grid bp840:grid-cols-3 bp840:gap-6 bp1200:gap-8">
          {whyContent.items.map((item, i) => (
            <WhyCard key={item.id} item={item} photo={PHOTOS[i]} />
          ))}
        </div>
      </div>
    </section>
  );
}
