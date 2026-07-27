import ProSection from "@/Components/Pages/ProSection/ProSection";
import { headers } from "next/headers";

async function getSiteOrigin() {
  const hdrs = await headers();
  const host = hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") || "https";
  return host ? `${protocol}://${host}` : "";
}

export async function generateMetadata() {
  const origin = await getSiteOrigin();
  const url = `${origin}/professional`;
  const title = "Biogance Professional | Resellers & Ambassador Partnerships";
  const description =
    "Discover the Biogance professional network. Apply to become a reseller or distributor, or join as a brand ambassador or Ekinat equestrian partner.";

  return {
    title,
    description,
    keywords: [
      "Biogance professional",
      "Biogance reseller program",
      "Biogance ambassador program",
      "pet care B2B partnership",
      "Ekinat professional network",
    ],
    alternates: {
      canonical: url,
      languages: {
        en: url,
        fr: url,
        "x-default": url,
      },
    },
    openGraph: {
      siteName: "Biogance",
      title,
      description,
      url,
      type: "website",
      locale: "en_US",
      alternateLocale: "fr_FR",
      images: [{ url: `${origin}/og-image.jpg`, width: 1200, height: 630, alt: "Biogance Professional Network" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og-image.jpg`],
    },
  };
}

export default function Page() {
  return <ProSection />;
}
