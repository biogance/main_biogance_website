import ExpertArticleDetail from "@/Components/Pages/ExpertAdvices/ExpertAdvicesDetail";
import ExpertAdvicesSeeAll from "@/Components/Pages/ExpertAdvices/ExpertAdvicesSeeAll";
import { Suspense } from "react";
import { headers } from "next/headers";
import axios from "axios";
import { BASE_URL, MEDIA_URL } from "@/Components/API/API";

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

// Social platforms (Slack/WhatsApp/Discord/iMessage) only read the
// openGraph/twitter tags for the shared-link preview card, so those are kept
// to just the article image + title + "Biogance" as requested. The plain
// title/description/keywords/canonical below are what search engines use and
// aren't rendered in that preview card, so they carry the real article copy.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  if (SEE_ALL_SLUGS[decoded]) return {};

  let blog = null;
  try {
    const res = await axios.post(
      `${BASE_URL}/blog/detail`,
      { seo_keyboard: decoded },
      { timeout: 8000 },
    );
    if (res.data?.status) blog = res.data.data?.blog ?? null;
  } catch {}

  if (!blog) return {};

  const title = blog.name || "Biogance";
  const description =
    blog.short_description ||
    stripHtml(blog.long_description).slice(0, 160) ||
    "Pioneers in Natural Pet Care";
  const imagePath = blog.images?.[0]?.media ?? blog.image ?? null;
  const imageUrl = imagePath ? `${MEDIA_URL}${imagePath}` : "/og-image.jpg";
  const tagNames = (blog.tags ?? []).map((t) => t.name).filter(Boolean);

  const hdrs = await headers();
  const host = hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") || "https";
  const canonicalPath = `/advices/${encodeURIComponent(decoded)}`;
  const canonicalUrl = host ? `${protocol}://${host}${canonicalPath}` : canonicalPath;

  return {
    title: `${title} | Biogance`,
    description,
    keywords: tagNames.length ? tagNames.join(", ") : undefined,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description: "Biogance",
      url: canonicalUrl,
      type: "article",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      tags: tagNames.length ? tagNames : undefined,
      ...(blog.updated_at ? { modifiedTime: blog.updated_at } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: "Biogance",
      images: [imageUrl],
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

  return <ExpertArticleDetail seoKeyword={decoded} />;
}
