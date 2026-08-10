'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../Navbar';
import Footer from '../Footer';
import BreedHero from './BreedHero';
import BreedIntro from './BreedIntro';
import BreedLibrary from './BreedLibrary';
import allBreeds from './data/breeds.json';

// Ported from BREED PAGE.html — the site's real Navbar/Footer replace the
// mockup's own header/footer (same pattern already used by
// ProSection.jsx/LabortorySection.jsx), everything else (hero, intro,
// library) is split into its own file under this folder, one section per
// file. Individual breeds are real, crawlable Next.js routes
// (/[species]/[slug] — see src/app/[species]/[slug], not nested under
// /breed-guide) instead of a ?species=&breed= query string, so search
// engines can index each breed profile with its own title/description/
// canonical URL. "Back to all breeds" (BreedArticleView.jsx) uses
// router.back() rather than pushing this URL fresh, so the browser restores
// the exact scroll position the user left the library at — no
// scroll-into-view code needed here.
export default function Breed() {
  const router = useRouter();
  const openBreed = (breed) => router.push(`/${breed.species}/${breed.slug}`);

  return (
    <>
      <Navbar bgWhite={true} />
      <BreedHero />
      <BreedIntro />
      <BreedLibrary allBreeds={allBreeds} onOpenBreed={openBreed} />
      <Footer />
    </>
  );
}
