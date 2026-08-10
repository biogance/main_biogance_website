'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../Navbar';
import Footer from '../Footer';
import BreedArticle from './BreedArticle';
import BreedDrawer from './BreedDrawer';

// Client wrapper for the /[species]/[slug] route — the route's own server
// page.jsx (src/app/[species]/[slug]) handles generateStaticParams/
// generateMetadata (real, crawlable per-breed URLs instead of a
// ?species=&breed= query string), this just owns the router-driven
// navigation between breeds.
export default function BreedArticleView({ breed, allBreeds }) {
  const router = useRouter();

  const openBreed = (b) => router.push(`/${b.species}/${b.slug}`);
  // "Back to all breeds" / "View all breeds" — going back in history instead
  // of pushing a fresh /breed-guide URL means the browser restores the exact
  // scroll position the user left the library at (natively, no custom
  // scrollIntoView timing to fight), same end result as closeArticle()'s
  // scrollIntoView(...) in BREED PAGE.html since that's a library the user
  // had already scrolled into to get here. Only falls back to a push when
  // there's nothing to go back to — e.g. a direct/deep link straight to this
  // breed with no prior page in this tab's history.
  const closeArticle = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/breed-guide');
    }
  };

  return (
    <>
      <Navbar bgWhite={true} />
      <BreedArticle breed={breed} allBreeds={allBreeds} onOpenBreed={openBreed} onClose={closeArticle} />
      <BreedDrawer allBreeds={allBreeds} current={breed} onSelect={openBreed} />
      <Footer />
    </>
  );
}
