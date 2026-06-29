"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { MEDIA_URL, BASE_URL } from "../../API/API";
import axios from "axios";
import toast from "react-hot-toast";
import { mergeCartItem } from "../../../utils/cartStorage";
import { getDeviceId } from "../../../utils/deviceId";

export default function Products({
  isOpen,
  onClose,
  categories = [],
  triggerRef,
  popular = [],
  onCartOpen,
  onQuickViewOpen,
  onFeaturedProductChange,
  isMobileModal = false,
}) {
  const { i18n } = useTranslation();
  const isFrench = i18n.language === "fr";

  const getName = (item) => {
    if (!item) return "";
    return isFrench ? item.french_name || item.name || "" : item.name || "";
  };

  const [activeCategory, setActiveCategory] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const menuRef = useRef(null);
  const autoScrollRef = useRef(null);

  // Issue 1: Har baar open ho to first category select ho
  useEffect(() => {
    if (categories.length > 0) {
      setActiveCategory(categories[0]);
    }
  }, [isOpen, categories]);

  const [addingToCart, setAddingToCart] = useState(false);
  const [cartHovered, setCartHovered] = useState(false);

  // Load header_suggest_products from splashData localStorage
  const [suggestedProduct, setSuggestedProduct] = useState(null);
  useEffect(() => {
    const load = () => {
      try {
        const cached = localStorage.getItem("splashData");
        if (cached) {
          const parsed = JSON.parse(cached);
          const suggested = parsed?.header_suggest_products?.[0] || null;
          setSuggestedProduct(suggested);
        }
      } catch (e) {}
    };
    load();
    window.addEventListener("splashDataReady", load);
    return () => window.removeEventListener("splashDataReady", load);
  }, []);

  // Use splashData suggested product instead of popular prop
  const featuredProduct = suggestedProduct || popular[0] || null;

  const rawImages = featuredProduct?.products?.[0]?.images || [];
  const productImages = rawImages.filter(
    (img) => img?.media && img.media.trim() !== "",
  );

  const productName = featuredProduct
    ? isFrench
      ? featuredProduct.french_name || featuredProduct.name
      : featuredProduct.name
    : "";

  const handleDotClick = (index) => setActiveImageIndex(index);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    if (!isOpen || productImages.length <= 1) return;
    autoScrollRef.current = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % productImages.length);
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
      const loginData = JSON.parse(localStorage.getItem("LoginData") || "null");
      const token = loginData?.data?.token;
      const res = await axios.post(
        `${BASE_URL}/user/cart/create`,
        token
          ? { product_id: firstProduct?.id ?? featuredProduct.id, quantity: 1 }
          : {
              device_id: getDeviceId(),
              product_id: firstProduct?.id ?? featuredProduct.id,
              quantity: 1,
            },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {},
      );
      if (res.data.status === false) {
        toast.error(res.data.action || "Could not add to cart.");
      } else {
        mergeCartItem(res.data.data);
        onCartOpen?.(featuredProduct);
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setAddingToCart(false);
    }
  };

  const isSingleProduct = (featuredProduct?.products?.length ?? 1) === 1;

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${MEDIA_URL}${path}`;
  };

  const universes = (activeCategory?.sub_categories || []).filter(
    (s) => s.type === "universe",
  );

  if (!isOpen) return null;

  // ── MOBILE MODAL ────────────────────────────────────────────────────────────
  if (isMobileModal) {
    return (
      <>
        {/* Backdrop */}
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 10000,
          }}
        />
        {/* Slide-up panel */}
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            top: "60px",
            backgroundColor: "#fff",
            zIndex: 10001,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            animation:
              "mobileProductsSlideUp 0.35s cubic-bezier(0.4,0,0.2,1) both",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid #111",
              flexShrink: 0,
              position: "sticky",
              top: 0,
              backgroundColor: "#fff",
              zIndex: 1,
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#111",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Our products
            </span>
            <button
              onClick={onClose}
              aria-label="Close menu"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "4px",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#111"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Category Tabs */}
          <div
            style={{
              display: "flex",
              overflowX: "auto",
              borderBottom: "1px solid #eee",
              flexShrink: 0,
              scrollbarWidth: "none",
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
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "12px 16px",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: isActive ? "#111" : "#999",
                    background: "none",
                    border: "none",
                    borderBottom: isActive
                      ? "2px solid #111"
                      : "2px solid transparent",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "color 0.2s, border-color 0.2s",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {(cat.black_media || cat.media) && (
                    <img
                      src={getImageUrl(cat.black_media || cat.media)}
                      alt=""
                      style={{
                        width: "14px",
                        height: "14px",
                        objectFit: "contain",
                        flexShrink: 0,
                        filter: "brightness(0)",
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
          <div
            style={{ flex: 1, overflowY: "auto", padding: "22px 20px 32px" }}
          >
            {universes.length === 0 ? (
              <p style={{ color: "#aaa", fontSize: "13px" }}>
                No products found.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "26px",
                }}
              >
                {universes.map((universe) => {
                  const families = (universe.sub_categories || []).filter(
                    (s) => s.type === "family",
                  );
                  return (
                    <div key={universe.id}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "10px",
                          marginBottom: "12px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 500,
                            color: "#111",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {getName(universe)}
                        </span>
                        <span
                          style={{
                            flex: 1,
                            height: "1px",
                            backgroundColor: "#eee",
                          }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {families.map((fam) => (
                          <div
                            key={fam.id}
                            style={{
                              fontSize: "14px",
                              color: "#555",
                              padding: "9px 0",
                              cursor: "pointer",
                            }}
                            onClick={onClose}
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

  return (
    <div
      ref={menuRef}
      className="bg-white shadow-lg z-[999] flex"
      style={{
        position: "fixed",
        top: "104px",
        left: 0,
        right: 0,
        minHeight: "420px",
      }}
      // Jab mouse dropdown se bahar (upar navbar center/right mein) jaaye toh close karo
      onMouseLeave={onClose}
    >
      {/* Left — Icon-only category rail */}
      <div
        className="flex-shrink-0 flex flex-col items-center border-r border-gray-100"
        style={{ width: "64px", padding: "24px 0", gap: "22px" }}
      >
        {categories.map((cat) => {
          const isActive = activeCategory?.id === cat.id;
          return (
            <button
              key={cat.id}
              onMouseEnter={() => setActiveCategory(cat)}
              onClick={() => setActiveCategory(cat)}
              aria-label={getName(cat)}
              className="flex flex-col items-center cursor-pointer bg-transparent border-none"
              style={{ gap: "6px" }}
            >
              {cat.black_media || cat.media ? (
                <img
                  src={getImageUrl(cat.black_media || cat.media)}
                  alt=""
                  style={{
                    width: "22px",
                    height: "22px",
                    objectFit: "contain",
                    filter: "brightness(0)",
                    opacity: isActive ? 1 : 0.4,
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize: "11px",
                    color: isActive ? "#111" : "#999",
                  }}
                >
                  {getName(cat).slice(0, 2)}
                </span>
              )}
              {isActive && (
                <span
                  style={{
                    width: "18px",
                    height: "2px",
                    backgroundColor: "#111",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Middle — Universes & Families, editorial list style */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "32px 36px" }}>
        <p
          style={{
            fontFamily: "var(--font-voice, Georgia, serif)",
            fontSize: "19px",
            color: "#111",
            margin: "0 0 24px",
          }}
        >
          {getName(activeCategory)}
        </p>

        {universes.length === 0 ? (
          <p className="text-gray-400 text-sm">No products found.</p>
        ) : (
          <div
            className="grid grid-cols-2 md:grid-cols-3"
            style={{ columnGap: "48px" }}
          >
            {universes.map((universe) => {
              const families = (universe.sub_categories || []).filter(
                (s) => s.type === "family",
              );
              return (
                <div
                  key={universe.id}
                  style={{ marginBottom: "22px" }}
                  className="min-w-0"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "10px",
                      marginBottom: "2px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#111",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getName(universe)}
                    </span>
                  </div>
                  {families.map((fam) => (
                    <a
                      href="#"
                      style={{
                        fontSize: "14px",
                        color: "#555",
                        textDecoration: "none",
                        padding: "9px 0",
                        display: "block",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = "underline";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = "none";
                      }}
                    >
                      {getName(fam)}
                    </a>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right — Compact featured product card */}
      {productImages.length > 0 && (
        <div
          className="flex-shrink-0 border-l border-gray-100 flex flex-col"
          style={{ width: "200px", padding: "32px 24px" }}
        >
          <div
            className="w-full bg-[#f3f3f3] flex items-center justify-center overflow-hidden"
            style={{
              aspectRatio: "1",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <img
              key={activeImageIndex}
              src={getImageUrl(productImages[activeImageIndex]?.media)}
              alt={`Product image ${activeImageIndex + 1}`}
              className="w-full h-full"
              style={{
                animation: "fadeIn 0.3s ease",
                objectFit:
                  activeImageIndex === 0 ||
                  activeImageIndex === productImages.length - 1
                    ? "contain"
                    : "cover",
              }}
              onError={(e) => {
                const next = (activeImageIndex + 1) % productImages.length;
                if (next !== activeImageIndex) setActiveImageIndex(next);
              }}
            />
          </div>

          {(productName || featuredProduct) && (
            <p
              style={{
                fontSize: "13px",
                color: "#111",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {productName}
            </p>
          )}

          {productImages.length > 1 && (
            <div
              className="flex items-center"
              style={{ gap: "4px", margin: "10px 0 14px" }}
            >
              {productImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDotClick(idx)}
                  aria-label={`Show image ${idx + 1}`}
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    backgroundColor: idx === activeImageIndex ? "#111" : "#ddd",
                    transition: "background-color 0.2s",
                  }}
                />
              ))}
            </div>
          )}

          {featuredProduct && (
            <button
              onMouseEnter={() => setCartHovered(true)}
              onMouseLeave={() => setCartHovered(false)}
              onClick={
                isSingleProduct
                  ? handleAddToCart
                  : (e) => {
                      e.stopPropagation();
                      onQuickViewOpen?.(featuredProduct);
                    }
              }
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                marginTop: productImages.length > 1 ? 0 : "14px",
                fontSize: "11px",
                fontWeight: 500,
                color: "#111",
                borderBottom: cartHovered
                  ? "1px solid #111"
                  : "1px solid transparent",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                width: "fit-content",
              }}
            >
              {addingToCart ? (
                <span
                  style={{
                    display: "inline-block",
                    width: "11px",
                    height: "11px",
                    borderRadius: "50%",
                    border: "1px solid #ccc",
                    borderTopColor: "#111",
                    animation: "ourProductsSpin 0.65s linear infinite",
                    flexShrink: 0,
                  }}
                />
              ) : isSingleProduct ? (
                "Add to cart"
              ) : (
                "Quick view"
              )}
            </button>
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
    </div>
  );
}