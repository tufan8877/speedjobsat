import { useEffect } from "react";

export const SITE_NAME = "speedjob.at";
export const SITE_URL = "https://speedjob.at";
export const DEFAULT_TITLE = "speedjob.at - Dienstleisterprofile in Österreich";
export const DEFAULT_DESCRIPTION =
  "Finde Dienstleisterprofile in Österreich oder erstelle kostenlos dein eigenes Profil. Suche nach Dienstleistung, Region und Bewertungen.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

interface SeoOptions {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "profile" | "article";
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const JSON_LD_ID = "seo-json-ld";

function setJsonLd(data: SeoOptions["jsonLd"]) {
  const existing = document.getElementById(JSON_LD_ID);
  if (!data) {
    existing?.remove();
    return;
  }

  const script = existing instanceof HTMLScriptElement ? existing : document.createElement("script");
  script.id = JSON_LD_ID;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  if (!existing) document.head.appendChild(script);
}

// Setzt Titel, Meta-Description, Open-Graph/Twitter-Tags, Canonical-URL und
// optional strukturierte Daten (JSON-LD) für die aktuell aktive Seite.
// Läuft rein clientseitig (kein SSR), Google & Co. rendern JS und lesen die
// Werte trotzdem aus dem finalen DOM aus.
export function useSeo(options: SeoOptions = {}) {
  const {
    title = DEFAULT_TITLE,
    description = DEFAULT_DESCRIPTION,
    path,
    image = DEFAULT_OG_IMAGE,
    type = "website",
    noindex = false,
    jsonLd,
  } = options;

  useEffect(() => {
    const url = `${SITE_URL}${path ?? window.location.pathname}`;

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", image);
    upsertMeta("property", "og:site_name", SITE_NAME);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);

    upsertLink("canonical", url);

    setJsonLd(jsonLd);

    return () => {
      setJsonLd(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, image, type, noindex, JSON.stringify(jsonLd)]);
}
