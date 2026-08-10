import Breed from "@/Components/Pages/Breed/Breed";

export async function generateMetadata() {
  const title = "Breed Guide | Biogance";
  const description =
    "Explore dog and cat breed profiles, temperament, grooming needs and care cues with the Biogance Breed Guide.";
  return { title, description };
}

export default function Page() {
  return <Breed />;
}
