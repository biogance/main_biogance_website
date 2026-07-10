import { Suspense } from "react";
import ExpertAdvicesSeeAll from "@/Components/Pages/ExpertAdvices/ExpertAdvicesSeeAll";

export default function AdvicesSeeAllPage() {
  return (
    <Suspense fallback={null}>
      <ExpertAdvicesSeeAll />
    </Suspense>
  );
}
