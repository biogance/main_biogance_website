import { Suspense } from "react";
import ExpertAdvicesSeeAll from "@/Components/Pages/ExpertAdvices/ExpertAdvicesSeeAll";

export default function ExpertAdviceSeeAllPage() {
  return (
    <Suspense fallback={null}>
      <ExpertAdvicesSeeAll />
    </Suspense>
  );
}
