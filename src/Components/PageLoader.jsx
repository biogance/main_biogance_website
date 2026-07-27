"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { BASE_URL } from "./API/API";
import { getDeviceId } from "../utils/deviceId";

const VALID_ROUTES = [
  "/",
  "/who-are-we",
  "/our-laboratory",
  "/professional",
  "/advices",
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
  "/become-a-reseller",
  "/become-an-ambassador",
  "/professional",
  "/pro-section-preview",
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
  "/expert-advice",
  "/expert-detail",
];

export function callSplashApi() {
  const loginData = localStorage.getItem("LoginData");
  const parsedLogin = loginData ? JSON.parse(loginData) : null;
  const payload = parsedLogin?.data?.token ? {} : { device_id: getDeviceId() };
  const headers = parsedLogin?.data?.token ? { Authorization: `Bearer ${parsedLogin.data.token}` } : {};
  axios
    .post(`${BASE_URL}/web/splash`, payload, { headers })
    .then((res) => {
      if (res.data.status !== false) {
        localStorage.setItem("splashData", JSON.stringify(res.data.data));
        window.dispatchEvent(new Event("splashDataReady"));
      }
    })
    .catch(() => {});
}

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Call splash API on every click anywhere in the app
  useEffect(() => {
    document.addEventListener("click", callSplashApi);
    return () => document.removeEventListener("click", callSplashApi);
  }, []);

  useEffect(() => {
    const loginData = localStorage.getItem("LoginData");
    const parsedLogin = loginData ? JSON.parse(loginData) : null;

    if (!loginData) {
      const isValid = VALID_ROUTES.some(
        (r) => pathname === r || pathname.startsWith(r + "/"),
      );
      if (!isValid) {
        router.replace("/");
      }
    }

    callSplashApi();

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
