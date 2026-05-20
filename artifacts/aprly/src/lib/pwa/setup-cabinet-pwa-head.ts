const MANIFEST_HREF = "/manifest-cabinet.webmanifest";
const APPLE_TOUCH_ICON = "/icons/apple-touch-icon-180.png";

function upsertLink(rel: string, href: string, extra?: Record<string, string>) {
  const selector = `link[rel="${rel}"]`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      el.setAttribute(k, v);
    }
  }
}

function upsertMeta(name: string, content: string) {
  const selector = `meta[name="${name}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Link cabinet manifest + iOS standalone meta (dashboard routes only). */
export function setupCabinetPwaHead(): void {
  if (typeof document === "undefined") return;

  upsertLink("manifest", MANIFEST_HREF);
  upsertLink("apple-touch-icon", APPLE_TOUCH_ICON);
  upsertMeta("apple-mobile-web-app-capable", "yes");
  upsertMeta("apple-mobile-web-app-title", "APRly");
  upsertMeta("apple-mobile-web-app-status-bar-style", "black-translucent");
}
