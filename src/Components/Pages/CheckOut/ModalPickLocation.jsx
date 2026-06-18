"use client";
import React, { useState, useEffect } from "react";
import { IoClose, IoLocationOutline, IoSearch } from "react-icons/io5";

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const PICKUP_LOCATIONS = [
  {
    id: 1,
    name: "Paris Central Depot",
    address: "12 Rue de la Paix, 75002 Paris, Île-de-France, France",
    lat: "48.8698",
    lng: "2.3312",
  },
  {
    id: 2,
    name: "Biogance Pickup - Lyon Sud",
    address: "45 Avenue Jean Jaurès, 69007 Lyon, Auvergne-Rhône-Alpes, France",
    lat: "45.7485",
    lng: "4.8357",
  },
  {
    id: 3,
    name: "Marseille Vieux-Port Point",
    address: "88 Quai du Port, 13002 Marseille, Provence-Alpes-Côte d'Azur, France",
    lat: "43.2965",
    lng: "5.3700",
  },
  {
    id: 4,
    name: "Nantes Distribution Relay",
    address: "102 Route de Clisson, 44230 Saint-Sébastien-sur-Loire, Pays de la Loire, France",
    lat: "47.2081",
    lng: "-1.5414",
  },
  {
    id: 5,
    name: "Strasbourg Center Relay",
    address: "14 Rue du Vieux-Marché-aux-Poissons, 67000 Strasbourg, Grand Est, France",
    lat: "48.5800",
    lng: "7.7500",
  },
  {
    id: 6,
    name: "Lille Grand-Place Hub",
    address: "5 Rue des Débris Saint-Étienne, 59800 Lille, Hauts-de-France, France",
    lat: "50.6372",
    lng: "3.0633",
  },
  {
    id: 7,
    name: "Bordeaux Chartrons Depot",
    address: "22 Cours du Portal, 33000 Bordeaux, Nouvelle-Aquitaine, France",
    lat: "44.8542",
    lng: "-0.5721",
  },
  {
    id: 8,
    name: "Toulouse Capitole Express",
    address: "17 Rue Lafayette, 31000 Toulouse, Occitanie, France",
    lat: "43.6045",
    lng: "1.4440",
  }
];

export default function ModalPickLocation({ isOpen, onClose, onSelectLocation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState(null);

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
  const filteredLocations = PICKUP_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
        zIndex: 2000,
        fontFamily: FONT,
        backdropFilter: "blur(2px)",
        transition: "opacity 0.25s ease-in-out",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          width: "100%",
          maxWidth: "540px",
          borderRadius: "8px",
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
            Select Pickup Location
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
              borderRadius: "6px",
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
              placeholder="Search pickup points or cities..."
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
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 24px 24px",
            scrollbarWidth: "thin",
          }}
        >
          {filteredLocations.length > 0 ? (
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
                      borderRadius: "6px",
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
                        borderRadius: "50%",
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
                        title={`Lat: ${loc.lat}, Lng: ${loc.lng} • ${loc.address}`}
                      >
                        <span style={{ fontWeight: 500, color: "#444" }}>
                          Lat: {loc.lat}, Lng: {loc.lng}
                        </span>
                        {" • "}
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
              No locations found for "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
