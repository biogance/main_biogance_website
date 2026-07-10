import { Suspense } from "react";
import ExpertAdvicesSeeAll from "@/Components/Pages/ExpertAdvices/ExpertAdvicesSeeAll";

export default async function AdvicesSeeAllTypePage({ params }) {
  const { type } = await params;
  return (
    <Suspense fallback={null}>
      <ExpertAdvicesSeeAll type={type} />
    </Suspense>
  );
}
