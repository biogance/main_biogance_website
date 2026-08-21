// Generic name -> URL-slug converter. Unlike breed/blog/product, the
// ingredient API doesn't hand back a dedicated english_seo_keyword/
// french_seo_keyword field to build /ingredient/[slug] links from — the
// slug has to be derived from the ingredient's own name (and, for the
// French URL, its french_name) instead, on both sides:
//   - client: IngredientsIndex.jsx/IngredientsRail.jsx selecting an
//     ingredient builds the /ingredient/{slug} URL from this.
//   - server: src/app/ingredient/[slug]/page.jsx resolves an incoming URL
//     slug back to an ingredient by comparing slugify(name) (and
//     slugify(french_name)) against it, since that's the only stable link
//     between the two.
// Both sides need the exact same algorithm or a shared link/slug would
// silently stop resolving, so this is the one place it's defined.
const DIACRITICS_REGEX = new RegExp("[̀-ͯ]", "g");

export function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .normalize("NFKD") // split accented chars (e, e, e, ...) into base + diacritic
    .replace(DIACRITICS_REGEX, "") // drop the diacritics, keeping plain ascii
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // any run of non-alphanumerics -> one hyphen
    .replace(/^-+|-+$/g, ""); // no leading/trailing hyphen
}
