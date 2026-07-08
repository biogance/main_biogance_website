"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { LuPackage } from "react-icons/lu";

// TODO: hardcoded for now — wire up to the article/blog + product API once available.
const RITUAL_PRODUCTS = [
  {
    id: "p1",
    name: "Activ Hair shampoo",
    price: "€12",
    description: "Cleanses the coat without weighing it down",
  },
  {
    id: "p2",
    name: "Algo Activ spray",
    price: "€12",
    description: "Cleanses the coat without weighing it down",
  },
  {
    id: "p3",
    name: "Card Brush",
    price: "€12",
    description: "Cleanses the coat without weighing it down",
  },
];

const HABITS = [
  {
    number: "01",
    title: "Brush before bathing",
    description:
      "Brushing removes dead hair, helps prevent knots, and prepares the coat to receive cleansing care evenly.",
  },
  {
    number: "02",
    title: "Choose a gentle formula",
    description:
      "A shampoo adapted to the coat type cleanses without stripping. For sensitive skin, choose an extra-gentle formula.",
  },
  {
    number: "03",
    title: "Finish with protective care",
    description:
      "A conditioner or targeted care product helps with detangling, adds shine, and makes the routine more comfortable.",
  },
];

const MORE_ADVICES = [
  {
    id: "ma1",
    category: "Sensitive skin",
    title: "How to recognize skin discomfort?",
    image: "/distributorImg.jpg",
  },
  {
    id: "ma2",
    category: "Routine",
    title: "How often should you wash your dog?",
    image: "/wishlist-img.jpg",
  },
  {
    id: "ma3",
    category: "Education",
    title: "Why does he eat my shoes?",
    image: "/partnerImg.jpg",
  },
];

function ExpertArticleDetail() {
  const router = useRouter();
  const hasProducts = RITUAL_PRODUCTS.length > 0;

  return (
    <div className="bg-white text-gray-900 min-h-screen pt-[104px]">
      <Navbar bgWhite={true} />

      {/* Hero */}
      <section className="bg-[#fbf9f7]">
        <div className="flex flex-col lg:flex-row items-stretch">
          <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-10 lg:py-16">
            <p className="text-xs text-gray-400 mb-1">
              <Link href="/" className="hover:text-gray-600 transition-colors">
                Home
              </Link>{" "}
              /{" "}
              <Link
                href="/expert-advice"
                className="hover:text-gray-600 transition-colors"
              >
                Advice
              </Link>{" "}
              / Expert insight
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Expert insight &bull; Skin &amp; coat
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-gray-900 leading-tight mb-6">
              How to support shedding without irritating the skin?
            </h1>
            <p className="text-sm text-gray-700 leading-relaxed max-w-md mb-8">
              During shedding season, the right reflex is not to bathe more
              often, but to build a gentle routine: brush, cleanse with care,
              then protect the skin barrier.
            </p>
            <div className="flex items-center gap-5 sm:gap-8 text-xs text-gray-700 font-medium flex-wrap">
              <span>By Biogance Laboratory</span>
              <span>7 min read</span>
              <span>Updated July 3, 2026</span>
            </div>
          </div>

          <div className="relative w-full lg:w-1/2 h-[420px]">
            <img
              src="/cat.png"
              alt="How to support shedding without irritating the skin"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Article body + product recommendation */}
      <div className="px-6 sm:px-10 lg:px-16 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left: article content */}
          <div
            className={
              hasProducts
                ? "w-full lg:w-2/3 max-w-3xl mx-auto"
                : "w-full max-w-3xl mx-auto"
            }
          >
            <p className="text-sm text-gray-700 leading-relaxed mb-5">
              <span className="float-left text-6xl font-bold leading-[0.4] pr-2">
                S
              </span>
              hedding is a natural process. It allows dogs and cats to renew
              their coat, but it can also make the skin more sensitive and
              the coat look duller when the routine is not adapted.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-8">
              The goal of an expert routine is simple: remove dead hair
              without irritation, cleanse only when needed, then apply care
              that helps the coat regain softness and shine.
            </p>

            <hr className="border-gray-200 mb-8" />

            <blockquote className="text-lg sm:text-xl font-bold text-gray-900 leading-snug mb-8">
              &quot;A good shedding routine should respect the skin&apos;s
              natural balance before looking for visible results.&quot;
            </blockquote>

            <hr className="border-gray-200 mb-8" />

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              The right habits to adopt
            </h2>

            <div className="mb-10">
              {HABITS.map((habit) => (
                <div
                  key={habit.number}
                  className="flex gap-5 py-6 border-t border-gray-200 last:border-b"
                >
                  <span className="text-2xl font-bold text-gray-900 shrink-0">
                    {habit.number}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1.5">
                      {habit.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {habit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              When should you be concerned?
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Seasonal hair loss is normal. However, patches, redness,
              intense itching, or a sudden change in behavior should lead
              you to seek veterinary advice.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              The page can then naturally lead to a pet profile: breed, age,
              coat type, and lifestyle. The article becomes an editorial
              entry point toward personalized recommendations.
            </p>
          </div>

          {/* Right: recommended routine card */}
          {hasProducts && (
            <div className="w-full lg:w-1/3 max-w-xl mx-auto lg:mx-0">
              <div className="sticky top-[130px] border border-gray-200 p-6">
                <p className="text-xs text-gray-400 mb-2">
                  Recommended routine
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  The 3-product shedding ritual
                </h3>
                <hr className="border-gray-200 mb-4" />

                {RITUAL_PRODUCTS.map((product) => (
                  <div
                    key={product.id}
                    className="flex gap-4 py-4 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="w-20 h-23 bg-[#f3f3f3] border border-gray-100 shrink-0 flex items-center justify-center">
                      <LuPackage className="w-6 h-6 text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-bold text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm font-bold text-gray-900 shrink-0">
                          {product.price}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed mb-3">
                        {product.description}
                      </p>
                      <button
                        type="button"
                        className="w-full bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold py-2.5 transition-colors cursor-pointer"
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="w-full mt-4 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold py-3 transition-colors cursor-pointer"
                >
                  Add all
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* More expert advices */}
      <section className="bg-[#fbf9f7] py-12 md:py-16">
        <div className="px-6 sm:px-10 lg:px-16">
          <p className="text-xs text-gray-400 mb-1">
            <Link href="/" className="hover:text-gray-600 transition-colors">
              Home
            </Link>{" "}
            /{" "}
            <Link
              href="/expert-advice"
              className="hover:text-gray-600 transition-colors"
            >
              Advice
            </Link>{" "}
            / Expert insight
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
            More expert advices.
          </h2>
        </div>

        {/* Cards ke liye alag container (no horizontal padding) */}
        <div className="-mx-6 sm:-mx-10 lg:-mx-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-6 sm:px-10 lg:px-16">
            {MORE_ADVICES.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push("/expert-detail")}
                className="relative h-72 overflow-hidden cursor-pointer group"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
                  <p className="text-xs text-white/80 mb-1">
                    {item.category}
                  </p>
                  <p className="text-base font-bold text-white leading-snug">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ExpertArticleDetail;