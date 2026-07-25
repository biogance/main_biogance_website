import Reseller from "@/Components/Pages/ProSection/Reseller";
import { headers } from "next/headers";

async function getSiteOrigin() {
  const hdrs = await headers();
  const host = hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") || "https";
  return host ? `${protocol}://${host}` : "";
}

export async function generateMetadata() {
  const origin = await getSiteOrigin();
  const url = `${origin}/become-a-reseller`;
  const title = "Become a Reseller | Biogance Professional Network";
  const description =
    "Apply to become an official Biogance reseller or distributor. Join pet shops, grooming salons, pharmacies and concept stores offering natural, French-made pet care to their customers.";

  return {
    title,
    description,
    keywords: [
      "become a Biogance reseller",
      "pet care distributor application",
      "Biogance wholesale",
      "pet shop reseller program",
      "grooming salon supplier",
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
      images: [{ url: `${origin}/og-image.jpg`, width: 1200, height: 630, alt: "Become a Biogance Reseller" }],
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
  return <Reseller />;
}
