import Ambasseder from "@/Components/Pages/ProSection/Ambasseder";
import { headers } from "next/headers";

async function getSiteOrigin() {
  const hdrs = await headers();
  const host = hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") || "https";
  return host ? `${protocol}://${host}` : "";
}

export async function generateMetadata() {
  const origin = await getSiteOrigin();
  const url = `${origin}/become-an-ambassador`;
  const title = "Become a Brand Ambassador | Biogance & Ekinat Partners";
  const description =
    "Apply to become a Biogance pet-care ambassador or an Ekinat horse-care partner. For creators, YouTubers, breeders, clubs, groomers, veterinarians and equestrian profiles ready to share their expertise.";

  return {
    title,
    description,
    keywords: [
      "become a Biogance ambassador",
      "pet brand ambassador program",
      "Ekinat partner application",
      "pet influencer partnership",
      "animal care content creator program",
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
      images: [{ url: `${origin}/og-image.jpg`, width: 1200, height: 630, alt: "Become a Biogance Ambassador" }],
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
  return <Ambasseder />;
}
