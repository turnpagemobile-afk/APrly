import { whyContent } from "@/content/landing";
import { landingAsset } from "@/lib/landing-assets";

const PHOTOS = ["photo1.png", "photo2.png", "photo3.png", "photo4.png"] as const;

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
        <h3 className="app-header-h4 text-title">{item.title}</h3>
        <p className="app-text-p1-regular text-average mt-4">{item.body}</p>
      </div>
    </article>
  );
}

export function WhySection() {
  const items = whyContent.items.slice(0, 4);

  return (
    <section
      id="why"
      className="scroll-mt-24 bg-[var(--page-bg)] px-4 py-14 bp840:py-20 bp1200:py-24"
    >
      <div className="app-page-marketing">
        <h2 className="app-header-h3 text-title text-center">
          {whyContent.title}
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-8 bp600:mt-10 bp600:grid-cols-2 bp840:mt-14 bp840:gap-6 bp1200:gap-8">
          {items.map((item, i) => (
            <WhyCard key={item.id} item={item} photo={PHOTOS[i] ?? PHOTOS[0]} />
          ))}
        </div>
      </div>
    </section>
  );
}
