import BreedArticleView from "@/Components/Pages/Breed/BreedArticleView";

// /breed-guide/[slug] — e.g. /breed-guide/Airedale-terrier. Thin server
// shell, same pattern as src/app/product/[slug]/page.jsx: BreedArticleView
// is a client component that reads the slug itself (useParams) and fetches
// POST {BASE_URL}/breed/detail with { seo_keyword: slug } directly, so
// there's nothing to compute here.
export default function Page() {
  return <BreedArticleView />;
}
