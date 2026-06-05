import { Suspense } from "react";
import FilterProducts from '@/Components/Pages/FilterProducts/FilterProducts';

export default function Page() {
  return (
    <Suspense>
      <FilterProducts />
    </Suspense>
  );
}

