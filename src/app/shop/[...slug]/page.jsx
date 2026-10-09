import { Suspense } from "react";
import FilterProducts from "@/Components/Pages/FilterProducts/FilterProducts";

/**
 * Catch-all route for SEO-friendly filter URLs.
 *
 * Examples that all resolve here:
 *   /shop/dog
 *   /shop/cat
 *   /shop/dog/family/dry-food
 *   /shop/dog/family/dry-food/range/biogance-bio
 *
 * The FilterProducts component reads window.location.pathname and parses
 * the path segments itself to restore filters — no props needed here.
 */
export default function ShopSlugPage() {
  return (
    <Suspense>
      <FilterProducts />
    </Suspense>
  );
}

// Tell Next.js NOT to statically pre-render slug variants — the component
// relies on browser APIs (window.location) to parse the SEO URL.
export const dynamic = "force-dynamic";
