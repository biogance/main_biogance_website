import ExpertArticleDetail from "@/Components/Pages/ExpertAdvices/ExpertAdvicesDetail";

export default async function AdvicesDetailPage({ params }) {
  const { slug } = await params;
  return <ExpertArticleDetail seoKeyword={decodeURIComponent(slug)} />;
}
