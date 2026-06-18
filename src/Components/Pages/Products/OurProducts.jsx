"use client"

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MEDIA_URL, BASE_URL } from '../../API/API';
import axios from 'axios';
import toast from 'react-hot-toast';
import { mergeCartItem } from '../../../utils/cartStorage';
import { getDeviceId } from '../../../utils/deviceId';
import ModalAddToCart from '../Modal/ModalAddToCart';
import ModalQuickView from '../Modal/ModalQuickView';

export default function Products({ isOpen, onClose, categories = [], triggerRef, popular = [] }) {
  const { i18n } = useTranslation();
  const isFrench = i18n.language === 'fr';
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const menuRef = useRef(null);
  const autoScrollRef = useRef(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartHovered, setCartHovered] = useState(false);

  const getName = (item) => isFrench ? (item.french_name || item.name) : item.name;

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories]);

  useEffect(() => {
    if (isOpen && categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setActiveImageIndex(0);
  }, [isOpen]);

  const featuredProduct = popular[0] || null;

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
      setIsCartOpen(true);
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
        setIsCartOpen(true);
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

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="bg-white shadow-lg z-[999] flex"
      style={{
        position: 'fixed',
        top: '104px',
        left: 0,
        right: 0,
        minHeight: '420px',
      }}
      // Jab mouse dropdown se bahar (upar navbar center/right mein) jaaye toh close karo
      onMouseLeave={onClose}
    >
      {/* Left Sidebar - Categories */}
      <div className="w-[200px] bg-[#2a2a2a] flex-shrink-0 py-4">
        {categories.map((cat) => {
          const isActive = activeCategory?.id === cat.id;
          return (
            <button
              key={cat.id}
              onMouseEnter={() => setActiveCategory(cat)}
              onClick={() => setActiveCategory(cat)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-200 cursor-pointer ${
                isActive ? 'bg-white text-black' : 'text-white hover:bg-[#3a3a3a]'
              }`}
            >
              {(cat.black_media || cat.media) && (
                <img
                  src={getImageUrl(isActive ? cat.black_media : (cat.media || cat.black_media))}
                  alt={getName(cat)}
                  className="w-5 h-5 object-contain flex-shrink-0"
                />
              )}
              <span className="text-xs font-medium truncate min-w-0 flex-1 text-left">
                {getName(cat)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Middle — Universes Grid */}
      <div className="flex-1 overflow-y-auto px-10 py-8">
        {universes.length === 0 ? (
          <p className="text-gray-400 text-sm">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-7">
            {universes.map((universe) => {
              const families = (universe.sub_categories || []).filter(s => s.type === 'family');
              return (
                <div key={universe.id} className="flex flex-col">
                  <h3 className="text-xs font-semibold text-black uppercase tracking-wider mb-3">
                    {getName(universe)}
                  </h3>
                  <div className="space-y-1.5">
                    {families.map((fam) => (
                      <div
                        key={fam.id}
                        className="text-xs text-gray-500 hover:text-black hover:underline cursor-pointer transition-all duration-200"
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
          className="flex-shrink-0 flex flex-col mr-50 items-center justify-center gap-3 py-8 px-5"
          style={{ width: '330px' }}
        >
          <div
            className="w-full bg-[#f3f3f3] flex items-center justify-center overflow-hidden"
            style={{ height: '350px' }}
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

          {(productName || featuredProduct) && (
            <p
              className="text-left text-gray-800 leading-snug px-1 w-full"
              style={{ fontSize: '12px', fontWeight: 500, textDecoration:"underline", lineHeight: 1.4 }}
            >
              {productName}
              {featuredProduct && (
                <>
                  {' '}
                  <button
                    onMouseEnter={() => setCartHovered(true)}
                    onMouseLeave={() => setCartHovered(false)}
                    onClick={isSingleProduct ? handleAddToCart : (e) => { e.stopPropagation(); setIsQuickViewOpen(true); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      marginLeft:"5px",
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#111',
                      textDecoration: cartHovered ? 'underline' : 'none',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      verticalAlign: 'middle',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
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
                    ) : (isSingleProduct ? 'Add to Cart' : 'Quick View ')}
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      )}

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

      <ModalAddToCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        product={featuredProduct || {}}
      />
      <ModalQuickView
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onCartOpen={() => setIsCartOpen(true)}
        product={featuredProduct || {}}
        fullProductData={featuredProduct?._raw || featuredProduct || {}}
      />
    </div>
  );
}