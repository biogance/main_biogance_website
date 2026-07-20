import ExpertArticleDetail from "@/Components/Pages/ExpertAdvices/ExpertAdvicesDetail";
import ExpertAdvicesSeeAll from "@/Components/Pages/ExpertAdvices/ExpertAdvicesSeeAll";
import { Suspense } from "react";

const SEE_ALL_SLUGS = {
  "recommended-pet-care-advice": "recommended",
  "trending-pet-care-advice": "trending",
  "most-liked-pet-care-advice": "like",
  "latest-pet-care-advice": "recent",
  "pet-care-blogs": "pet",
};

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
