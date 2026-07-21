import axios from "axios";
import { BASE_URL } from "@/Components/API/API";
import { sanitizeSeoKeyword } from "@/utils/seoKeyword";

// Set NEXT_PUBLIC_SITE_URL in .env for production (e.g. https://biogance.com).
// Falls back to the dev domain used in robots.txt / existing sitemap.xml.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.website-dev.biogance.com";

// Revalidate the sitemap every 24 hours so new articles appear within a day.
export const revalidate = 86400;

const SEE_ALL_SLUGS = [
  "recommended-pet-care",
  "trending-pet-care",
  "most-liked-pet-care",
  "latest-pet-care",
  "pet-care-blogs",
];

async function fetchAllBlogs() {
  const allBlogs = [];
  const seen = new Set();
  let page = 1;
  const perPage = 200;

  try {
    while (page <= 20) {
      const res = await axios.post(
        `${BASE_URL}/blog/list`,
        { per_page: perPage, page },
        { timeout: 10000 },
      );

      if (!res.data?.status) break;

      const data = res.data.data;
      const items = data?.data ?? [];

      for (const item of items) {
        const id = item.id ?? item.english_seo_keyboard;
        if (id && !seen.has(id)) {
          seen.add(id);
          allBlogs.push(item);
        }
      }

      if (items.length === 0) break;
      const current = data?.current_page ?? page;
      const last = data?.last_page ?? page;
      if (current >= last) break;
      page++;
    }
  } catch {
    // API unreachable at build/revalidation time — sitemap returns static pages only.
  }

  return allBlogs;
}

export default async function sitemap() {
  const blogs = await fetchAllBlogs();
  const now = new Date();

  const staticPages = [
    { url: `${SITE_URL}/`,               lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/advices`,         lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/products`,        lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE_URL}/who-are-we`,      lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/certifications`,  lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/ingredients`,     lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/commitments`,     lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/loyalty`,         lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/ambassador`,      lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/distributor`,     lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/reseller`,        lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`,         lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/faq`,             lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/termsCondition`,  lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  const seeAllPages = SEE_ALL_SLUGS.map((slug) => ({
    url: `${SITE_URL}/advices/${slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const urlSeen = new Set();
  const blogPages = [];

  for (const blog of blogs) {
    const enSlug = sanitizeSeoKeyword(blog.english_seo_keyboard);
    const frSlug = sanitizeSeoKeyword(blog.french_seo_keyword);
    const lastMod =
      blog.updated_at || blog.created_at
        ? new Date(blog.updated_at || blog.created_at)
        : now;

    const enUrl = enSlug
      ? `${SITE_URL}/advices/${encodeURIComponent(enSlug)}`
      : null;
    const frUrl =
      frSlug && frSlug !== enSlug
        ? `${SITE_URL}/advices/${encodeURIComponent(frSlug)}`
        : null;

    if (enUrl && !urlSeen.has(enUrl)) {
      urlSeen.add(enUrl);
      blogPages.push({
        url: enUrl,
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: 0.7,
        ...(frUrl
          ? { alternates: { languages: { en: enUrl, fr: frUrl, "x-default": enUrl } } }
          : {}),
      });
    }

    if (frUrl && !urlSeen.has(frUrl)) {
      urlSeen.add(frUrl);
      blogPages.push({
        url: frUrl,
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: 0.6,
        alternates: {
          languages: {
            en: enUrl ?? frUrl,
            fr: frUrl,
            "x-default": enUrl ?? frUrl,
          },
        },
      });
    }
  }

  return [...staticPages, ...seeAllPages, ...blogPages];
}
