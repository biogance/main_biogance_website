"use client";

import { useState, useRef } from "react";
import { BiChevronRight } from "react-icons/bi";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { FaHeart, FaRegHeart } from 'react-icons/fa';

export default function LandingExpertAdvice() {
  const scrollContainerRef = useRef(null);
  
  const [articles, setArticles] = useState([
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1572296374832-8737db0d011b?q=80&w=800&auto=format&fit=crop",
      category: "For Dogs",
      date: "July 28, 2025",
      title: "How do I care for my dog's nose?",
      description: "Don't know how to care for your dog's nose? A dog's nose holds many mysteries. Both fragile and powerful, it is particularly essential in maintaining your pet's health and wellbeing throughout their life.",
      isFavorite: false,
      isExpanded: false,
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1760130291264-cf83815f0c05?q=80&w=800&auto=format&fit=crop",
      category: "For Cats",
      date: "July 28, 2025",
      tags: ["Behavior"],
      title: "What is pawing in cats?",
      description: "In fact, pawing is innate in cats. At birth, this action is essential to the kitten's survival. It stimulates the mother's milk supply and helps create a strong bond between mother and kitten.",
      isFavorite: false,
      isExpanded: false,
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1597603413826-cd1c06b05222?q=80&w=800&auto=format&fit=crop",
      category: "For Dogs",
      date: "May 30, 2024",
      tags: ["Education"],
      title: "How to groom your dog at home?",
      description: "Do you want a cute dog at all times? Have you never mustered up the courage to groom your dog? Often, we feel like our furball hates the grooming process, but with the right techniques it can be enjoyable.",
      isFavorite: false,
      isExpanded: false,
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800&auto=format&fit=crop",
      category: "For Cats",
      date: "June 15, 2025",
      title: "Why does my cat sleep so much?",
      description: "Cats sleep 12–16 hours a day. It's completely normal! But sometimes excessive sleep can be a sign of boredom or health issues that need attention from a veterinarian for proper diagnosis.",
      isFavorite: false,
      isExpanded: false,
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800&auto=format&fit=crop",
      category: "For Dogs",
      date: "August 10, 2025",
      tags: ["Health"],
      title: "Signs your dog needs a vet visit",
      description: "Understanding when your dog needs medical attention can be challenging. Learn the key warning signs that indicate it's time to schedule a visit with your veterinarian for a thorough checkup.",
      isFavorite: false,
      isExpanded: false,
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop",
      category: "For Cats",
      date: "September 5, 2025",
      tags: ["Nutrition"],
      title: "Best diet for senior cats",
      description: "As cats age, their nutritional needs change significantly. Discover what foods are best for senior cats and how to maintain their health and vitality through proper nutrition and meal planning.",
      isFavorite: false,
      isExpanded: false,
    },
    {
      id: 7,
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800&auto=format&fit=crop",
      category: "For Dogs",
      date: "October 12, 2025",
      tags: ["Training"],
      title: "Puppy training basics",
      description: "Starting early with puppy training sets the foundation for a well-behaved dog. Learn essential commands, house training tips, and positive reinforcement techniques that work best for young puppies.",
      isFavorite: false,
      isExpanded: false,
    },
    {
      id: 8,
      image: "https://images.unsplash.com/photo-1478098711619-5ab0b478d6e6?q=80&w=800&auto=format&fit=crop",
      category: "For Cats",
      date: "November 20, 2025",
      title: "Understanding cat body language",
      description: "Cats communicate primarily through body language. From tail positions to ear movements, learn how to read your cat's signals and understand what they're trying to tell you every day.",
      isFavorite: false,
      isExpanded: false,
    },
  ]);

  const toggleFavorite = (id) => {
    setArticles((prev) =>
      prev.map((art) =>
        art.id === id ? { ...art, isFavorite: !art.isFavorite } : art
      )
    );
  };

  const toggleExpanded = (id) => {
    setArticles((prev) =>
      prev.map((art) =>
        art.id === id ? { ...art, isExpanded: !art.isExpanded } : art
      )
    );
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.article-card').offsetWidth;
      const gap = window.innerWidth < 768 ? 12 : 24;
      const scrollAmount = cardWidth + gap;
      
      scrollContainerRef.current.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="bg-white py-8 md:py-12 lg:py-16 px-4 md:px-6">
      <div className="max-w-10xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start justify-between mb-8 md:mb-12 gap-6 md:gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-gray-900">
              Our Expert Advice
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 max-w-2xl">
              Get tips and guidance from vets and pet care experts to keep your
              pet happy and healthy.
            </p>
            <a
              href="#"
              className="text-xs md:text-sm font-semibold text-black hover:underline inline-flex items-center gap-1"
            >
              Discover more tips from our specialists
              <span className="text-lg md:text-xl"><BiChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-700 group-hover:text-black" /></span>
            </a>
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => scroll('prev')}
              className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 cursor-pointer rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              aria-label="Previous articles"
            >
              <IoChevronBack className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            </button>
            <button
              onClick={() => scroll('next')}
              className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 cursor-pointer rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              aria-label="Next articles"
            >
              <IoChevronForward className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Articles Horizontal Scroll */}
        <div className="relative overflow-hidden">
          <style jsx>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto hide-scrollbar snap-x snap-mandatory"
          >
            <div className="flex gap-3 md:gap-6 pb-4">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="article-card bg-[#F7F7F7] rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer border border-gray-100 hover:shadow-lg transition-all duration-300 group flex-shrink-0 snap-start w-[85vw] sm:w-[calc(50%-6px)] lg:w-[calc(33.333%-16px)]"
                >
                  {/* Image */}
                  <div className="relative h-[180px] md:h-[240px] overflow-hidden bg-gray-100">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(article.id)}
                      className="absolute top-3 left-3 md:top-4 md:left-4 w-8 h-8 md:w-9 md:h-9 cursor-pointer bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      {article.isFavorite ? (
                        <FaHeart className="w-4 h-4 md:w-5 md:h-5 text-black" />
                      ) : (
                        <FaRegHeart className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
                      )}
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4 md:p-6 lg:p-7">
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-500 mb-3 md:mb-4 font-medium">
                      <span className="text-black border border-white rounded-full px-2.5 py-0.5 md:px-3 md:py-1 bg-white">{article.category}</span>
                      <span className="text-black border border-white rounded-full px-2.5 py-0.5 md:px-3 md:py-1 bg-white">{article.date}</span>
                      {article.tags && (
                        <span className="text-gray-600 border border-white rounded-full px-2.5 py-0.5 md:px-3 md:py-1 bg-white">
                          {article.tags.join(" • ")}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base md:text-lg lg:text-xl font-bold mb-2 md:mb-3 text-gray-900 line-clamp-2 transition">
                      {article.title}
                    </h3>

                    <p className={`text-xs md:text-sm text-gray-600 mb-4 md:mb-6 leading-relaxed transition-all duration-300 ${
                      article.isExpanded ? '' : 'line-clamp-3'
                    }`}>
                      {article.description}
                    </p>

                    <button 
                      onClick={() => toggleExpanded(article.id)}
                      className="bg-black cursor-pointer text-white px-3.5 py-2.5 md:px-4 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold hover:bg-gray-800 transition w-full sm:w-auto"
                    >
                      {article.isExpanded ? 'Show Less' : 'Continue Reading'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}