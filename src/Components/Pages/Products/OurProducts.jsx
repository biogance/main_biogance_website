"use client"

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { MEDIA_URL, BASE_URL } from '../../API/API';
import axios from 'axios';
import toast from 'react-hot-toast';
import { mergeCartItem } from '../../../utils/cartStorage';
import { getDeviceId } from '../../../utils/deviceId';


export default function Products({ isOpen, onClose, categories = [], triggerRef, popular = [], onCartOpen, onQuickViewOpen, onFeaturedProductChange, isMobileModal = false }) {
  const { t, i18n } = useTranslation('ourproduct');
  const isFrench = i18n.language === 'fr';
  const router = useRouter();

  const getName = (item) => {
    if (!item) return '';
    return isFrench ? (item.french_name || item.name || '') : (item.name || '');
  };

  // Family click → /shop with the animal collection (category) and family
  // pre-selected in the filter rail, so the API call comes back already filtered.
  const goToFamily = (category, fam) => {
    onClose?.();
    const params = new URLSearchParams({
      category_id: category.id,
      category_name: getName(category),
      family_name: getName(fam),
    });
    router.push(`/shop?${params.toString()}`);
  };

  const [activeCategory, setActiveCategory] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const menuRef = useRef(null);
  const autoScrollRef = useRef(null);
  const wasOpenRef = useRef(false);

  // Issue 1: Har baar open ho to first category select ho — only on the
  // actual open transition, not on every re-render of `categories`.
  // PageLoader.jsx re-calls /web/splash on every click anywhere on the
  // page, and once that resolves Navbar does
  // setHomeCategories(parsed.categories || []) with a brand new array
  // reference (same content, new identity). That used to re-run this
  // effect and snap activeCategory back to categories[0] a moment after
  // the user picked a different species — since clicking a tab is itself
  // a click that re-triggers the same splash refetch.
  useEffect(() => {
    const justOpened = isOpen && !wasOpenRef.current;
    wasOpenRef.current = isOpen;
    if (categories.length > 0 && (justOpened || !activeCategory)) {
      setActiveCategory(categories[0]);
    }
  }, [isOpen, categories, activeCategory]);

  const [addingToCart, setAddingToCart] = useState(false);
  const [cartHovered, setCartHovered] = useState(false);

  // Load header_suggest_products from splashData localStorage
  const [suggestedProduct, setSuggestedProduct] = useState(null);
  useEffect(() => {
    const load = () => {
      try {
        const cached = localStorage.getItem('splashData');
        if (cached) {
          const parsed = JSON.parse(cached);
          const suggested = parsed?.header_suggest_products?.[0] || null;
          setSuggestedProduct(suggested);
        }
      } catch (e) {}
    };
    load();
    window.addEventListener('splashDataReady', load);
    return () => window.removeEventListener('splashDataReady', load);
  }, []);

  // Use splashData suggested product instead of popular prop
  const featuredProduct = suggestedProduct || popular[0] || null;

  const rawImages = featuredProduct?.products?.[0]?.images || [];
  const productImages = rawImages.filter(img => img?.media && img.media.trim() !== '');

  const productName = featuredProduct
    ? (isFrench ? (featuredProduct.french_name || featuredProduct.name) : featuredProduct.name)
    : '';

  const handleDotClick = (index) => setActiveImageIndex(index);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    if (!isOpen || productImages.length <= 1) return;
    autoScrollRef.current = setInterval(() => {
      setActiveImageIndex(prev => (prev + 1) % productImages.length);
    }, 3000);
    return () => clearInterval(autoScrollRef.current);
  }, [isOpen, productImages.length]);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (addingToCart || !featuredProduct) return;
    const firstProduct = featuredProduct.products?.[0];
    if (firstProduct?.color || firstProduct?.size) {
      onCartOpen?.(featuredProduct);
      return;
    }
    setAddingToCart(true);
    try {
      const loginData = JSON.parse(localStorage.getItem('LoginData') || 'null');
      const token = loginData?.data?.token;
      const res = await axios.post(
        `${BASE_URL}/user/cart/create`,
        token ? { product_id: firstProduct?.id ?? featuredProduct.id, quantity: 1 } : { device_id: getDeviceId(), product_id: firstProduct?.id ?? featuredProduct.id, quantity: 1 },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {},
      );
      if (res.data.status === false) {
        toast.error(res.data.action_message || res.data.action || t('couldNotAdd'));
      } else {
        mergeCartItem(res.data.data);
        onCartOpen?.(featuredProduct);
      }
    } catch {
      toast.error(t('somethingWrong'));
    } finally {
      setAddingToCart(false);
    }
  };

  const isSingleProduct = (featuredProduct?.products?.length ?? 1) === 1;

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${MEDIA_URL}${path}`;
  };

  const universes = (activeCategory?.sub_categories || []).filter(s => s.type === 'universe');

  // Desktop dropdown stays mounted a little past isOpen turning false so the
  // close transition (opacity/translateY below) has time to play instead of
  // the menu just vanishing.
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [animateIn, setAnimateIn] = useState(false);
  const closeTimeoutRef = useRef(null);
  const openFrameRef = useRef(null);
  const openFrame2Ref = useRef(null);

  useEffect(() => {
    if (isMobileModal) return;
    if (isOpen) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setShouldRender(true);
      // Double rAF: the first frame just commits the opacity:0 mount so the
      // browser actually paints it — flipping to opacity:1 in the same frame
      // (single rAF) skips that paint and the transition never plays.
      openFrameRef.current = requestAnimationFrame(() => {
        openFrame2Ref.current = requestAnimationFrame(() => setAnimateIn(true));
      });
    } else {
      setAnimateIn(false);
      closeTimeoutRef.current = setTimeout(() => setShouldRender(false), 250);
    }
    return () => {
      if (openFrameRef.current) cancelAnimationFrame(openFrameRef.current);
      if (openFrame2Ref.current) cancelAnimationFrame(openFrame2Ref.current);
    };
  }, [isOpen, isMobileModal]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);


  // Shared category icon (kept identical in both layouts)
  const CategoryIcon = ({ cat, size, active, light }) =>
    (cat.black_media || cat.media) ? (
      <img
        src={getImageUrl(cat.black_media || cat.media)}
        alt=""
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          flexShrink: 0,
          filter: light ? 'brightness(0) invert(1)' : 'brightness(0)',
          opacity: active ? 1 : 0.4,
        }}
      />
    ) : null;

  const Arrow = ({ className = '' }) => (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );

  const styles = (
    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.97); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes ourProductsSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes ourProductsRise {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes mobileProductsSlideUp {
        from { transform: translateY(40px); opacity: 0; }
        to   { transform: translateY(0);   opacity: 1; }
      }
      .op-fam { position: relative; transition: color .15s, padding-left .2s; }
      .op-fam .op-fam-arrow { opacity: 0; transform: translateX(-6px); transition: opacity .2s, transform .2s; }
      .op-fam:hover { color: #0b0b0a; padding-left: 4px; }
      .op-fam:hover .op-fam-arrow { opacity: 1; transform: translateX(0); }
      .op-dfam { color: rgba(255,255,255,0.55); transition: color .15s, padding-left .2s; }
      .op-dfam:hover { color: #fff; padding-left: 4px; }
      .op-dfam:hover .op-fam-arrow { opacity: 1; transform: translateX(0); }
      .op-dcat .op-dcat-line { transform: scaleX(0); transform-origin: left; transition: transform .3s ease; }
      .op-dcat-active .op-dcat-line { transform: scaleX(1); }
      .op-dcat:hover .op-dcat-name { color: #fff !important; }
      .op-cat-bar { transform: scaleY(0); transition: transform .25s ease; transform-origin: top; }
      .op-cat-active .op-cat-bar { transform: scaleY(1); }
    `}</style>
  );

  // ── MOBILE MODAL ────────────────────────────────────────────────────────────
  if (isMobileModal) {
    if (!isOpen) return null;
    return (
      <>
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50"
          style={{ zIndex: 10000 }}
        />
        <div
          className="fixed inset-0 bg-white flex flex-col overflow-y-auto"
          style={{ zIndex: 10001, animation: 'mobileProductsSlideUp 0.35s cubic-bezier(0.4,0,0.2,1) both' }}
        >
          {/* Header band */}
          <div
            className="sticky top-0 z-[1] shrink-0 relative overflow-hidden bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] px-5 pb-4"
            style={{ paddingTop: 'calc(18px + env(safe-area-inset-top))' }}
          >
            <div
              className="absolute inset-0 opacity-[0.07] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
                backgroundSize: '14px 14px',
                maskImage: 'linear-gradient(to bottom, #000, transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, #000, transparent)',
              }}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-[0.3em] text-white/50">Biogance</span>
                <span className="block mt-1 text-[15px] font-bold uppercase tracking-[0.12em] text-white">{t('ourProducts')}</span>
              </div>
              <button
                onClick={onClose}
                aria-label={t('closeMenu')}
                className="w-9 h-9 flex items-center justify-center border border-white/20 text-white cursor-pointer hover:bg-white/10 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="absolute bottom-0 left-0 h-[2px] w-16 bg-white" />
          </div>

          {/* Category Tabs */}
          <div
            className="flex overflow-x-auto shrink-0 border-b border-black/10 bg-white"
            style={{ scrollbarWidth: 'none' }}
          >
            {categories.map((cat) => {
              const isActive = activeCategory?.id === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat)}
                  className="shrink-0 flex items-center gap-2 px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap cursor-pointer bg-transparent border-0 transition-colors"
                  style={{
                    color: isActive ? '#0b0b0a' : '#8a8880',
                    borderBottom: isActive ? '2px solid #0b0b0a' : '2px solid transparent',
                    marginBottom: '-1px',
                  }}
                >
                  <CategoryIcon cat={cat} size="14px" active={isActive} />
                  {getName(cat)}
                </button>
              );
            })}
          </div>

          {/* Universes & Families */}
          <div className="flex-1 overflow-y-auto px-5 pt-6 pb-10">
            {universes.length === 0 ? (
              <p className="text-[13px] text-[#8a8880]">{t('noProducts')}</p>
            ) : (
              <div className="flex flex-col gap-7" key={activeCategory?.id} style={{ animation: 'ourProductsRise .3s ease both' }}>
                {universes.filter(u => (u.sub_categories || []).some(s => s.type === 'family')).map((universe, uIdx) => {
                  const families = (universe.sub_categories || []).filter(s => s.type === 'family');
                  if (families.length === 0) return null;
                  return (
                    <div key={universe.id}>
                      <div className="flex items-center gap-3 mb-1 pb-3 border-b border-black/10">
                        <span className="text-[10px] font-bold text-[#8a8880] tabular-nums">{String(uIdx + 1).padStart(2, '0')}</span>
                        <h3 className="text-[11px] font-bold text-[#0b0b0a] uppercase tracking-[0.14em] m-0">
                          {getName(universe)}
                        </h3>
                      </div>
                      <div className="flex flex-col">
                        {families.map((fam) => (
                          <div
                            key={fam.id}
                            className="op-fam flex items-center justify-between py-3 text-[13px] text-[#5c5a54] cursor-pointer border-b border-black/5"
                            onClick={() => goToFamily(activeCategory, fam)}
                          >
                            <span>{getName(fam)}</span>
                            <Arrow className="op-fam-arrow" />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {styles}
      </>
    );
  }
  // ── END MOBILE MODAL ─────────────────────────────────────────────────────────

  if (!shouldRender) return null;

  return (
    <div
      ref={menuRef}
      className="bg-white border-t border-black/10 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.25)] z-[999]"
      style={{
        position: 'fixed',
        top: '104px',
        left: 0,
        right: 0,
        minHeight: '440px',
        opacity: animateIn ? 1 : 0,
        transform: animateIn ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        pointerEvents: animateIn ? 'auto' : 'none',
      }}
      // Jab mouse dropdown se bahar (upar navbar center/right mein) jaaye toh close karo
      onMouseLeave={onClose}
    >
      <div className="flex min-h-[440px]">
        {/* Intro column — heading + species chips */}
        <div className="shrink-0 w-[290px] bg-[#f3f3f3] px-9 py-10 flex flex-col">
          <span className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.32em] text-[#8a8880]">
            <span className="w-5 h-px bg-[#0b0b0a]" />
            {t('ourProducts')}
          </span>
          <h2
            className="m-0 mt-5 text-[38px] leading-[1.02] italic text-[#0b0b0a]"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            {t('shopBySpecies')}
          </h2>
          <p className="m-0 mt-4 text-[12px] leading-relaxed text-[#5c5a54]">
            {t('speciesDescription')}
          </p>

          <div className="mt-8 flex flex-col gap-2">
            {categories.map((cat) => {
              const isActive = activeCategory?.id === cat.id;
              return (
                <button
                  key={cat.id}
                  onMouseEnter={() => setActiveCategory(cat)}
                  onClick={() => setActiveCategory(cat)}
                  className="w-full flex items-center justify-start gap-2.5 min-h-[38px] py-2 px-3.5 text-left text-[11px] leading-tight font-semibold uppercase tracking-[0.06em] cursor-pointer transition-colors duration-200"
                  style={{
                    background: isActive ? '#0b0b0a' : 'transparent',
                    color: isActive ? '#fff' : '#0b0b0a',
                    border: isActive ? '1px solid #0b0b0a' : '0.5px solid rgba(0,0,0,0.10)',
                  }}
                >
                  <span className="w-4 shrink-0 flex items-center justify-center"><CategoryIcon cat={cat} size="14px" active={isActive} light={isActive} /></span>
                  <span className="flex-1 min-w-0">{getName(cat)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Universes — columns with oversized numerals */}
        <div className="flex-1 min-w-0 overflow-y-auto px-10 py-10">
          {universes.length === 0 ? (
            <p className="text-[#8a8880] text-sm">{t('noProducts')}</p>
          ) : (
            <div
              key={activeCategory?.id}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-10"
              style={{ animation: 'ourProductsRise .3s ease both' }}
            >
              {universes.filter(u => (u.sub_categories || []).some(s => s.type === 'family')).map((universe, uIdx) => {
                const families = (universe.sub_categories || []).filter(s => s.type === 'family');
                if (families.length === 0) return null;
                return (
                  <div key={universe.id} className="flex flex-col min-w-0">
                    <span
                      className="block text-[46px] leading-none italic text-[#e4e2dc] select-none"
                      style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                    >
                      {String(uIdx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="m-0 mt-3 mb-3 pb-3 border-b border-[#0b0b0a] text-[11px] font-bold text-[#0b0b0a] uppercase tracking-[0.16em]">
                      {getName(universe)}
                    </h3>
                    <div className="flex flex-col">
                      {families.map((fam) => (
                        <div
                          key={fam.id}
                          className="op-fam flex items-center justify-between gap-2 py-2 text-[13px] text-[#5c5a54] cursor-pointer border-b border-black/5"
                          onClick={() => goToFamily(activeCategory, fam)}
                        >
                          <span className="truncate">{getName(fam)}</span>
                          <Arrow className="op-fam-arrow shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Featured — full-bleed image card with caption overlay */}
        {productImages.length > 0 && (
          <div className="shrink-0 w-[310px] p-6 pl-0">
            <div className="relative w-full h-full min-h-[392px] bg-[#f3f3f3] overflow-hidden">
              <img
                key={activeImageIndex}
                src={getImageUrl(productImages[activeImageIndex]?.media)}
                alt={t('productImage', { n: activeImageIndex + 1 })}
                className="absolute inset-0 w-full h-full"
                style={{
                  animation: 'fadeIn 0.3s ease',
                  objectFit: (activeImageIndex === 0 || activeImageIndex === productImages.length - 1) ? 'contain' : 'cover',
                }}
                onError={(e) => {
                  const next = (activeImageIndex + 1) % productImages.length;
                  if (next !== activeImageIndex) setActiveImageIndex(next);
                }}
              />

              <span className="absolute top-3 left-3 bg-[#0b0b0a] text-white text-[9px] font-bold uppercase tracking-[0.3em] px-2.5 py-1.5">
                {t('featured')}
              </span>
              {productImages.length > 1 && (
                <span className="absolute top-3 right-3 text-[10px] font-semibold text-[#5c5a54] tabular-nums">
                  {String(activeImageIndex + 1).padStart(2, '0')} / {String(productImages.length).padStart(2, '0')}
                </span>
              )}

              {(productName || featuredProduct) && (
                <div className="absolute left-0 right-0 bottom-0 bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] text-white px-4 pt-3 pb-4">
                  {productImages.length > 1 && (
                    <div className="flex gap-1 mb-3">
                      {productImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleDotClick(idx)}
                          aria-label={t('showImage', { n: idx + 1 })}
                          className="h-[2px] p-0 border-0 cursor-pointer transition-all duration-300"
                          style={{
                            width: idx === activeImageIndex ? '22px' : '10px',
                            backgroundColor: idx === activeImageIndex ? '#fff' : 'rgba(255,255,255,0.3)',
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <p className="m-0 text-[13px] font-medium leading-snug line-clamp-2">{productName}</p>
                  {featuredProduct && (
                    <button
                      onMouseEnter={() => setCartHovered(true)}
                      onMouseLeave={() => setCartHovered(false)}
                      onClick={isSingleProduct ? handleAddToCart : (e) => { e.stopPropagation(); onQuickViewOpen?.(featuredProduct); }}
                      className="mt-3 inline-flex items-center gap-2 p-0 bg-transparent border-0 border-b cursor-pointer text-white text-[11px] font-bold uppercase tracking-[0.12em]"
                      style={{ borderBottom: cartHovered ? '1px solid #fff' : '1px solid rgba(255,255,255,0.35)', paddingBottom: '2px' }}
                    >
                      {addingToCart ? (
                        <span style={{
                          display: 'inline-block',
                          width: '11px',
                          height: '11px',
                          borderRadius: '50%',
                          border: '1.5px solid rgba(255,255,255,0.3)',
                          borderTopColor: '#fff',
                          animation: 'ourProductsSpin 0.65s linear infinite',
                          flexShrink: 0,
                        }} />
                      ) : (
                        <>
                          {isSingleProduct ? t('addToCart') : t('quickView')}
                          <Arrow />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {styles}
    </div>
  );
}
