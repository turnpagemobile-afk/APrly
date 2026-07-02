import { whyContent } from "@/content/landing";
import { landingAsset } from "@/lib/landing-assets";
import { cn } from "@/lib/utils";

const PHOTOS = ["1m.png", "2m.png", "3m.png", "4m.png", "5m.png"] as const;

function WhyCard({
  item,
  photo,
}: {
  item: (typeof whyContent.items)[number];
  photo: string;
}) {
  return (
    <article className="flex flex-col overflow-hidden">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-[16px] bp840:rounded-[20px]">
        <img
          src={landingAsset(`landing/why/${photo}`)}
          alt={item.imageAlt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="mt-4 flex flex-1 flex-col bp840:mt-5">
        <h3 className="app-header-h4 text-secondary-300">{item.title}</h3>
        <p className="app-header-subheadline-regular text-neutral-000 mt-4">
          {item.body}
        </p>
      </div>
    </article>
  );
}

export function WhySection() {
  const topRow = whyContent.items.slice(0, 3);
  const bottomRow = whyContent.items.slice(3);

  return (
    <section
      id="why"
      className="scroll-mt-24 bg-[var(--primary-theme-800)] px-4 py-14 bp840:py-20 bp1200:py-24"
    >
      <div className="app-page-marketing">
        <h2 className="app-header-h3 text-neutral-000 text-center">
          {whyContent.title}
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-8 bp600:mt-10 bp600:grid-cols-2 bp840:mt-14 bp840:grid-cols-3 bp840:gap-6 bp1200:gap-8">
          {topRow.map((item, i) => (
            <WhyCard key={item.id} item={item} photo={PHOTOS[i] ?? PHOTOS[0]} />
          ))}
        </div>

        <div
          className={cn(
            "mt-8 grid grid-cols-1 gap-8",
            "bp600:mt-10 bp600:grid-cols-2",
            "bp840:mx-auto bp840:mt-10 bp840:max-w-4xl bp840:gap-8",
          )}
        >
          {bottomRow.map((item, i) => (
            <WhyCard
              key={item.id}
              item={item}
              photo={PHOTOS[i + 3] ?? PHOTOS[0]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
