import OurIngredients from "@/Components/Pages/Ingredients/OurIngredients";
import { headers } from "next/headers";
import { cache } from "react";
import { BASE_URL, MEDIA_URL } from "@/Components/API/API";
import { slugify } from "@/utils/slugify";

// /ingredient/[slug] — e.g. /ingredient/aloe-vera. A direct/shared link to
// one specific ingredient. The page itself is the *exact same* single
// scrolling OurIngredients.jsx page /ingredients renders (hero, editorial,
// search index, sticky "change ingredient" rail, inline detail section) —
// nothing about that layout changes here. The only two differences from
// plain /ingredients: this generateMetadata (so the shared link gets a
// real title/description/image instead of the generic site-wide one), and
// passing initialSlug so the page opens with *this* ingredient's detail
// showing instead of defaulting to the top search result. OurIngredients
// itself keeps the address bar synced to whichever ingredient is on screen
// (see its own history.replaceState effect), which is what makes every
// ingredient reachable at its own /ingredient/{slug} URL to begin with —
// same pattern as src/app/breed-guide/[slug]/page.jsx, just without a
// separate standalone detail component: there's only ever this one page.
// metadata below (that fetch is client-side only, so without this the
// link-preview/SEO tags below never see real ingredient data).
//
// Unlike /breed/detail, the ingredient API has no dedicated
// english_seo_keyword/french_seo_keyword field to look detail up by —
// /ingredient/detail/{id} only takes a numeric id. So resolving an
// incoming URL slug means: fetch the full (unpaginated) /ingredient/list,
// find the item whose own name/french_name slugifies to a match, then
// fetch /ingredient/detail/{id} for the full record. IngredientArticle.jsx
// does the exact same two-step lookup client-side, kept in sync by sharing
// slugify().

function stripHtml(html) {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function truncateAtWord(str, max) {
  if (str.length <= max) return str;
  const cut = str.lastIndexOf(" ", max);
  return str.slice(0, cut > 0 ? cut : max) + "…";
}

// react's cache() dedupes this within a single request — generateMetadata
// and the page component both need the same ingredient, and without this
// it'd be looked up (list + detail, two requests) twice per page view.
const getIngredient = cache(async (decodedSlug) => {
  try {
    const listRes = await fetch(`${BASE_URL}/ingredient/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      cache: "no-store",
    });
    const listData = await listRes.json();
    if (!listData?.status) return null;

    const items = listData.data ?? [];
    const match = items.find(
      (ing) => slugify(ing.name) === decodedSlug || slugify(ing.french_name) === decodedSlug,
    );
    if (!match) return null;

    const detailRes = await fetch(`${BASE_URL}/ingredient/detail/${match.id}`, {
      cache: "no-store",
    });
    const detailData = await detailRes.json();
    if (detailData?.status && detailData.data) return detailData.data;
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

function ingredientUrl(origin, slug) {
  return slug ? `${origin}/ingredient/${encodeURIComponent(slug)}` : null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  const ingredient = await getIngredient(decoded);
  if (!ingredient) return { robots: { index: false } };

  const origin = await getSiteOrigin();
  const name = ingredient.name || "Biogance";
  const description =
    truncateAtWord(stripHtml(ingredient.description), 155) ||
    "Pioneers in Natural Pet Care";
  // Same generated brand image the rest of the site falls back to (see
  // src/app/opengraph-image.jsx) when this specific ingredient has no
  // image of its own.
  const imageUrl = ingredient.media ? `${MEDIA_URL}${ingredient.media}` : `${origin}/opengraph-image`;
  const tagNames = (ingredient.tags ?? []).map((tg) => tg.name).filter(Boolean);

  const enSlug = slugify(ingredient.name);
  const frSlug = slugify(ingredient.french_name);
  const canonicalUrl = ingredientUrl(origin, decoded) || `/ingredient/${encodeURIComponent(decoded)}`;
  const enUrl = ingredientUrl(origin, enSlug);
  const frUrl = ingredientUrl(origin, frSlug);

  return {
    title: `${name} | Biogance Ingredients`,
    description,
    keywords: tagNames.length ? tagNames.join(", ") : undefined,
    alternates: {
      canonical: canonicalUrl,
      // Both language slugs point at the same ingredient profile, just
      // written for each audience — hreflang tells Google they're
      // translations of one another instead of two separate/duplicate
      // pages.
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
      // "website" rather than "article" — an ingredient profile is
      // reference content, not a dated blog post (no publishedTime/
      // modifiedTime).
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

// BreadcrumbList schema — Google shows "Home > Ingredients > Ingredient
// Name" in search results, which increases click-through rate vs a plain
// URL. Same pattern as breed-guide/[slug]/page.jsx's buildBreadcrumbJsonLd.
function buildBreadcrumbJsonLd(ingredient, canonicalUrl, origin) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      { "@type": "ListItem", position: 2, name: "Ingredients", item: `${origin}/ingredients` },
      { "@type": "ListItem", position: 3, name: ingredient.name, item: canonicalUrl },
    ],
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  const ingredient = await getIngredient(decoded);
  let breadcrumbJsonLd = null;
  if (ingredient) {
    const origin = await getSiteOrigin();
    const canonicalUrl = ingredientUrl(origin, decoded) || `/ingredient/${encodeURIComponent(decoded)}`;
    breadcrumbJsonLd = buildBreadcrumbJsonLd(ingredient, canonicalUrl, origin);
  }

  return (
    <>
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <OurIngredients initialSlug={decoded} />
    </>
  );
}
