"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaArrowRight } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { MdWaves } from "react-icons/md";

const ShimmerLoader = ({ className = "" }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

export default function ProductExpertAdvice({ apiProduct }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const imageLoaded = useRef(false);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isModalOpen]);

  const blogs = apiProduct?.blogs || [];
  const visibleBlogs = blogs.slice(0, 5);
  const remainingBlogs = blogs.slice(5);
  const firstBlogName = blogs[0]?.name || "Expert Advice";

  const isLoaded = apiProduct !== null;

  const handleImageLoad = () => {
    if (!imageLoaded.current) {
      imageLoaded.current = true;
      setImageLoading(false);
    }
  };

  return (
    <>
      <section className="w-full bg-[#EFEFEF] lg:mt-20">
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes shimmerMove {
              0%   { background-position: -600px 0; }
              100% { background-position:  600px 0; }
            }
            .shimmer-bg-expert {
              background: linear-gradient(90deg, #d4d4d4 25%, #e8e8e8 50%, #d4d4d4 75%);
              background-size: 600px 100%;
              animation: shimmerMove 1.4s infinite linear;
            }
            @keyframes spinExpert { to { transform: rotate(360deg); } }
            @keyframes expertFadeIn {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
            .expert-fade-in { animation: expertFadeIn 0.4s ease forwards; }
          `
        }} />

        <div className="flex flex-col lg:flex-row w-full">

          {/* LEFT: Dog Image */}
          <div
            className="hidden lg:flex w-full lg:w-1/2 relative group overflow-visible -mt-[40px] -mb-[40px] items-center justify-center"
            style={{ background: "#D7D7D7" }}
          >
            {/* State 1: Shimmer */}
            {!isLoaded && (
              <div className="shimmer-bg-expert absolute inset-0 w-full h-full" />
            )}

            {/* State 2: Black spinner */}
            {isLoaded && imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "4px solid rgba(0,0,0,0.12)",
                    borderTopColor: "#111111",
                    animation: "spinExpert 0.8s linear infinite",
                  }}
                />
              </div>
            )}

            {/* State 3: Image fade in */}
            {isLoaded && (
              <>
                <img
                  src="dog.svg"
                  alt="Expert Advice Dog"
                  onLoad={handleImageLoad}
                  onError={handleImageLoad}
                  className={`absolute inset-0 w-full h-full object-contain ${
                    imageLoading ? "opacity-0" : "expert-fade-in"
                  }`}
                />

                {/* Hover card — sirf image load hone ke baad dikhay */}
                {!imageLoading && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%]
                                  opacity-0 translate-y-4
                                  group-hover:opacity-100 group-hover:translate-y-0
                                  transition-all duration-300 ease-out
                                  bg-white rounded-md px-5 py-4 shadow-lg
                                  flex items-center justify-between gap-3 z-20">
                    <div className="flex items-center gap-3">
                      <MdWaves size={20} className="bg-gray-200 text-[#808080] p-1" />
                      <span className="text-[14px] text-[#1C1C1C] font-medium line-clamp-1">
                        {firstBlogName}
                      </span>
                    </div>
                    <span className="text-[#1C1C1C] text-sm"><FaArrowRight /></span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT: Expert Advice list */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-6 lg:py-14 bg-[#F3F3F3]">
            <h2 className="text-[22px] sm:text-[24px] lg:text-[28px] font-bold text-[#1C1C1C] mb-7">
              Expert Advice
            </h2>

            {!isLoaded ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div key={idx} className="border-t border-[#D8D8D8] py-3.5 px-2">
                    <ShimmerLoader className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex flex-col">
                  {visibleBlogs.map((blog) => (
                    <div
                      key={blog.id}
                      className="flex items-center justify-between py-3.5 border-t border-[#D8D8D8] last:border-b cursor-pointer group"
                    >
                      <span className="text-[14px] text-[#1C1C1C] line-clamp-1 pr-4 group-hover:text-gray-400 transition-colors pr-4">{blog.name}</span>
                      <img src="review.svg" alt="" />
                    </div>
                  ))}
                </div>
                {remainingBlogs.length > 0 && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-8 w-fit bg-[#1C1C1C] text-white text-[13px] font-medium px-6 py-2.5 rounded-md hover:bg-[#333] transition-colors cursor-pointer"
                  >
                    See more
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* MODAL */}
      {isLoaded && isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[560px] rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
              <h3 className="text-[20px] font-bold text-[#1C1C1C]">Expert Advice</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#888] cursor-pointer hover:text-[#1C1C1C]  transition-colors"
              >
                <IoClose size={25} />

              </button>
            </div>

            <div className="mx-4 mb-4 bg-[#FBF7EE] rounded-xl px-5 py-4 flex items-center justify-between shrink-0">
              <p className="text-[14px] text-[#1C1C1C] leading-snug max-w-[55%]">
                Get reliable <strong>expert advice</strong> to give your pet the best care every day.
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {["banner1.svg", "banner2.svg", "banner3.svg", "banner4.svg"].map((src, i) => (
                  <img key={i} src={`/${src}`} alt={`pet ${i + 1}`} className="w-14 h-14 rounded-full object-cover" />
                ))}
              </div>
            </div>

            <div className="px-4 pb-6 flex flex-col overflow-y-auto">
              {remainingBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="flex items-center justify-between py-3.5 border-t last:border-b border-[#E8E8E8] cursor-pointer px-2 group"
                >
                  <span className="text-[14px] text-[#1C1C1C] group-hover:text-gray-400 transition-colors pr-4">
                    {blog.name}
                  </span>
                  <img src="review.svg" alt="" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}