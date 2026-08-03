import Reseller from "@/Components/Pages/ProSection/Reseller";
import { headers } from "next/headers";
import resellerContent from "@/locales/en/reseller.json";

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
  // Every "Type of business" option from the reseller form's own field
  // (Reseller.jsx's accordion1.businessType select) — kept in sync with the
  // form since both read from the same reseller.json source of truth.
  // Used in both the description and the keywords list.
  const businessTypes = resellerContent.businessTypeOptions;
  // "Main sales channel" select options and the "Product interests"
  // checkbox labels — same reseller.json source, keywords only.
  const salesChannels = resellerContent.salesChannelOptions;
  const productInterests = Object.values(resellerContent.interests);
  const description =
    "Apply to become an official Biogance reseller or distributor. Join pet shops, grooming salons, pharmacies and concept stores offering natural, French-made pet care to their customers. " +
    `Open to every professional profile: ${businessTypes.join(", ")}.`;

  return {
    title,
    description,
    keywords: [
      "become a Biogance reseller",
      "pet care distributor application",
      "Biogance wholesale",
      "pet shop reseller program",
      "grooming salon supplier",
      ...businessTypes,
      ...salesChannels,
      ...productInterests,
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
      images: [{ url: `${origin}/opengraph-image`, width: 1200, height: 630, alt: "Become a Biogance Reseller" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/opengraph-image`],
    },
  };
}

export default function Page() {
  return <Reseller />;
}
