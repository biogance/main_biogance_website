"use client";
import React, { useState } from "react";
import { HiPlus, HiMinus } from "react-icons/hi";

const accordionData = [
  {
    title: "Type of coat",
    content:
      "This product is suitable for all coat types including short, medium, and long hair. It works effectively on straight, wavy, and curly coats, providing optimal nourishment and protection for every texture.",
  },
  {
    title: "Why Choose this Product?",
    content:
      "Rice protein strengthens the hair fiber and improve resistance. Provide shine, softness and protective coating effect. Formulated with 98% natural & organic ingredients, it delivers superior performance without harsh chemicals.",
  },
  {
    title: "Ingredients",
    content:
      "Aqua, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Hydrolyzed Rice Protein, Panthenol (Pro-Vitamin B5), Simmondsia Chinensis (Jojoba) Seed Oil, Aloe Barbadensis Leaf Juice, Citric Acid, Sodium Benzoate.",
  },
  {
    title: "Our Singularity",
    content:
      "Made exclusively in France, our formula combines cutting-edge biotechnology with the finest natural ingredients. Every batch is crafted with precision to ensure consistent quality and outstanding results for your pet.",
  },
  {
    title: "Our Commitments",
    content:
      "We are committed to cruelty-free testing, sustainable sourcing, and eco-friendly packaging. Our products are free from parabens, phthalates, SLS, and artificial colorants — because your pet deserves nothing but the best.",
  },
  {
    title: "Directions of Use",
    content:
      "Wet coat thoroughly with warm water. Apply a generous amount of shampoo and lather gently. Massage into coat and skin for 2–3 minutes. Rinse thoroughly and repeat if necessary. Follow with conditioner for best results.",
  },
  {
    title: "Composition",
    content:
      "98% ingredients of natural and organic origin. Certified by Ecocert Greenlife according to the Cosmos standard. The remaining 2% consists of preservation agents required to maintain product safety and shelf life.",
  },
  {
    title: "Safety",
    content:
      "For external use only. Avoid contact with eyes. If contact occurs, rinse immediately with clean water. Keep out of reach of children. Store in a cool, dry place away from direct sunlight. Discontinue use if irritation occurs.",
  },
];

export default function AboutProduct() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="w-full bg-white">
      <div className="flex flex-col lg:flex-row w-full min-h-[600px]">

        {/* LEFT: Accordion — full width on small/medium, 50% on large */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-6 lg:py-14">
          <h2 className="text-[22px] sm:text-[24px] lg:text-[26px] font-bold text-[#1C1C1C] mb-8">
            About This Product
          </h2>

          <div className="flex flex-col">
            {accordionData.map((item, idx) => (
              <div
                key={idx}
                className="border-t border-[#E0E0E0] last:border-b"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between py-4 text-left cursor-pointer group"
                >
                  <span className="text-[15px] font-medium text-[#1C1C1C] transition-colors duration-200">
                    {item.title}
                  </span>
                  <span className="shrink-0 ml-4 text-[#1C1C1C]">
                    {openIndex === idx ? (
                      <HiMinus className="w-4 h-4" />
                    ) : (
                      <HiPlus className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {/* Accordion Body */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === idx ? "max-h-96 pb-5" : "max-h-0"
                  }`}
                >
                  <p className="text-[14px] text-[#555555] leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Image — hidden on small/medium, visible on large */}
        <div className="hidden lg:block w-full lg:w-1/2 lg:sticky lg:top-0 lg:h-screen overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?w=900&q=80"
            alt="About this product"
            className="w-full h-full object-cover"
          />
        </div>

      </div>
    </section>
  );
}