"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const VALID_ROUTES = [
  "/",
  "/who-are-we",
  "/navPro",
  "/products",
  "/shop",
  "/product",
  "/wishlist",
  "/contact",
  "/faq",
  "/ingredients",
  "/certifications",
  "/commitments",
  "/ambassador",
  "/reseller",
  "/distributor",
  "/loyalty",
  "/login",
  "/signup",
  "/forgot",
  "/otp",
  "/newpassword",
  "/confirmation",
  "/termsCondition",
  "/my-account",
  "/my-account/dashboard",
  "/checkout",
];

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loginData = localStorage.getItem("LoginData");

    if (!loginData) {
      const isValid = VALID_ROUTES.some(
        (r) => pathname === r || pathname.startsWith(r + "/"),
      );
      if (!isValid) {
        router.replace("/");
      }
    }

    const hideLoader = () => setVisible(false);

    if (pathname === "/") {
      window.addEventListener("biogance-home-ready", hideLoader, {
        once: true,
      });
      const fallbackTimer = setTimeout(hideLoader, 6000);
      return () => {
        window.removeEventListener("biogance-home-ready", hideLoader);
        clearTimeout(fallbackTimer);
      };
    }

    const timer = setTimeout(hideLoader, 1800);
    return () => clearTimeout(timer);
  }, [pathname, router]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src="/logo.svg"
        alt="Biogance"
        className="logo-pulse"
        style={{ height: "48px" }}
      />

      <style>{`
        .logo-pulse {
          animation: logoPulse 2s ease-in-out infinite;
        }
        @keyframes logoPulse {
          0%   { opacity: 1;   transform: scale(1); }
          50%  { opacity: 0.5; transform: scale(1); }
          100% { opacity: 1;   transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
