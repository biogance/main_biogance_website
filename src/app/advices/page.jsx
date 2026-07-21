import ExpertAdvices from "@/Components/Pages/ExpertAdvices/ExpertAdvices";
import { headers } from "next/headers";

async function getSiteOrigin() {
  const hdrs = await headers();
  const host = hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") || "https";
  return host ? `${protocol}://${host}` : "";
}

export async function generateMetadata() {
  const origin = await getSiteOrigin();
  const url = `${origin}/advices`;
  const title = "Expert Advice | Biogance";
  const description =
    "Get reliable expert advice to give your pet the best care every day — browse articles on nutrition, grooming, health, and more.";

  return {
    title,
    description,
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
      images: [{ url: `${origin}/og-image.jpg`, width: 1200, height: 630, alt: "Biogance Expert Advice" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og-image.jpg`],
    },
  };
}

export default function AdvicesPage() {
  return <ExpertAdvices />;
}
