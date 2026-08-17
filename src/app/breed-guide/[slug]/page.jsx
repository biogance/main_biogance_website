import BreedArticleView from "@/Components/Pages/Breed/BreedArticleView";
import { headers } from "next/headers";
import { cache } from "react";
import { BASE_URL, MEDIA_URL } from "@/Components/API/API";
import { sanitizeSeoKeyword } from "@/utils/seoKeyword";

// /breed-guide/[slug] — e.g. /breed-guide/Airedale-terrier. Thin server
// shell, same pattern as src/app/advices/[slug]/page.jsx: BreedArticleView
// is a client component that reads the slug itself (useParams) and fetches
// POST {BASE_URL}/breed/detail directly, so there's nothing to compute here
// except the metadata below (that fetch is client-side only, so without
// this the link-preview/SEO tags below never see real breed data).

function stripHtml(html) {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function truncateAtWord(str, max) {
  if (str.length <= max) return str;
  const cut = str.lastIndexOf(" ", max);
  return str.slice(0, cut > 0 ? cut : max) + "…";
}

// react's cache() dedupes this within a single request — generateMetadata
// and the page component both need the same breed, and without this it'd
// be fetched twice per page view.
const getBreed = cache(async (decoded) => {
  try {
    const res = await fetch(`${BASE_URL}/breed/detail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seo_keyword: decoded }),
      cache: "no-store",
    });
    const data = await res.json();
    if (data?.status && data.data?.breed) return data.data.breed;
  } catch {
    /* falls through to null below */
  }
  return null;
});

async function getSiteOrigin() {
  const hdrs = await headers();
  const host = hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") || "https";
  return host ? `${protocol}://${host}` : "";
}

function breedUrl(origin, slug) {
  const clean = sanitizeSeoKeyword(slug);
  return clean ? `${origin}/breed-guide/${encodeURIComponent(clean)}` : null;
}


export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  const breed = await getBreed(decoded);
  if (!breed) return { robots: { index: false } };

  const origin = await getSiteOrigin();
  const name = breed.name || "Biogance";
  const description =
    truncateAtWord(stripHtml(breed.description), 155) ||
    "Pioneers in Natural Pet Care";
  // Same generated brand image the rest of the site falls back to (see
  // src/app/opengraph-image.jsx) when this specific breed has no image of
  // its own.
  const imageUrl = breed.media ? `${MEDIA_URL}${breed.media}` : `${origin}/opengraph-image`;
  const tagNames = (breed.tags ?? []).map((t) => t.name).filter(Boolean);

  const canonicalUrl = breedUrl(origin, decoded) || `/breed-guide/${encodeURIComponent(decoded)}`;
  // Both language slugs point at the same breed profile, just written for
  // each audience — hreflang tells Google they're translations of one
  // another instead of two separate/duplicate pages.
  const enUrl = breedUrl(origin, breed.english_seo_keyboard);
  const frUrl = breedUrl(origin, breed.french_seo_keyword);

  return {
    title: `${name} | Biogance Breed Guide`,
    description,
    keywords: tagNames.length ? tagNames.join(", ") : undefined,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ...(enUrl ? { en: enUrl } : {}),
        ...(frUrl ? { fr: frUrl } : {}),
        ...(enUrl ? { "x-default": enUrl } : {}),
      },
    },
    openGraph: {
      siteName: "Biogance",
      title: name,
      description,
      url: canonicalUrl,
      // "website" rather than "article" — a breed profile is reference
      // content, not a dated blog post (no publishedTime/modifiedTime).
      type: "website",
      locale: "en_US",
      alternateLocale: "fr_FR",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: name }],
      tags: tagNames.length ? tagNames : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: [imageUrl],
    },
  };
}

// BreadcrumbList schema — Google shows "Home > Breed Guide > Breed Name" in
// search results, which increases click-through rate vs a plain URL. Same
// pattern as advices/[slug]/page.jsx's buildBreadcrumbJsonLd.
function buildBreadcrumbJsonLd(breed, canonicalUrl, origin) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      { "@type": "ListItem", position: 2, name: "Breed Guide", item: `${origin}/breed-guide` },
      { "@type": "ListItem", position: 3, name: breed.name, item: canonicalUrl },
    ],
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  const breed = await getBreed(decoded);
  let breadcrumbJsonLd = null;
  if (breed) {
    const origin = await getSiteOrigin();
    const canonicalUrl = breedUrl(origin, decoded) || `/breed-guide/${encodeURIComponent(decoded)}`;
    breadcrumbJsonLd = buildBreadcrumbJsonLd(breed, canonicalUrl, origin);
  }

  return (
    <>
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <BreedArticleView />
    </>
  );
}
