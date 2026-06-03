import { Suspense } from "react";
import FilterProducts from '@/Components/Pages/FilterProducts/FilterProducts';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <FilterProducts />
    </Suspense>
  );
}

