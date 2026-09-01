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
  const { i18n } = useTranslation();
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
        toast.error(res.data.action || 'Could not add to cart.');
      } else {
        mergeCartItem(res.data.data);
        onCartOpen?.(featuredProduct);
      }
    } catch {
      toast.error('Something went wrong.');
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

  // ── MOBILE MODAL ────────────────────────────────────────────────────────────
  if (isMobileModal) {
    if (!isOpen) return null;
    return (
      <>
        {/* Backdrop */}
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 10000,
          }}
        />
        {/* Slide-up panel — full page on small screens, so it covers the
            whole viewport instead of leaving a gap at the top showing the
            dark backdrop over the navbar behind it. */}
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            backgroundColor: '#fff',
            zIndex: 10001,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            animation: 'mobileProductsSlideUp 0.35s cubic-bezier(0.4,0,0.2,1) both',
          }}
        >
          {/* Header — extra top padding for env(safe-area-inset-top) since
              the panel now sits at top:0 (full page) and would otherwise
              land under the iOS status bar/notch. */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              paddingTop: 'calc(16px + env(safe-area-inset-top))',
              borderBottom: '1px solid #dadada',
              flexShrink: 0,
              position: 'sticky',
              top: 0,
              backgroundColor: '#fff',
              zIndex: 1,
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Our products
            </span>
            <button
              onClick={onClose}
              aria-label="Close menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Category Tabs */}
          <div
            style={{
              display: 'flex',
              overflowX: 'auto',
              borderBottom: '1px solid #eee',
              flexShrink: 0,
              scrollbarWidth: 'none',
            }}
          >
            {categories.map((cat) => {
              const isActive = activeCategory?.id === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: isActive ? '#111' : '#999',
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '1px solid #111' : '2px solid transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.2s, border-color 0.2s',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {(cat.black_media || cat.media) && (
                    <img
                      src={getImageUrl(cat.black_media || cat.media)}
                      alt=""
                      style={{
                        width: '14px',
                        height: '14px',
                        objectFit: 'contain',
                        flexShrink: 0,
                        filter: 'brightness(0)',
                        opacity: isActive ? 1 : 0.5,
                      }}
                    />
                  )}
                  {getName(cat)}
                </button>
              );
            })}
          </div>

          {/* Universes & Families */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '22px 20px 32px' }}>
            {universes.length === 0 ? (
              <p style={{ color: '#aaa', fontSize: '13px' }}>No products found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
                {universes.map((universe) => {
                  const families = (universe.sub_categories || []).filter(s => s.type === 'family');
                  if (families.length === 0) return null;
                  return (
                    <div key={universe.id}>
                      <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', paddingBottom: '8px', borderBottom: '0.5px solid #dadada' }}>
                        {getName(universe)}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {families.map((fam) => (
                          <div
                            key={fam.id}
                            style={{ fontSize: '13px', color: '#444', padding: '10px 0', cursor: 'pointer', }}
                            onClick={() => goToFamily(activeCategory, fam)}
                          >
                            {getName(fam)}
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
        <style>{`
          @keyframes mobileProductsSlideUp {
            from { transform: translateY(40px); opacity: 0; }
            to   { transform: translateY(0);   opacity: 1; }
          }
        `}</style>
      </>
    );
  }
  // ── END MOBILE MODAL ─────────────────────────────────────────────────────────

  if (!shouldRender) return null;

  return (
    <div
      ref={menuRef}
      className="bg-white shadow-lg z-[999]"
      style={{
        position: 'fixed',
        top: '104px',
        left: 0,
        right: 0,
        minHeight: '420px',
        opacity: animateIn ? 1 : 0,
        transform: animateIn ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        pointerEvents: animateIn ? 'auto' : 'none',
      }}
      // Jab mouse dropdown se bahar (upar navbar center/right mein) jaaye toh close karo
      onMouseLeave={onClose}
    >
      {/* Top — Category Tabs */}
      <div className="flex items-center gap-9 px-10  overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {categories.map((cat) => {
          const isActive = activeCategory?.id === cat.id;
          return (
            <button
              key={cat.id}
              onMouseEnter={() => setActiveCategory(cat)}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 cursor-pointer py-4 -mb-px flex items-center gap-2"
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: isActive ? '#111' : '#999',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid #111' : '2px solid transparent',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              {(cat.black_media || cat.media) && (
                <img
                  src={getImageUrl(cat.black_media || cat.media)}
                  alt=""
                  style={{
                    width: '18px',
                    height: '18px',
                    objectFit: 'contain',
                    flexShrink: 0,
                    filter: 'brightness(0)',
                    opacity: isActive ? 1 : 0.5,
                  }}
                />
              )}
              {getName(cat)}
            </button>
          );
        })}
      </div>

      {/* Bottom — Universes/Families (left) + Featured Product (right) */}
      <div className="flex">
        {/* Left — Universes Grid */}
        <div className="flex-1 overflow-y-auto px-10 py-9">
          {universes.length === 0 ? (
            <p className="text-gray-400 text-sm">No products found.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-8">
              {universes.map((universe) => {
                const families = (universe.sub_categories || []).filter(s => s.type === 'family');
                if (families.length === 0) return null;
                return (
                  <div key={universe.id} className="flex flex-col min-w-0">
                    <h3 className="text-[11px] font-bold text-black uppercase tracking-widest mb-3 pb-2" style={{ borderBottom: '0.5px solid #dddddd' }}>
                      {getName(universe)} 
                    </h3>
                    <div className="flex flex-col">
                      {families.map((fam) => (
                        <div
                          key={fam.id}
                          className="text-[13px] text-gray-600 hover:text-black hover:underline cursor-pointer transition-colors duration-150 py-1.5 "
                          onClick={() => goToFamily(activeCategory, fam)}
                        >
                          {getName(fam)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right — Product Image Carousel */}
        {productImages.length > 0 && (
          <div
            className="flex-shrink-0 flex flex-col items-center justify-center gap-4 py-9 px-6 border-l border-gray-100"
            style={{ width: '320px' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-black self-start">
              Featured
            </span>
            <div
              className="w-full bg-[#f3f3f3] flex items-center justify-center overflow-hidden"
              style={{ height: '340px' }}
            >
              <img
                key={activeImageIndex}
                src={getImageUrl(productImages[activeImageIndex]?.media)}
                alt={`Product image ${activeImageIndex + 1}`}
                className="w-full h-full"
                style={{
                  animation: 'fadeIn 0.3s ease',
                  objectFit: (activeImageIndex === 0 || activeImageIndex === productImages.length - 1) ? 'contain' : 'cover',
                }}
                onError={(e) => {
                  const next = (activeImageIndex + 1) % productImages.length;
                  if (next !== activeImageIndex) setActiveImageIndex(next);
                }}
              />
            </div>

            {productImages.length > 1 && (
              <div className="flex items-center gap-1.5 self-start">
                {productImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleDotClick(idx)}
                    aria-label={`Show image ${idx + 1}`}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      backgroundColor: idx === activeImageIndex ? '#111' : '#ddd',
                      transition: 'background-color 0.2s',
                    }}
                  />
                ))}
              </div>
            )}

            {(productName || featuredProduct) && (
              <div className="w-full text-left">
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#111', lineHeight: 1.4, margin: 0 }}>
                  {productName}
                </p>
                {featuredProduct && (
                  <button
                    onMouseEnter={() => setCartHovered(true)}
                    onMouseLeave={() => setCartHovered(false)}
                    onClick={isSingleProduct ? handleAddToCart : (e) => { e.stopPropagation(); onQuickViewOpen?.(featuredProduct); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      marginTop: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#111',
                      borderBottom: cartHovered ? '1px solid #111' : '1px solid transparent',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {addingToCart ? (
                      <span style={{
                        display: 'inline-block',
                        width: '11px',
                        height: '11px',
                        borderRadius: '50%',
                        border: '1px solid #ccc',
                        borderTopColor: '#111',
                        animation: 'ourProductsSpin 0.65s linear infinite',
                        flexShrink: 0,
                      }} />
                    ) : (isSingleProduct ? 'Add to cart' : 'Quick view')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ourProductsSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
