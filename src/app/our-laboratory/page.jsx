import LabortorySection from "@/Components/Pages/LabortorySection/LabortorySection";

export const metadata = {
  title: "Our Laboratory | Biogance Independent French Pet Care",
  description:
    "Discover Biogance, an independent French family laboratory and pioneer in organic and natural hygiene and care for pets.",
  keywords: [
    "Biogance laboratory",
    "French pet care laboratory",
    "organic pet care laboratory",
    "Biogance natural care",
    "Beaucouzé laboratory",
    "Our Laboratory Biogance",
  ],
  alternates: {
    canonical: "/our-laboratory",
  },
  openGraph: {
    title: "Our Laboratory | Biogance Independent French Pet Care",
    description:
      "Discover Biogance, an independent French family laboratory and pioneer in organic and natural hygiene and care for pets.",
    url: "/our-laboratory",
    siteName: "Biogance",
    type: "website",
  },
};

export default function Page() {
  return <LabortorySection />;
}
