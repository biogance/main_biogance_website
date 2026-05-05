"use client";
import { Suspense } from "react";
import ProductDetail from "./ProductDetail";

export default function ProductDetailWrapper() {
  return (
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" /></div>}>
      <ProductDetail />
    </Suspense>
  );
}
