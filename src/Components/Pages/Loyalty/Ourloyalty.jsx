"use client";

import dog from "../../../../public/loyaltybg.jpg";
import Image from "next/image";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { useTranslation } from "react-i18next";
import {
  FaBirthdayCake,
  FaEnvelopeOpenText,
  FaClipboardList,
  FaTrophy,
} from "react-icons/fa";

export default function Loyalty() {
  const { t } = useTranslation("ourloyalty");

  const steps = [
    {
      number: "01",
      title: t("step1Title"),
      description: t("step1Description"),
    },
    {
      number: "02",
      title: t("step2Title"),
      description: t("step2Description"),
    },
    {
      number: "03",
      title: t("step3Title"),
      description: t("step3Description"),
    },
  ];

  const bonusWays = [
    {
      icon: FaBirthdayCake,
      title: t("birthdayTitle"),
      description: t("birthdayDescription"),
    },
    {
      icon: FaEnvelopeOpenText,
      title: t("newsletterTitle"),
      description: t("newsletterDescription"),
    },
    {
      icon: FaClipboardList,
      title: t("satisfactionTitle"),
      description: t("satisfactionDescription"),
    },
    {
      icon: FaTrophy,
      title: t("competitionsTitle"),
      description: t("competitionsDescription"),
    },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 ">
        <Navbar bgWhite={true} />
      </div>

      {/* Hero Section — matches the reference image: eyebrow label, a two-line
                heading, description stacked naturally below it, and a soft left-side
                fade over the photo so the text stays readable. */}
      {/* h-[520px] on small screens, not the original 420px — needed to fit
          the extra top clearance below (pt-[110px] instead of py-8's 32px)
          without pushing the description out past the box's own
          overflow-hidden bottom edge. md/lg unchanged. */}
      <div className="relative h-[520px] sm:h-[520px] md:h-[460px] lg:h-[600px] w-[100%] mx-auto overflow-hidden ">
        <div className="absolute inset-0 ">
          <Image
            src={dog}
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Fade so the photo stays visible on the right while the text on the left stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white to-transparent md:from-white md:via-white/10 md:to-transparent" />

        {/* pt-[110px] on small screens instead of the plain py-8 (32px) this
            used everywhere — the fixed Navbar (40px announcement + 64px nav
            = 104px) sits over this box, and the eyebrow span's own -mt-10
            pulls it up another 40px on top of that, so 32px of clearance
            left the eyebrow/heading rendering underneath the navbar on the
            short mobile hero. md:pt-8/lg:pt-8 restore the original value
            unchanged (the taller md/lg heroes already had enough room via
            justify-center for this not to be an issue there). */}
        <div className="relative h-full flex flex-col justify-center text-black px-5 sm:px-6 md:px-8 lg:px-12 pt-[110px] sm:pt-[110px] md:pt-8 lg:pt-8 pb-8">
          <span className="text-xs tracking-[0.2em] text-black/50 mb-10 -mt-10">
            {t("eyebrow")}
          </span>
          <h1 className="font-normal text-black mb-6 tracking-[-0.01em] text-3xl sm:text-4xl md:text-5xl lg:text-[52px] leading-[1.15] max-w-full sm:max-w-[85%] md:max-w-[60%] lg:max-w-[560px]">
            {t("heroTitle")}
          </h1>

          <p className="text-black mt-15 text-[13px] sm:text-sm max-w-full sm:max-w-[65%] md:max-w-[42%] lg:max-w-[420px] leading-relaxed text-justify">
            {t("heroDescription")}
          </p>
        </div>
      </div>

      {/* Steps Section */}
      <div className="bg-[#fff] py-12 sm:py-16 md:py-20 px-5 sm:px-6 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto  grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 ">
          {steps.map((step, index) => (
            <div
              key={index}
              className=" group border border-stone-400  p-6 md:p-15 hover:bg-black transition-all duration-300 cursor-pointer"
            >
              <span className="block text-4xl md:text-5xl text-stone-300 mb-4 group-hover:text-white transition-colors duration-300">
                {step.number}
              </span>
              <h3 className=" text-lg md:text-3xl text-stone-900 mb-3 group-hover:text-white transition-colors duration-300">
                {step.title}
              </h3>
              <p className="text-stone-800 text-sm leading-relaxed group-hover:text-white transition-colors duration-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards Stats Section */}
      <div className="bg-[#1a1a1a] py-12 sm:py-16 md:py-20 px-5 sm:px-6 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <h2 className="font-serif text-white text-3xl md:text-4xl lg:text-7xl tracking-[-0.01em] leading-[1.05]">
            <div className="text-sm mb-5 text-white/60">In Summary</div>
            {t("rewardsSectionTitle")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 bg-white/5 gap-6 md:gap-0">
            <div className="border border-white/15 p-6 md:p-8">
              <p className="font-serif text-white text-4xl md:text-5xl mb-2">
                {t("stat1Value")}
              </p>
              <p className="text-white/60 text-sm leading-relaxed">
                {t("stat1Description")}
              </p>
            </div>
            <div className="border border-white/15 p-6 md:p-8">
              <p className="font-serif text-white text-4xl md:text-5xl mb-2">
                {t("stat2Value")}
              </p>
              <p className="text-white/60 text-sm leading-relaxed">
                {t("stat2Description")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Even More Ways to Collect Section — matches the reference design exactly:
                white background, small eyebrow label, large two-line heading with the
                description positioned to its right at the baseline, four bordered cards,
                then a separate light-gray terms strip below. */}
      <div className="bg-white py-14 sm:py-16 md:py-20 px-5 sm:px-6 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-stone-300 uppercase tracking-[0.15em] mb-6">
            {t("moreWaysEyebrow", "Bonus points")}
          </p>

          <div className="mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-stone-900">
              {t("moreWaysTitle")}
            </h2>

            <p className=" mt-5 text-stone-600 text-sm leading-relaxed max-w-sm">
              {t("moreWaysDescription")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 -mt-5">
            {bonusWays.map((way, index) => (
              <div
  key={index}
  className="group border border-stone-400 bg-white p-6 md:p-7 transition-all duration-300 cursor-pointer hover:bg-black"
>
                <div className="min-h-[3.5rem] md:min-h-[4rem] flex items-start mb-8">
                    <h3 className="text-lg md:text-xl font-medium text-stone-900 leading-snug transition-colors duration-300 group-hover:text-white">
      {way.title}
    </h3>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed text-justify transition-colors duration-300 group-hover:text-white">
    {way.description}
  </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#f3f3f3] py-7 sm:py-8 px-5 sm:px-6 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-start gap-2 md:gap-120">
          <p className="text-xs font-semibold tracking-[0.15em] text-stone-900 uppercase shrink-0">
            {t("termsLabel", "Terms")}
          </p>
          <p className="text-stone-700 text-sm leading-relaxed max-w-7xl">
            {t("exclusionNote")}
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}
