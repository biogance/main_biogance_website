import ExpertArticleDetail from "@/Components/Pages/ExpertAdvices/ExpertArticleDetail";

export default function ExpertDetailPage({ params }) {
  return <ExpertArticleDetail slug={params.slug} />;
}
