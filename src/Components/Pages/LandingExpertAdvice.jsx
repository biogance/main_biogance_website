"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, ChevronLeft, ChevronRight } from "react-icons/md";
import { BiChevronLeft, BiChevronRight, BiHeart } from "react-icons/bi";

export default function LandingExpertAdvice() {
  const [articles, setArticles] = useState([
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1572296374832-8737db0d011b?q=80&w=800&auto=format&fit=crop",
      category: "For Dogs",
      date: "July 28, 2025",
      title: "How do I care for my dog's nose?",
      description: "Don't know how to care for your dog's nose? A dog's nose holds many mysteries. Both fragile and powerful, it is particularly essential in...",
      isFavorite: false,
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1760130291264-cf83815f0c05?q=80&w=800&auto=format&fit=crop",
      category: "For Cats",
      date: "July 28, 2025",
      tags: ["Behavior", "Tips & Tricks"],
      title: "What is pawing in cats?",
      description: "In fact, pawing is innate in cats. At birth, this action is essential to the kitten's survival. It stimulates the mother's milk supply...",
      isFavorite: false,
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1597603413826-cd1c06b05222?q=80&w=800&auto=format&fit=crop",
      category: "For Dogs",
      date: "May 30, 2024",
      tags: ["Education"],
      title: "How to groom your dog at home?",
      description: "Do you want a cute dog at all times? Have you never mustered up the courage to groom your dog? Often, we feel like our furball hates the...",
      isFavorite: false,
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1543466835-00a638f80e801?q=80&w=800&auto=format&fit=crop",
      category: "For Cats",
      date: "June 15, 2025",
      title: "Why does my cat sleep so much?",
      description: "Cats sleep 12–16 hours a day. It's completely normal! But sometimes excessive sleep can be a sign of boredom or health issues...",
      isFavorite: false,
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const toggleFavorite = (id) => {
    setArticles((prev) =>
      prev.map((art) =>
        art.id === id ? { ...art, isFavorite: !art.isFavorite } : art
      )
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  const getVisibleArticles = () => {
    const visible = [];
    for (let i = 0; i < articles.length; i++) {
      visible.push(articles[(currentIndex + i) % articles.length]);
    }
    return visible.slice(0, 3); // Show only 3 cards at a time
  };

  const visibleArticles = getVisibleArticles();

  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-10xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start justify-between mb-12 gap-8">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Our Expert Advice
            </h2>
            <p className="text-gray-600 text-base mb-4 max-w-2xl">
              Get tips and guidance from vets and pet care experts to keep your
              pet happy and healthy.
            </p>
            <a
              href="#"
              className="text-sm font-semibold text-black hover:underline inline-flex items-center gap-1"
            >
              Discover more tips from our specialists
              <span className="text-xl"><BiChevronRight className="w-5 h-5 text-gray-700 group-hover:text-black" /></span>
            </a>
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-4">
            <button
              onClick={prevSlide}
              className="w-11 h-11 border border-gray-300 rounded-4xl hover:bg-gray-50 transition-all flex items-center justify-center group shadow-sm"
            >
              <BiChevronLeft className="w-7 h-7 text-gray-700 group-hover:text-black" />
            </button> 
            <button
              onClick={nextSlide}
              className="w-11 h-11 border border-gray-300 rounded-4xl hover:bg-gray-50 transition-all flex items-center justify-center group shadow-sm"
            >
              <BiChevronRight className="w-7 h-7 text-gray-700 group-hover:text-black" />
            </button>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(article.id)}
                  className="absolute top-4 left-4 w-11 h-11 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg z-10"
                >
                  <BiHeart
                    className={`w-6 h-6 transition-all ${
                      article.isFavorite
                        ? "fill-red-500 text-red-500 scale-110"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  />
                </button>
              </div>

              {/* Content */}
              <div className="p-7">
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-4 font-medium">
                  <span className="text-black">{article.category}</span>
                  <span>•</span>
                  <span>{article.date}</span>
                  {article.tags && (
                    <>
                      <span>•</span>
                      <span className="text-gray-600">
                        {article.tags.join(" • ")}
                      </span>
                    </>
                  )}
                </div>

                <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2 group-hover:text-blue-600 transition">
                  {article.title}
                </h3>

                <p className="text-sm text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                  {article.description}
                </p>

                <button className="w-full bg-black text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
                  Continue Reading
                </button>
              </div>
            </article>
          ))}
        </div>

       
      </div>
    </section>
  );
}