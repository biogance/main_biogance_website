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

function stripHtml(html) {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
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
  if (SEE_ALL_SLUGS[decoded]) return {};

  const blog = await getBlog(decoded);
  if (!blog) return {};

  const title = blog.name || "Biogance";
  const description =
    blog.short_description ||
    stripHtml(blog.long_description).slice(0, 160) ||
    "Pioneers in Natural Pet Care";
  const imagePath = blog.images?.[0]?.media ?? blog.image ?? null;
  const imageUrl = imagePath ? `${MEDIA_URL}${imagePath}` : "/og-image.jpg";
  const tagNames = (blog.tags ?? []).map((t) => t.name).filter(Boolean);

  const origin = await getSiteOrigin();
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
  let jsonLd = null;
  if (blog) {
    const origin = await getSiteOrigin();
    const canonicalUrl = articleUrl(origin, decoded) || `/advices/${encodeURIComponent(decoded)}`;
    const imagePath = blog.images?.[0]?.media ?? blog.image ?? null;
    const imageUrl = imagePath ? `${MEDIA_URL}${imagePath}` : undefined;
    jsonLd = buildArticleJsonLd(blog, canonicalUrl, imageUrl, origin);
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ExpertArticleDetail seoKeyword={decoded} />
    </>
  );
}
