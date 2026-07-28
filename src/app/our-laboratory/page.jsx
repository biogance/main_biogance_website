import LabortorySection from "@/Components/Pages/LabortorySection/LabortorySection";
import { headers } from "next/headers";
import laboratoryContent from "@/locales/en/laboratory.json";

async function getSiteOrigin() {
  const hdrs = await headers();
  const host = hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") || "https";
  return host ? `${protocol}://${host}` : "";
}

export async function generateMetadata() {
  const origin = await getSiteOrigin();
  const url = `${origin}/our-laboratory`;
  const title = "Our Laboratory | Biogance Independent French Pet Care";
  const description =
    "Discover Biogance, an independent French family laboratory and pioneer in organic and natural hygiene and care for pets. GMP / ISO 22716 certified, animal-welfare-first, science-meets-nature formulas made in France.";

  // Value/pillar/commitment titles pulled straight from the page's own
  // content (laboratory.json — the same source LabortorySection.jsx reads
  // via useTranslation) so the keyword list stays in sync with what the
  // page actually says instead of drifting out of date.
  const valueTitles = [
    laboratoryContent.values.card1.title,
    laboratoryContent.values.card2.title,
    laboratoryContent.values.card3.title,
    laboratoryContent.values.card4.title,
  ];
  const pillarTitles = Object.values(laboratoryContent.pillars).map((p) => p.title);
  const commitmentLabels = Object.values(laboratoryContent.commitments.items).map((c) => c.label);
  const proofStats = [
    laboratoryContent.proofs.hero.stat,
    laboratoryContent.proofs.iso.stat,
    laboratoryContent.proofs.pioneer.stat,
    laboratoryContent.proofs.family.stat,
  ];

  return {
    title,
    description,
    keywords: [
      "Biogance laboratory",
      "French pet care laboratory",
      "organic pet care laboratory",
      "Biogance natural care",
      "Beaucouzé laboratory",
      "Our Laboratory Biogance",
      "independent French laboratory",
      "family business pet care",
      ...valueTitles,
      ...pillarTitles,
      ...commitmentLabels,
      ...proofStats,
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
      images: [{ url: `${origin}/og-image.jpg`, width: 1200, height: 630, alt: "Our Laboratory | Biogance" }],
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
  return <LabortorySection />;
}
