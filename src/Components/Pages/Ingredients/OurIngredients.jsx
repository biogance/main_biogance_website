'use client';

import React, { useState } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import IngredientsHero from './IngredientsHero';
import IngredientsEditorial from './IngredientsEditorial';
import IngredientsIndex from './IngredientsIndex';
import IngredientsRail from './IngredientsRail';
import IngredientsDetail from './IngredientsDetail';
import { getIngredientDetail } from './ingredientsData';

// Ported design-for-design from https://kase-ho-connect.lovable.app/ (hero,
// "chosen with purpose" editorial + stats, search/A-Z ingredient index,
// sticky "change ingredient" rail, ingredient detail with Origin/Benefits/
// Care tabs) — same pattern already used for the Breed folder: the
// reference's own header/topbar/footer are replaced with the site's real
// Navbar/Footer, everything else split one section per file under this
// folder instead of one long component.
export default function OurIngredients() {
  const [selected, setSelected] = useState('Hyaluronic Acid');
  const detail = getIngredientDetail(selected);

  return (
    <>
      <Navbar bgWhite={true} />
      <IngredientsHero />
      <IngredientsEditorial />
      <IngredientsIndex selected={selected} onSelect={setSelected} />
      <IngredientsRail selected={selected} onSelect={setSelected} />
      <IngredientsDetail name={selected} detail={detail} />
      <Footer />
    </>
  );
}
