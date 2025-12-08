import React from "react";
import { MdVerified } from "react-icons/md";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { FaCheck } from "react-icons/fa";

export default function Certifications() {
  return (
    <>
      <Navbar />
      <div className="bg-white py-8 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-10xl mx-auto">
          {/* Mobile Layout - Image First */}
          <div className="lg:hidden mb-8">
            <div className="relative">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <img
                  src="/C1.svg"
                  alt="Pet care professional"
                  className="w-full h-auto object-cover"
                />

                {/* Certification Badge Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <img src="cc2.svg" alt="" className="w-10 h-10" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm mb-2 leading-tight">
                        We're a Certified Pet Care Brand
                      </h3>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        ECOCERT and ISO 22716 certified for safe and
                        eco-responsible pet care.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-4 md:space-y-6">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  OUR CERTIFICATIONS
                </p>
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
                  Compliance with standards
                </h2>
              </div>

              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                At Biogance, compliance with standards is an inseparable
                priority of our quality and ethical approach.
              </p>

              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                Pioneers in the field of organic and natural care for animals,
                we were the first to offer a range certified "Ecosoin" by
                ECOCERT through our Organissime line.
              </p>

              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                This recognition guarantees natural, controlled and transparent
                formulas, complying with the strictest requirements of
                ecological cosmetics for animals.
              </p>

              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                At the same time, our production site is ISO 22716 certified, an
                international standard governing Good Manufacturing Practices
                (GMP). This certification confirms our commitment to producing
                safe and consistent quality across all our products. With
                Biogance, you have the guarantee of choosing certified, safe,
                and responsible animal care, developed in compliance with the
                most demanding standards.
              </p>
            </div>

            {/* Right Content - Image and Badge (Desktop Only) */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <img
                  src="/C1.svg"
                  alt="Pet care professional"
                  className="w-full h-auto object-cover"
                />

                {/* Certification Badge Overlay */}
                <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 bg-white rounded-2xl shadow-xl p-4 md:p-5 max-w-[calc(100%-2rem)] md:max-w-sm">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 -mt-2">
                      <img src="cc2.svg" alt="" className="w-10 h-10 md:w-14 md:h-14" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm md:text-base mb-2 md:mb-3 leading-tight">
                        We're a Certified Pet
                        <br />
                        Care Brand
                      </h3>
                      <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                        ECOCERT and ISO 22716 certified for safe and
                        eco-responsible pet care.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className=" px-6 py-20">
        <div className="max-w-10xl mx-auto ">
          <div className="bg-[#f7f7f7] p-8 md:p-12 rounded-2xl">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Logo */}
              <div className="flex-shrink-0">
                <img src="cc3.png" alt="ECOCERT Logo" className="w-full md:w-70 h-auto md:h-50" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">
                  Controlled by Ecocert
                </h2>

                <div className="space-y-4 text-gray-700 leading-relaxed mb-6">
                  <p>
                    Biogance is the first company to offer a range of animal
                    care products labeled "Ecosoin bio" by ECOCERT, through its
                    Organissime line.
                  </p>

                  <p>
                    Although this label is not mandatory in the sector, we have
                    made the deliberate and committed choice to apply it, in
                    order to offer our animals products subject to the same
                    demanding standards as human cosmetology.
                  </p>
                </div>

                {/* ECOCERT Standard Section */}
                <div className="mb-6">
                  <h3 className="mb-4 text-black font-medium">
                    The ECOCERT Standard Is Based On:
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src="tick.svg"
                        alt=""
                        className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-gray-700">
                        Use of ingredients from renewable resources
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <img
                        src="tick.svg"
                        alt=""
                        className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-gray-700">
                        Environmentally friendly processing methods
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <img
                        src="tick.svg"
                        alt=""
                        className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-gray-700">
                        Absence of GMOs, parabens, phenoxyethanol, or
                        controversial substances
                      </span>
                    </div>
                  </div>
                </div>

                {/* Organissime Range Section */}
                <div className="  mb-6">
                  <h3 className="mb-4 text-black font-medium">
                    Our Organissime Range Meets These Requirements:
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src="tick.svg"
                        alt=""
                        className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-gray-700">
                        98% of the plant ingredients used in our formulas come
                        from organic farming.
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <img
                        src="tick.svg"
                        alt=""
                        className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-gray-700">
                        Effective, safe, and ethical care, fully aligned with
                        our values
                      </span>
                    </div>
                  </div>
                </div>

                {/* Final Statement */}
                <p className="text-gray-700 leading-relaxed">
                  With this label, Biogance confirms its desire to go beyond
                  regulatory obligations, to offer eco-responsible, transparent,
                  and trustworthy care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-20 px-6">
        <div className="max-w-10xl mx-auto ">
          <div className="bg-[#f7f7f7] p-8 md:p-12 rounded-2xl">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Logo */}
              <div className="flex-shrink-0">
                <img src="cc4.svg" alt="ECOCERT Logo" className="w-full md:w-70 h-auto md:h-50" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">
                  Good Manufacturing Practices (GMP)
                </h2>

                <div className="space-y-4 text-gray-700 leading-relaxed mb-6">
                  <p>
                    Biogance is proud to be ISO 22716 certified, an
                    international standard that guarantees compliance with Good
                    Manufacturing Practices (GMP).{" "}
                  </p>

                  <p>
                    Compliance with GMP is an essential pillar of the European
                    Cosmetics Regulation, which imposes strict measures to
                    ensure the safety of cosmetic products and protect
                    consumers.{" "}
                  </p>
                </div>

                {/* ECOCERT Standard Section */}
                <div className="mb-6">
                  <h3 className="mb-4 text-black font-medium">
                    What This Certification Means:{" "}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src="tick.svg"
                        alt=""
                        className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-gray-700">
                        Commitment to high-quality products developed under
                        strict regulations
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <img
                        src="tick.svg"
                        alt=""
                        className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-gray-700">
                        First company to obtain ISO certification for animal
                        hygiene products
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <img
                        src="tick.svg"
                        alt=""
                        className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-gray-700">
                        Recognition of our expertise and quality-first approach
                      </span>
                    </div>
                  </div>
                </div>

                {/* Organissime Range Section */}
                <div className="  mb-6">
                  <h3 className="mb-2 text-black font-medium">
                    Why It Matters:
                  </h3>
                  <p className="text-black mb-2">
                    Thanks to this standard, we can guarantee that each Biogance
                    product meets strict criteria of:
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src="tick.svg"
                        alt=""
                        className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-gray-700">Safety</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <img
                        src="tick.svg"
                        alt=""
                        className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-gray-700">Efficacys</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <img
                        src="tick.svg"
                        alt=""
                        className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-gray-700">Traceability</span>
                    </div>
                  </div>
                </div>

                {/* Final Statement */}
                <p className="text-gray-700 leading-relaxed">
                  All while respecting the environment and industry
                  requirements.{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}