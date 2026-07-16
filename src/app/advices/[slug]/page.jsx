import ExpertArticleDetail from "@/Components/Pages/ExpertAdvices/ExpertAdvicesDetail";
import ExpertAdvicesSeeAll from "@/Components/Pages/ExpertAdvices/ExpertAdvicesSeeAll";
import { Suspense } from "react";

const SEE_ALL_TYPES = ["recommended", "trending", "like", "recent", "pet"];

export default async function AdvicesDetailPage({ params }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  if (SEE_ALL_TYPES.includes(decoded)) {
    return (
      <Suspense fallback={null}>
        <ExpertAdvicesSeeAll type={decoded} />
      </Suspense>
    );
  }

  return <ExpertArticleDetail seoKeyword={decoded} />;
}
