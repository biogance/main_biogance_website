import ExpertArticleDetail from "@/Components/Pages/ExpertAdvices/ExpertArticleDetail";

export default async function ExpertDetailPage({ searchParams }) {
  const params = await searchParams;
  return <ExpertArticleDetail seoKeyword={params?.seo} />;
}
