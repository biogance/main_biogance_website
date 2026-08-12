'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../Navbar';
import Footer from '../Footer';
import IngredientsHero from './IngredientsHero';
import IngredientsEditorial from './IngredientsEditorial';
import IngredientsIndex from './IngredientsIndex';
import IngredientsRail from './IngredientsRail';
import IngredientsDetail from './IngredientsDetail';
import { BASE_URL } from '../../API/API';

// Ported design-for-design from https://kase-ho-connect.lovable.app/ (hero,
// "chosen with purpose" editorial + stats, search/A-Z ingredient index,
// sticky "change ingredient" rail, ingredient detail with Origin/Benefits/
// Care tabs) — same pattern already used for the Breed folder: the
// reference's own header/topbar/footer are replaced with the site's real
// Navbar/Footer, everything else split one section per file under this
// folder instead of one long component.
//
// The list itself is no longer the reference site's hardcoded 74 names —
// it comes from POST {BASE_URL}/ingredient/list, which returns the full
// matching set directly as `data` (a plain array, not paginated), with a
// `keyword` body param for search. The detail panel is a separate GET
// {BASE_URL}/ingredient/detail/{id} call, fired whenever `selectedId`
// changes.
export default function OurIngredients() {
  const { i18n } = useTranslation();
  const isFrench = i18n.language?.startsWith('fr');
  const searchTimerRef = useRef(null);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearchPending, setIsSearchPending] = useState(false);

  const [ingredients, setIngredients] = useState([]);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  // Guards against an older, slower request still landing after a newer
  // search has already started — only the most recent call's result gets
  // applied.
  const fetchTokenRef = useRef(0);

  const fetchIngredients = useCallback(async (keyword) => {
    const token = ++fetchTokenRef.current;
    setLoading(true);

    try {
      const body = {};
      if (keyword.trim()) body.keyword = keyword.trim();

      const res = await axios.post(`${BASE_URL}/ingredient/list`, body);
      if (token !== fetchTokenRef.current) return; // superseded by a newer search

      if (!res.data.status) {
        toast.error(res.data.action || 'Something went wrong.');
        return;
      }

      const items = res.data.data ?? [];
      setIngredients(items);
      setTotal(items.length);
      // Reset selection to the top result so the detail section reflects
      // the new search instead of holding on to a stale/absent id.
      setSelectedId(items[0]?.id ?? null);
    } catch {
      if (token === fetchTokenRef.current) toast.error('Something went wrong. Please try again.');
    } finally {
      if (token === fetchTokenRef.current) {
        setLoading(false);
        setIsSearchPending(false);
      }
    }
  }, []);

  // Initial load.
  useEffect(() => {
    fetchIngredients('');
  }, [fetchIngredients]);

  // Debounced search — shimmer starts the instant the user types
  // (isSearchPending, read by IngredientsIndex.jsx), but the actual API
  // call (with `keyword`) only fires 1s after they stop typing, same
  // "immediate shimmer, debounce before the call" pattern as
  // ExpertAdvices.jsx's search box.
  const handleSearchChange = (val) => {
    setSearchInput(val);
    setIsSearchPending(true);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
    }, 1000);
  };

  // Bypasses the debounce for an explicit "clear search" action (e.g. from
  // IngredientsIndex.jsx's empty-state button) — same immediate-clear
  // pattern as ExpertAdvices.jsx's clearSearch.
  const clearSearch = () => {
    clearTimeout(searchTimerRef.current);
    setIsSearchPending(true);
    setSearchInput('');
    setDebouncedSearch('');
  };

  const isFirstSearchRef = useRef(true);
  useEffect(() => {
    if (isFirstSearchRef.current) {
      isFirstSearchRef.current = false;
      return;
    }
    fetchIngredients(debouncedSearch);
  }, [debouncedSearch, fetchIngredients]);

  // Picking an ingredient (from the grid or the sticky rail) scrolls the
  // page so the detail section lands right below the stuck
  // Navbar + IngredientsRail stack. This computes the target manually
  // (getBoundingClientRect + window.scrollY) rather than leaning on native
  // scrollIntoView + CSS scroll-margin-top — that combination turned out to
  // land inconsistently (worked for some ingredients, silently did nothing
  // for others) because scrollIntoView's target math doesn't reliably
  // account for a `position: sticky` ancestor (IngredientsRail) sitting
  // between the viewport and the target during the animation, across
  // browsers. A plain window.scrollTo to an explicitly computed pixel
  // offset doesn't depend on any of that. Wrapped in requestAnimationFrame
  // so it reads the layout after the click's own render has settled,
  // instead of whatever was on screen the instant the button was pressed.
  const handleSelect = (id) => {
    setSelectedId(id);
    requestAnimationFrame(() => {
      const detailSection = document.getElementById('ingredient-detail');
      if (!detailSection) return;
      // Navbar's fixed header is 40px announcement + 64px nav = 104px on
      // desktop (lg: 1024px+, pinned permanently there); below that the
      // announcement bar slides away, leaving just the 64px nav pinned —
      // same convention as ExpertAdvices.jsx's getNavbarHeight().
      const navbarHeight = window.innerWidth >= 1024 ? 104 : 64;
      const railHeight = document.querySelector('[data-ingredient-rail]')?.offsetHeight ?? 0;
      const targetY = detailSection.getBoundingClientRect().top + window.scrollY - navbarHeight - railHeight;
      window.scrollTo({ top: Math.max(targetY, 0), behavior: 'smooth' });
    });
  };

  // Detail panel: its own GET {BASE_URL}/ingredient/detail/{id} call, kept
  // separate from the list fetch above — fires whenever the selected
  // ingredient changes.
  const [detailIngredient, setDetailIngredient] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const detailTokenRef = useRef(0);

  useEffect(() => {
    if (selectedId == null) {
      setDetailIngredient(null);
      return;
    }
    const token = ++detailTokenRef.current;
    setDetailLoading(true);
    axios
      .get(`${BASE_URL}/ingredient/detail/${selectedId}`)
      .then((res) => {
        if (token !== detailTokenRef.current) return; // a newer selection already started
        if (!res.data.status) {
          toast.error(res.data.action || 'Something went wrong.');
          return;
        }
        setDetailIngredient(res.data.data);
      })
      .catch(() => {
        if (token === detailTokenRef.current) toast.error('Something went wrong. Please try again.');
      })
      .finally(() => {
        if (token === detailTokenRef.current) setDetailLoading(false);
      });
  }, [selectedId]);

  return (
    <>
      <Navbar bgWhite={true} />
      <IngredientsHero />
      <IngredientsEditorial total={total} loading={loading && !ingredients.length} />
      <IngredientsIndex
        query={searchInput}
        onQueryChange={handleSearchChange}
        onClearSearch={clearSearch}
        ingredients={ingredients}
        loading={loading}
        isSearchPending={isSearchPending}
        selectedId={selectedId}
        onSelect={handleSelect}
        isFrench={isFrench}
      />
      <IngredientsRail
        ingredients={ingredients}
        loading={loading && !ingredients.length}
        selectedId={selectedId}
        onSelect={handleSelect}
        isFrench={isFrench}
      />
      <IngredientsDetail
        ingredient={detailIngredient}
        loading={detailLoading || (selectedId != null && !detailIngredient)}
        isFrench={isFrench}
      />
      <Footer />
    </>
  );
}
