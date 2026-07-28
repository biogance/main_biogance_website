import Ambasseder from "@/Components/Pages/ProSection/Ambasseder";
import { headers } from "next/headers";
import ambassadorContent from "@/locales/en/ambassador.json";

async function getSiteOrigin() {
  const hdrs = await headers();
  const host = hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") || "https";
  return host ? `${protocol}://${host}` : "";
}

export async function generateMetadata() {
  const origin = await getSiteOrigin();
  const url = `${origin}/become-an-ambassador`;
  // Every "Partnership profile" option and every "My animal universe"
  // option from the ambassador form's own two fields (Ambasseder.jsx's
  // applicationPath fieldset) — kept in sync with the form since both read
  // from the same ambassador.json source of truth.
  const partnershipProfiles = Object.values(ambassadorContent.profileLabels);
  const animalUniverses = Object.values(ambassadorContent.animalLabels);
  const title =
    `Become a Brand Ambassador | Biogance & Ekinat Partners — ${partnershipProfiles.join(", ")} | ` +
    `My Animal Universe: ${animalUniverses.join(", ")}`;
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
      ...partnershipProfiles,
      ...animalUniverses,
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
