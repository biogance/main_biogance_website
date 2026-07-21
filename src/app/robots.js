const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.website-dev.biogance.com";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/static/",
          "/checkout",
          "/confirmation",
          "/my-account",
          "/login",
          "/signup",
          "/otp",
          "/forgot",
          "/newpassword",
          "/track-order",
          "/wishlist",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
