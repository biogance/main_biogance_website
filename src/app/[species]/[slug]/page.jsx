import { notFound } from "next/navigation";
import allBreeds from "@/Components/Pages/Breed/data/breeds.json";
import { firstSentences } from "@/Components/Pages/Breed/breedHelpers";
import BreedArticleView from "@/Components/Pages/Breed/BreedArticleView";
import { headers } from "next/headers";

// Root-level /[species]/[slug] (e.g. /dog/afghan-hound, /cat/abyssinian) —
// moved out from under /breed-guide/... per request. Safe as a root dynamic
// segment: Next.js only falls through to it when the first path segment
// doesn't match any literal top-level route folder (shop, products, etc.),
// and findBreed() below 404s anything that isn't an actual dog/cat slug —
// see PageLoader.jsx's VALID_ROUTES for the matching "/dog"/"/cat" entries.
function findBreed(species, slug) {
  const list = species === "dog" ? allBreeds.dogs : species === "cat" ? allBreeds.cats : null;
  return list ? list.find((b) => b.slug === slug) || null : null;
}

// Statically generates every breed profile at build time (300 dogs + 66
// cats) so each one is a real, pre-rendered, crawlable URL.
export function generateStaticParams() {
  return [
    ...allBreeds.dogs.map((b) => ({ species: "dog", slug: b.slug })),
    ...allBreeds.cats.map((b) => ({ species: "cat", slug: b.slug })),
  ];
}

async function getSiteOrigin() {
  const hdrs = await headers();
  const host = hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") || "https";
  return host ? `${protocol}://${host}` : "";
}

export async function generateMetadata({ params }) {
  const { species, slug } = await params;
  const breed = findBreed(species, slug);
  if (!breed) return {};

  const origin = await getSiteOrigin();
  const url = `${origin}/${species}/${slug}`;
  const title = `${breed.name}${breed.frenchName && breed.frenchName !== breed.name ? ` (${breed.frenchName})` : ""} — Breed Guide | Biogance`;
  const description = firstSentences(breed.description, 2) || `${breed.name} breed profile, temperament and care needs on the Biogance Breed Guide.`;

  return {
    title,
    description,
    keywords: [breed.name, breed.frenchName, breed.species === "dog" ? "dog breed" : "cat breed", breed.tags].filter(Boolean),
    alternates: { canonical: url },
    openGraph: {
      siteName: "Biogance",
      title,
      description,
      url,
      type: "article",
      images: breed.image ? [{ url: breed.image, alt: breed.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: breed.image ? [breed.image] : undefined,
    },
  };
}

export default async function Page({ params }) {
  const { species, slug } = await params;
  const breed = findBreed(species, slug);
  if (!breed) notFound();

  return <BreedArticleView breed={breed} allBreeds={allBreeds} />;
}
