'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { startTopLoader } from '../TopLoader';
import BreedHero from './BreedHero';
import BreedIntro from './BreedIntro';
import BreedLibrary from './BreedLibrary';

// Ported from BREED PAGE.html — the site's real Navbar/Footer replace the
// mockup's own header/footer (same pattern already used by
// ProSection.jsx/LabortorySection.jsx), everything else (hero, intro,
// library) is split into its own file under this folder, one section per
// file. Individual breeds route to /breed-guide/[slug] (see
// src/app/breed-guide/[slug]) with `slug` being whichever seo_keyword
// (english_seo_keyboard/french_seo_keyword) matched the current site
// language when the card was built — BreedArticleView.jsx/BreedArticle.jsx
// send that same value straight to POST {BASE_URL}/breed/detail. "Back to
// all breeds" (BreedArticleView.jsx) uses router.back() rather than pushing
// this URL fresh, so the browser restores the exact scroll position the
// user left the library at — no scroll-into-view code needed here.
export default function Breed() {
  const router = useRouter();
  const openBreed = (breed) => {
    startTopLoader();
    router.push(`/breed-guide/${breed.slug}`);
  };

  return (
    <>
      <Navbar bgWhite={true} />
      <BreedHero />
      <BreedIntro />
      <BreedLibrary onOpenBreed={openBreed} />
      <Footer />
    </>
  );
}
