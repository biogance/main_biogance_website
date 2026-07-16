"use client";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { IoClose, IoLocationOutline, IoSearch } from "react-icons/io5";
import { CgSpinner } from "react-icons/cg";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { BASE_URL } from "../../API/API";

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const FALLBACK_COUNTRY = "FR";
const FALLBACK_POSTAL_CODE = "49000";

async function resolveServicePointParams(initialCountry, initialPostalCode) {
  // 1. Props from Checkout delivery address
  if (initialCountry && initialPostalCode) {
    return { country: initialCountry.toUpperCase(), postalCode: initialPostalCode };
  }

  // 2. SplashData delivery_address
  try {
    const splash = JSON.parse(localStorage.getItem("splashData") || "null");
    const addr = splash?.user?.delivery_address;
    if (addr?.country && addr?.postal_code) {
      return { country: addr.country.toUpperCase(), postalCode: addr.postal_code };
    }
  } catch { /* fall through */ }

  // 3. IP-based country detection (via server-side API route)
  try {
    const res = await fetch("/api/geoip");
    const data = await res.json();
    if (data?.countryCode && data?.zip) {
      return { country: data.countryCode.toUpperCase(), postalCode: data.zip };
    }
    if (data?.countryCode) {
      return { country: data.countryCode.toUpperCase(), postalCode: FALLBACK_POSTAL_CODE };
    }
  } catch { /* fall through */ }

  // 4. Fallback
  return { country: FALLBACK_COUNTRY, postalCode: FALLBACK_POSTAL_CODE };
}

function mapServicePoint(point) {
  return {
    id: point.id,
    name: point.name,
    address: [
      [point.house_number, point.street].filter(Boolean).join(" "),
      [point.postal_code, point.city].filter(Boolean).join(" "),
    ]
      .filter(Boolean)
      .join(", "),
    lat: point.latitude,
    lng: point.longitude,
  };
}

export default function ModalPickLocation({ isOpen, onClose, onSelectLocation, initialCountry, initialPostalCode }) {
  const { t } = useTranslation("checkout");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchServicePoints = async (params) => {
      const res = await fetch(`${BASE_URL}/user/order/get/service/point`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, radius: 50000 }),
      });
      return res.json();
    };

    const load = async () => {
      setLoading(true);
      try {
        const params = await resolveServicePointParams(initialCountry, initialPostalCode);
        let data = await fetchServicePoints(params);
        if (data.status === false) {
          toast.error(data.action || "Something went wrong.");
          setLocations([]);
          return;
        }

        let points = data.data || [];
        const isFallback =
          params.country === FALLBACK_COUNTRY &&
          params.postalCode === FALLBACK_POSTAL_CODE;

        if (points.length === 0 && !isFallback) {
          data = await fetchServicePoints({
            country: FALLBACK_COUNTRY,
            postalCode: FALLBACK_POSTAL_CODE,
          });
          if (data.status === false) {
            toast.error(data.action || "Something went wrong.");
            setLocations([]);
            return;
          }
          points = data.data || [];
        }

        setLocations(points.map(mapServicePoint));
      } catch {
        toast.error("Something went wrong. Please try again.");
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, initialCountry, initialPostalCode]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      return () => {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;


  // Filter locations based on search query
  const filteredLocations = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return ReactDOM.createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 99999,
        fontFamily: FONT,
      
        transition: "opacity 0.25s ease-in-out",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          width: "100%",
          maxWidth: "540px",
         
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
          overflow: "hidden",
          border: "1px solid #eee",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#111" }}>
            {t("selectPickupLocationTitle")}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#666",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
              borderRadius: "50%",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: "18px 24px 12px" }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              border: "1.5px solid #ddd",
             
              padding: "0 14px",
              backgroundColor: "#fcfcfc",
              transition: "border-color 0.2s",
            }}
            onFocusCapture={(e) => (e.currentTarget.style.borderColor = "#111")}
            onBlurCapture={(e) => (e.currentTarget.style.borderColor = "#ddd")}
          >
            <IoSearch size={18} color="#999" style={{ marginRight: "10px", flexShrink: 0 }} />
            <input
              type="text"
              placeholder={t("searchPickupPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                padding: "12px 0",
                fontSize: "14px",
                color: "#111",
                background: "transparent",
                fontFamily: FONT,
              }}
            />
          </div>
        </div>

        {/* Locations List */}
        <div
          className="[&::-webkit-scrollbar]:hidden"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 24px 24px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "40px 0",
              }}
            >
              <CgSpinner
                size={38}
                style={{
                  color: "#000000",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          ) : filteredLocations.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredLocations.map((loc) => {
                const isHovered = hoveredId === loc.id;
                return (
                  <div
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      onClose();
                    }}
                    onMouseEnter={() => setHoveredId(loc.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "14px 16px",
                     
                      border: "1px solid #eee",
                      cursor: "pointer",
                      backgroundColor: isHovered ? "#f9f9f9" : "#fff",
                      transition: "all 0.15s ease",
                      transform: isHovered ? "translateX(2px)" : "none",
                    }}
                  >
                    {/* Left Icon */}
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                       
                        backgroundColor: isHovered ? "#111" : "#f5f5f5",
                        color: isHovered ? "#fff" : "#111",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <IoLocationOutline size={18} />
                    </div>

                    {/* Right text container */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#111",
                          marginBottom: "4px",
                        }}
                      >
                        {loc.name}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={`${t("latLng", { lat: loc.lat, lng: loc.lng })} • ${loc.address}`}
                      >
                       
                        {loc.address}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#888",
                fontSize: "14px",
              }}
            >
              {t("noLocationsFound", { query: searchQuery })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
