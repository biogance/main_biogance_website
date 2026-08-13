'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { startTopLoader } from '../TopLoader';
import BreedArticle from './BreedArticle';
import BreedDrawer from './BreedDrawer';

// Client wrapper for the /breed-guide/[slug] route — the route's own server
// page.jsx (src/app/breed-guide/[slug]) is just a shell; this reads the URL
// slug (useParams) and hands it to BreedArticle, which does the actual
// POST {BASE_URL}/breed/detail fetch and rendering. BreedDrawer fetches its
// own "change breed" catalog from the live API too (see its own comment).
export default function BreedArticleView() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug;

  // Set once BreedArticle's fetch resolves — only used to tell BreedDrawer
  // which entry is "current" (active-row highlight + which species tab to
  // open on) and to seed its own species default.
  const [current, setCurrent] = useState(null);

  const openBreed = (b) => {
    startTopLoader();
    router.push(`/breed-guide/${b.slug}`);
  };
  // "Back to all breeds" / "View all breeds" — going back in history instead
  // of pushing a fresh /breed-guide URL means the browser restores the exact
  // scroll position the user left the library at (natively, no custom
  // scrollIntoView timing to fight). Only falls back to a push when there's
  // nothing to go back to — e.g. a direct/deep link straight to this breed
  // with no prior page in this tab's history.
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
      <BreedArticle slug={slug} onLoaded={setCurrent} onOpenBreed={openBreed} onClose={closeArticle} />
      <BreedDrawer current={current} onSelect={openBreed} />
      <Footer />
    </>
  );
}
