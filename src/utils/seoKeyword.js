import axios from "axios";
import { BASE_URL } from "../Components/API/API";

// A handful of blog records have their SEO keyword field saved in the CMS
// with a stray "Slug: " prefix (looks like someone pasted a label along with
// the value) instead of just the slug itself, e.g. "Slug: overweight-cat-
// adapt-diet-weight-loss" — that renders as an ugly, non-SEO-friendly URL
// (/advices/Slug%3A%20overweight-cat-...) unlike the clean French field for
// the same blog. Stripping it here keeps every link/canonical URL/shared
// preview clean, matching how the field *should* have been entered.
export function sanitizeSeoKeyword(raw) {
  if (!raw) return raw;
  return raw.replace(/^\s*slug\s*:\s*/i, "").trim();
}

// The backend does an exact (case-insensitive) match on the stored SEO
// keyword field — it has no fuzzy/partial search — so once we display and
// link to the sanitized slug, looking that clean value up on the detail
// page fails with "Invalid Id" for the affected records. Retrying with the
// "Slug: " prefix re-added recovers exactly the one bad pattern we sanitize
// above, without needing every caller to duplicate this fallback.
export async function fetchBlogDetail(decodedSeoKeyword, { body = {}, headers = {} } = {}) {
  const tryFetch = (seoKeyboard) =>
    axios.post(
      `${BASE_URL}/blog/detail`,
      { ...body, seo_keyboard: seoKeyboard },
      { headers },
    );

  let res = await tryFetch(decodedSeoKeyword);
  if (!res.data?.status) {
    res = await tryFetch(`Slug: ${decodedSeoKeyword}`);
  }
  return res;
}
