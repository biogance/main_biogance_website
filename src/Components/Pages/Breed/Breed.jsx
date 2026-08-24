'use client';

import React, { useEffect } from 'react';
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
// send that same value straight to POST {BASE_URL}/breed/detail.
export default function Breed() {
  const router = useRouter();
  const openBreed = (breed) => {
    startTopLoader();
    router.push(`/breed-guide/${breed.slug}`);
  };

  // BreedArticle.jsx's "Back to all breeds"/"View all breeds" buttons
  // router.push this page fresh (a real navigation, so BreedArticleView's
  // own router.back()-based restore doesn't apply here) and set this flag
  // first — scroll straight down past BreedHero/BreedIntro to
  // BreedLibrary.jsx's grid (id="library") instead of leaving the user at
  // the very top of the page to scroll past those sections again.
  useEffect(() => {
    let target;
    try {
      target = sessionStorage.getItem('breedGuideScrollTo');
    } catch {
      /* ignore */
    }
    if (target !== 'library') return;
    try {
      sessionStorage.removeItem('breedGuideScrollTo');
    } catch {
      /* ignore */
    }
    requestAnimationFrame(() => {
      const section = document.getElementById('library');
      if (!section) return;
      // Fixed header is 40px announcement + 64px nav = 104px on desktop
      // (lg: 1024px+, pinned permanently there); below that the
      // announcement bar slides away, leaving just the 64px nav pinned —
      // same convention as ExpertAdvices.jsx's getNavbarHeight().
      const navbarHeight = window.innerWidth >= 1024 ? 104 : 64;
      const targetY = section.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top: Math.max(targetY, 0), behavior: 'smooth' });
    });
  }, []);

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
