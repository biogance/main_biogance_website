"use client";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaStar, FaStarHalfAlt, FaRegStar, FaPlus } from "react-icons/fa";
import ProductModalAddReview from "./ProductModalAddReview";
import { RxCross2 } from "react-icons/rx";

const getReviews = (t) => [
  {
    id: 1,
    name: t("review_1_name"),
    role: t("verifiedBuyer"),
    date: "18/03/2026",
    rating: 4,
    text: t("review_1_text"),
  },
  {
    id: 2,
    name: t("review_2_name"),
    role: t("verifiedBuyer"),
    date: "18/03/2026",
    rating: 4,
    text: t("review_2_text"),
  },
  {
    id: 3,
    name: t("review_3_name"),
    role: t("verifiedBuyer"),
    date: "18/03/2026",
    rating: 3.5,
    text: t("review_3_text"),
  },
  {
    id: 4,
    name: t("review_4_name"),
    role: t("verifiedBuyer"),
    date: "12/02/2026",
    rating: 5,
    text: t("review_4_text"),
  },
  {
    id: 5,
    name: t("review_5_name"),
    role: t("verifiedBuyer"),
    date: "05/01/2026",
    rating: 4,
    text: t("review_5_text"),
  },
  {
    id: 6,
    name: t("review_6_name"),
    role: t("verifiedBuyer"),
    date: "28/12/2025",
    rating: 5,
    text: t("review_6_text"),
  },
];

const ratingBreakdown = [
  { star: 5, width: "78%" },
  { star: 4, width: "62%" },
  { star: 3, width: "28%" },
  { star: 2, width: "14%" },
  { star: 1, width: "7%" },
];

const StarRow = ({ rating, size = 14 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((star) => {
      const s = { width: size, height: size, color: "#1C1C1C", flexShrink: 0 };
      if (rating >= star) return <FaStar key={star} style={s} />;
      if (rating >= star - 0.5) return <FaStarHalfAlt key={star} style={s} />;
      return <FaRegStar key={star} style={s} />;
    })}
  </div>
);

export default function ProductLoadMore({ isOpen, onClose }) {
  const { t } = useTranslation("productreviews");
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("reviews");
  const allReviews = getReviews(t);

 useEffect(() => {
  if (isOpen) {
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.dataset.scrollY = scrollY;
  } else {
    const scrollY = parseInt(document.body.dataset.scrollY || '0');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    delete document.body.dataset.scrollY;
    window.scrollTo(0, scrollY);
  }
  return () => {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
  };
}, [isOpen]);

  const handleReviewSubmit = ({ rating, feedback }) => {
    console.log("Review submitted:", { rating, feedback });
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .plm-shell {
          flex-direction: row;
          width: min(960px, 96vw);
          max-height: 90vh;
          overflow: hidden;
        }
        .plm-right {
          display: flex;
          width: 310px;
        }
        .plm-left-heading {
          padding: 28px 32px 18px;
        }
        .plm-left-scroll {
          padding: 0 32px 28px;
        }
        .plm-mobile-tabs {
          display: none;
        }
        .plm-summary-mobile {
          display: none;
        }
        @media (max-width: 900px) {
          .plm-shell {
            flex-direction: column;
            width: calc(100vw - 32px);
            max-height: 92vh;
            overflow: hidden;
          }
          .plm-right {
            display: none !important;
          }
          .plm-mobile-tabs {
            display: flex;
            border-bottom: 1px solid #EBEBEB;
            padding: 0 20px;
            gap: 0;
            flex-shrink: 0;
            background: #fff;
          }
          .plm-tab-btn {
            flex: 1;
            padding: 14px 0;
            background: none;
            border: none;
            border-bottom: 2px solid transparent;
            font-size: 14px;
            font-weight: 600;
            color: #888;
            cursor: pointer;
            transition: color 0.15s, border-color 0.15s;
          }
          .plm-tab-btn.active {
            color: #1C1C1C;
            border-bottom: 2px solid #1C1C1C;
          }
          .plm-left-heading {
            padding: 20px 20px 14px;
          }
          .plm-left-scroll {
            padding: 0 20px 80px;
          }
          .plm-summary-mobile {
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            padding: 20px 20px 90px;
            flex: 1;
            gap: 16px;
          }
          .plm-add-review-floating {
            position: absolute !important;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 12px 20px !important;
            border-radius: 0 !important;
            border-top: 1px solid #EBEBEB !important;
            background: #fff !important;
            z-index: 5;
            display: flex !important;
          }
          .plm-add-review-sidebar {
            display: none !important;
          }
        }
        @media (max-width: 540px) {
          .plm-shell {
            width: 100%;
            max-height: 100dvh;
            border-radius: 16px 16px 0 0;
            margin-bottom: 0;
          }
          .plm-backdrop {
            align-items: flex-end !important;
            padding: 0 !important;
          }
          .plm-left-heading {
            padding: 18px 16px 12px;
          }
          .plm-left-scroll {
            padding: 0 16px 80px;
          }
          .plm-mobile-tabs {
            padding: 0 16px;
          }
          .plm-summary-mobile {
            padding: 16px 16px 90px;
          }
          .plm-add-review-floating {
            padding: 12px 16px !important;
          }
          .plm-review-meta {
            min-width: 80px !important;
          }
          .plm-review-name {
            font-size: 13px !important;
          }
          .plm-review-text {
            font-size: 13px !important;
          }
        }
      `}</style>

      <div
        className="plm-backdrop"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 60,
          background: "rgba(0,0,0,0.52)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          overscrollBehavior: "contain",
          touchAction: "none",
          pointerEvents: "auto",
        }}
      >
        <div
          className="plm-shell"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 20px 80px rgba(0,0,0,0.25)",
            display: "flex",
            position: "relative",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              flex: "1 1 0",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div className="plm-left-heading" style={{ flexShrink: 0 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#1C1C1C",
                }}
              >
                {t("ratingAndReviews")}
              </h2>
            </div>

            <div className="plm-mobile-tabs">
              <button
                className={`plm-tab-btn ${activeTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveTab("reviews")}
              >
                {t("userReviews")}
              </button>
              <button
                className={`plm-tab-btn ${activeTab === "summary" ? "active" : ""}`}
                onClick={() => setActiveTab("summary")}
              >
                {t("summary")}
              </button>
            </div>

            <div
              className="plm-left-scroll"
              style={{
                flex: "1 1 0",
                overflowY: "auto",
                display: activeTab === "reviews" ? "block" : "none",
              }}
            >
              {allReviews.map((review, idx) => (
                <div
                  key={review.id}
                  style={{
                    padding: "20px 0",
                    borderBottom:
                      idx < allReviews.length - 1
                        ? "1px solid #EBEBEB"
                        : "none",
                    display: "flex",
                    gap: 16,
                  }}
                >
                  <div
                    className="plm-review-meta"
                    style={{ minWidth: 105, flexShrink: 0 }}
                  >
                    <div
                      className="plm-review-name"
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#1C1C1C",
                        marginBottom: 3,
                      }}
                    >
                      {review.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>
                      {review.role}
                    </div>
                    <div style={{ fontSize: 12, color: "#888" }}>
                      {review.date}
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 7 }}>
                      <StarRow rating={review.rating} size={13} />
                    </div>
                    <p
                      className="plm-review-text"
                      style={{
                        margin: 0,
                        fontSize: 13.5,
                        color: "#1C1C1C",
                        lineHeight: 1.65,
                        textAlign: "justify",
                      }}
                    >
                      {review.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="plm-summary-mobile"
              style={{
                display: activeTab === "summary" ? "flex" : "none",
              }}
            >
              <div
                style={{
                  background: "#F0EEE9",
                  borderRadius: 12,
                  height: 220,
                  overflow: "hidden",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&q=80"
                  alt="Product"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div
                style={{
                  border: "1px solid #E8E8E8",
                  borderRadius: 14,
                  padding: "16px 18px 18px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      color: "#1C1C1C",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    4.8/5
                  </span>
                  <StarRow rating={4.8} size={17} />
                </div>
                <p style={{ fontSize: 14, color: "#888", margin: "0 0 14px" }}>
                  320 {t("verifiedReviews")}
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {ratingBreakdown.map(({ star, width }) => (
                    <div
                      key={star}
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: "#1C1C1C",
                          width: 10,
                          flexShrink: 0,
                          textAlign: "right",
                        }}
                      >
                        {star}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: 6,
                          background: "#EBEBEB",
                          borderRadius: 99,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width,
                            height: "100%",
                            background: "#1C1C1C",
                            borderRadius: 99,
                          }}
                        />
                      </div>
                      <button
                        style={{
                          fontSize: 12,
                          color: "#1C1C1C",
                          fontWeight: 500,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          textDecoration: "underline",
                          textUnderlineOffset: 3,
                          padding: 0,
                          flexShrink: 0,
                          width: 28,
                          textAlign: "right",
                        }}
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="plm-add-review-floating"
              onClick={() => setIsAddReviewOpen(true)}
              style={{
                display: "none",
                width: "100%",
                padding: "15px 0",
                background: "#1C1C1C",
                color: "#fff",
                border: "none",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                letterSpacing: "0.01em",
              }}
            >
              <FaPlus style={{ fontSize: 14 }} />
              {t("addReview")}
            </button>
          </div>

          <div
            className="plm-right"
            style={{
              width: 310,
              flexShrink: 0,
              flexDirection: "column",
              padding: "20px 20px 24px",
              gap: 16,
              marginTop: "40px",
              background: "#fff",
            }}
          >
            <div
              style={{
                border: "1px solid #E8E8E8",
                borderRadius: 14,
                overflow: "hidden",
                background: "#fff",
              }}
            >
              <div
                style={{
                  background: "#F0EEE9",
                  height: 260,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&q=80"
                  alt="Product"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ padding: "16px 18px 18px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      color: "#1C1C1C",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    4.8/5
                  </span>
                  <StarRow rating={4.8} size={17} />
                </div>
                <p style={{ fontSize: 14, color: "#888", margin: "0 0 14px" }}>
                  320 {t("verifiedReviews")}
                </p>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {ratingBreakdown.map(({ star, width }) => (
                    <div
                      key={star}
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: "#1C1C1C",
                          width: 10,
                          flexShrink: 0,
                          textAlign: "right",
                        }}
                      >
                        {star}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: 6,
                          background: "#EBEBEB",
                          borderRadius: 99,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width,
                            height: "100%",
                            background: "#1C1C1C",
                            borderRadius: 99,
                          }}
                        />
                      </div>
                      <button
                        style={{
                          fontSize: 12,
                          color: "#1C1C1C",
                          fontWeight: 500,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          textDecoration: "underline",
                          textUnderlineOffset: 3,
                          padding: 0,
                          flexShrink: 0,
                          width: 28,
                          textAlign: "right",
                        }}
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="plm-add-review-sidebar"
              onClick={() => setIsAddReviewOpen(true)}
              style={{
                width: "100%",
                padding: "15px 0",
                background: "#1C1C1C",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                letterSpacing: "0.01em",
                transition: "background 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#1C1C1C")
              }
            >
              <FaPlus style={{ fontSize: 14, lineHeight: 1 }} />
              {t("addReview")}
            </button>
          </div>

          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 18,
              right: 20,
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              color: "#1C1C1C",
              lineHeight: 1,
              zIndex: 10,
            }}
            aria-label="Close"
          >
            <RxCross2 />
          </button>
        </div>
      </div>

      <ProductModalAddReview
        isOpen={isAddReviewOpen}
        onClose={() => setIsAddReviewOpen(false)}
        onSubmit={handleReviewSubmit}
      />
    </>
  );
}
