import ExpertArticleDetail from "@/Components/Pages/ExpertAdvices/ExpertAdvicesDetail";
import ExpertAdvicesSeeAll from "@/Components/Pages/ExpertAdvices/ExpertAdvicesSeeAll";
import { Suspense, cache } from "react";
import { headers } from "next/headers";
import { MEDIA_URL } from "@/Components/API/API";
import { fetchBlogDetail, sanitizeSeoKeyword } from "@/utils/seoKeyword";

const SEE_ALL_SLUGS = {
  "recommended-pet-care": "recommended",
  "trending-pet-care": "trending",
  "most-liked-pet-care": "like",
  "latest-pet-care": "recent",
  "pet-care-blogs": "pet",
};

const SEE_ALL_META = {
  "recommended-pet-care": {
    title: "Recommended Pet Care | Expert Advice | Biogance",
    description:
      "Browse vet-trusted articles recommended for your pet's daily care — expert tips, routines, and product guides from Biogance.",
  },
  "trending-pet-care": {
    title: "Trending Pet Care Articles | Expert Advice | Biogance",
    description:
      "Discover the most popular pet care articles trending right now — expert tips and advice from Biogance.",
  },
  "most-liked-pet-care": {
    title: "Most Liked Pet Care Articles | Expert Advice | Biogance",
    description:
      "Explore the most loved pet care articles by the Biogance community — expert advice rated by pet owners.",
  },
  "latest-pet-care": {
    title: "Latest Pet Care Articles | Expert Advice | Biogance",
    description:
      "Stay up to date with the freshest pet care advice — new expert articles published regularly by Biogance.",
  },
  "pet-care-blogs": {
    title: "Pet Care Blogs | Expert Advice | Biogance",
    description:
      "Read in-depth pet care blogs covering nutrition, grooming, health, and daily routines — written by Biogance experts.",
  },
};

function stripHtml(html) {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function truncateAtWord(str, max) {
  if (str.length <= max) return str;
  const cut = str.lastIndexOf(" ", max);
  return str.slice(0, cut > 0 ? cut : max) + "…";
}

// react's cache() dedupes this within a single request — generateMetadata
// and the page component both need the same blog, and without this it'd be
// fetched (and retried on the "Slug: " fallback) twice per page view.
const getBlog = cache(async (decoded) => {
  try {
    const res = await fetchBlogDetail(decoded);
    if (res.data?.status) return res.data.data?.blog ?? null;
  } catch {}
  return null;
});

async function getSiteOrigin() {
  const hdrs = await headers();
  const host = hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") || "https";
  return host ? `${protocol}://${host}` : "";
}

function articleUrl(origin, slug) {
  const clean = sanitizeSeoKeyword(slug);
  return clean ? `${origin}/advices/${encodeURIComponent(clean)}` : null;
}

// Social platforms (Slack/WhatsApp/Discord/iMessage) read the openGraph/
// twitter tags for the shared-link preview card (image + title + short
// description). Search engines instead use the plain title/description/
// keywords/canonical/hreflang/JSON-LD below for indexing/ranking.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  if (SEE_ALL_SLUGS[decoded]) {
    const meta = SEE_ALL_META[decoded];
    const origin = await getSiteOrigin();
    const url = `${origin}/advices/${decoded}`;
    return {
      title: meta.title,
      description: meta.description,
      alternates: {
        canonical: url,
        languages: { en: url, fr: url, "x-default": url },
      },
      openGraph: {
        siteName: "Biogance",
        title: meta.title,
        description: meta.description,
        url,
        type: "website",
        locale: "en_US",
        alternateLocale: "fr_FR",
        images: [{ url: `${origin}/opengraph-image`, width: 1200, height: 630, alt: meta.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: meta.title,
        description: meta.description,
        images: [`${origin}/opengraph-image`],
      },
    };
  }

  const blog = await getBlog(decoded);
  if (!blog) return { robots: { index: false } };

  const origin = await getSiteOrigin();
  const title = blog.name || "Biogance";
  const description =
    truncateAtWord(blog.short_description || stripHtml(blog.long_description), 155) ||
    "Pioneers in Natural Pet Care";
  const imagePath = blog.images?.[0]?.media ?? blog.image ?? null;
  // Same generated brand image the rest of the site falls back to (see
  // src/app/opengraph-image.jsx) when this specific article has no image of
  // its own — was pointing at "/og-image.jpg", a file that doesn't exist.
  const imageUrl = imagePath ? `${MEDIA_URL}${imagePath}` : `${origin}/opengraph-image`;
  const tagNames = (blog.tags ?? []).map((t) => t.name).filter(Boolean);

  const canonicalUrl = articleUrl(origin, decoded) || `/advices/${encodeURIComponent(decoded)}`;
  // Both language slugs point at the same article, just written for each
  // audience — hreflang tells Google they're translations of one another
  // instead of two separate/duplicate pages.
  const enUrl = articleUrl(origin, blog.english_seo_keyboard);
  const frUrl = articleUrl(origin, blog.french_seo_keyword);

  return {
    title: `${title} | Biogance`,
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
      title,
      description,
      url: canonicalUrl,
      type: "article",
      locale: "en_US",
      alternateLocale: "fr_FR",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      tags: tagNames.length ? tagNames : undefined,
      ...(blog.created_at ? { publishedTime: blog.created_at } : {}),
      ...(blog.updated_at ? { modifiedTime: blog.updated_at } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

// BreadcrumbList schema — Google shows "Home > Expert Advice > Article" in
// search results, which increases click-through rate vs a plain URL.
function buildBreadcrumbJsonLd(blog, canonicalUrl, origin) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      { "@type": "ListItem", position: 2, name: "Expert Advice", item: `${origin}/advices` },
      { "@type": "ListItem", position: 3, name: blog.name, item: canonicalUrl },
    ],
  };
}

// schema.org Article structured data — lets Google show rich results
// (author, publish date) directly in search listings. Rendered as a
// <script type="application/ld+json"> in the page body below, since Next's
// metadata export has no dedicated field for it.
function buildArticleJsonLd(blog, canonicalUrl, imageUrl, origin) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.name,
    description: blog.short_description || undefined,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: blog.created_at || undefined,
    dateModified: blog.updated_at || blog.created_at || undefined,
    author: {
      "@type": "Organization",
      name: blog.company_name || "Biogance",
    },
    publisher: {
      "@type": "Organization",
      name: "Biogance",
      logo: {
        "@type": "ImageObject",
        url: `${origin}/logo.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };
}

export default async function AdvicesDetailPage({ params }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const type = SEE_ALL_SLUGS[decoded];

  if (type) {
    return (
      <Suspense fallback={null}>
        <ExpertAdvicesSeeAll type={type} />
      </Suspense>
    );
  }

  const blog = await getBlog(decoded);
  let articleJsonLd = null;
  let breadcrumbJsonLd = null;
  if (blog) {
    const origin = await getSiteOrigin();
    const canonicalUrl = articleUrl(origin, decoded) || `/advices/${encodeURIComponent(decoded)}`;
    const imagePath = blog.images?.[0]?.media ?? blog.image ?? null;
    const imageUrl = imagePath ? `${MEDIA_URL}${imagePath}` : `${origin}/opengraph-image`;
    articleJsonLd = buildArticleJsonLd(blog, canonicalUrl, imageUrl, origin);
    breadcrumbJsonLd = buildBreadcrumbJsonLd(blog, canonicalUrl, origin);
  }

  return (
    <>
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <ExpertArticleDetail seoKeyword={decoded} />
    </>
  );
}
