import ExpertArticleDetail from "@/Components/Pages/ExpertAdvices/ExpertArticleDetail";

export default async function AdvicesDetailPage({ params }) {
  const { slug } = await params;
  return <ExpertArticleDetail seoKeyword={decodeURIComponent(slug)} />;
}
