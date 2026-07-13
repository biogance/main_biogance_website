import ExpertArticleDetail from "@/Components/Pages/ExpertAdvices/ExpertAdvicesDetail";

export default function ExpertDetailPage({ params }) {
  return <ExpertArticleDetail slug={params.slug} />;
}
