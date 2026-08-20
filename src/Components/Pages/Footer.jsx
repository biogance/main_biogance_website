"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaInstagram } from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin, FiCheck, FiChevronDown } from "react-icons/fi";
import {
  SlSocialFacebook,
  SlSocialLinkedin,
  SlSocialYoutube,
} from "react-icons/sl";
import { PiTwitterLogo } from "react-icons/pi";
import { BsTiktok } from "react-icons/bs";
import ContactUs from "./Onboarding/ContactUs";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { BASE_URL } from "../API/API";

// Every footer link group (Dogs, Cats, Our Products Ranges, Our Laboratory,
// ...) is a heading + a <ul>. Below `lg` that used to just be a long wall of
// links stacked under every heading — collapsed to a tap-to-expand
// accordion there instead, so a small screen shows a scannable list of
// headings first. At `lg` and up it's forced back open (lg:grid-rows-[1fr]
// lg:opacity-100 override the collapsed state unconditionally) and the
// heading stops being a button (lg:pointer-events-none lg:cursor-default),
// so desktop is visually and behaviorally unchanged from before.
function FooterAccordionSection({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 lg:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 py-3.5 lg:py-0 text-left cursor-pointer lg:pointer-events-none lg:cursor-default"
      >
        <h3 className="font-semibold text-white text-md m-0 lg:mb-4">{title}</h3>
        <FiChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 lg:hidden ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out lg:grid-rows-[1fr] lg:opacity-100 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-3.5 lg:pb-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const { t, i18n } = useTranslation("footer");
  const isFrench = i18n.language === "fr";
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Google Play / App Store badges — neither app is published yet, so both
  // just surface that instead of linking out to a dead/placeholder store page.
  const handleAppComingSoon = () => {
    toast.success(t("mobileApp.comingSoon"));
  };

  // Newsletter subscribe — POST {BASE_URL}/app/subscribers { email }.
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterError, setNewsletterError] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("idle"); // idle | loading | success

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (newsletterStatus === "loading" || newsletterStatus === "success") return;

    const trimmed = newsletterEmail.trim();
    if (!trimmed) {
      setNewsletterError("Please enter the email first.");
      return;
    }
    if (!isValidEmail(trimmed)) {
      setNewsletterError("Please enter a valid email address.");
      return;
    }

    setNewsletterError("");
    setNewsletterStatus("loading");
    try {
      const res = await axios.post(`${BASE_URL}/app/subscribers`, { email: trimmed });
      if (res.data.status === false) {
        setNewsletterStatus("idle");
        toast.error(res.data.action || "Something went wrong. Please try again.");
      } else {
        setNewsletterStatus("success");
      }
    } catch {
      setNewsletterStatus("idle");
      toast.error("Something went wrong. Please try again.");
    }
  };

  // Both the ranges and the category/family links below need to hand a
  // filter selection to FilterProducts.jsx without it showing up in the URL
  // — sessionStorage carries it instead of a ?range_name=/?family_name=
  // query string, read by FilterProducts.jsx then cleared, so the address
  // bar just says /shop. router.push("/shop") only remounts FilterProducts
  // (and re-reads sessionStorage) when navigating there from a different
  // page — clicking a Footer link while already on /shop is a same-route
  // push that reuses the mounted component, so this also fires an event
  // FilterProducts.jsx listens for to pick up the fresh value directly.
  const goToShop = (deepLink) => {
    sessionStorage.setItem("shopDeepLink", JSON.stringify(deepLink));
    window.dispatchEvent(new Event("shopDeepLinkReady"));
    router.push("/shop");
  };

  // Home API's `ranges` (see MainVideo.jsx's /web/home call) replaces the
  // hardcoded productRanges.items translation. That API only ever runs on
  // the home page though — a session that never visits "/" (deep link
  // straight to /shop, a product page, a refresh on any other route, etc.)
  // left apiRanges null forever, so Footer silently fell back to the
  // static <a href="#"> placeholder list below, whose links go nowhere —
  // clicking one just appended "#" to the URL instead of navigating.
  // splashData's `ranges` (the same field, fetched by PageLoader.jsx's
  // callSplashApi() on literally every page load) covers that gap, so
  // merge it in too — same dedup-by-name merge FilterProducts.jsx's
  // allRanges already does for these two sources.
  const [apiRanges, setApiRanges] = useState(null);
  useEffect(() => {
    const readRanges = () => {
      try {
        const home = JSON.parse(localStorage.getItem("homePageData") || "null");
        const splash = JSON.parse(localStorage.getItem("splashData") || "null");
        const merged = new Map();
        [...(splash?.ranges || []), ...(home?.ranges || [])].forEach((r) => {
          if (r?.name && !merged.has(r.name)) merged.set(r.name, r);
        });
        if (merged.size > 0) setApiRanges([...merged.values()]);
      } catch {
        /* ignore */
      }
    };
    readRanges();
    window.addEventListener("homePageDataReady", readRanges);
    window.addEventListener("splashDataReady", readRanges);
    return () => {
      window.removeEventListener("homePageDataReady", readRanges);
      window.removeEventListener("splashDataReady", readRanges);
    };
  }, []);

  // Middle "Product Categories" columns — same splashData.categories tree
  // OurProducts.jsx's mega-menu uses (category -> sub_categories "universe"
  // -> sub_categories "family"), read the same way (localStorage +
  // 'splashDataReady'). Unlike OurProducts.jsx this doesn't show a
  // universe-by-universe breakdown — per category it just flattens every
  // universe's families into one plain list.
  const [apiCategories, setApiCategories] = useState(null);
  useEffect(() => {
    const readCategories = () => {
      try {
        const cached = JSON.parse(localStorage.getItem("splashData") || "null");
        if (cached?.categories) setApiCategories(cached.categories);
      } catch {
        /* ignore */
      }
    };
    readCategories();
    window.addEventListener("splashDataReady", readCategories);
    return () => window.removeEventListener("splashDataReady", readCategories);
  }, []);

  // Left-column blurb — splashData.footer (same localStorage cache every
  // other Footer.jsx block above reads, no separate API hit) replaces the
  // hardcoded company.description translation whenever the admin panel has
  // actually filled it in; it stays on the hardcoded copy when that field
  // comes back null/empty ("" in the /web/splash payload today).
  const [apiFooterDescription, setApiFooterDescription] = useState(null);
  useEffect(() => {
    const readFooterDescription = () => {
      try {
        const cached = JSON.parse(localStorage.getItem("splashData") || "null");
        setApiFooterDescription(cached?.footer || null);
      } catch {
        /* ignore */
      }
    };
    readFooterDescription();
    window.addEventListener("splashDataReady", readFooterDescription);
    return () => window.removeEventListener("splashDataReady", readFooterDescription);
  }, []);

  const getName = (item) => (isFrench && item?.french_name ? item.french_name : item?.name || "");
  const getFamilies = (category) =>
    (category.sub_categories || [])
      .filter((s) => s.type === "universe")
      .flatMap((universe) => (universe.sub_categories || []).filter((s) => s.type === "family"));

  // Get arrays from translation
  const dogsItems = t("categories.dogs.items", { returnObjects: true });
  const catsItems = t("categories.cats.items", { returnObjects: true });
  const horsesItems = t("categories.horses.items", { returnObjects: true });
  const smallMammalsItems = t("categories.smallMammals.items", {
    returnObjects: true,
  });
  const birdsPoultryItems = t("categories.birdsPoultry.items", {
    returnObjects: true,
  });
  const reptilesItems = t("categories.reptiles.items", { returnObjects: true });
  const productRangesItems = t("productRanges.items", { returnObjects: true });
  const laboratoryItems = t("laboratory.items", { returnObjects: true });
  const professionalItems = t("professional.items", { returnObjects: true });
  const ambassadorItems = t("ambassador.items", { returnObjects: true });
  const newsItems = t("news.items", { returnObjects: true });

  return (
    <footer className="bg-[#2a2a2a] text-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column - Logo & Contact */}
          <div className="lg:col-span-3 space-y-6 p-6 sm:p-8 lg:pr-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo2.svg" alt="Biogance Logo" />
            </div>

           
            {apiFooterDescription ? (
              <p
                className="text-sm text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: apiFooterDescription }}
              />
            ) : (
              <p className="text-sm text-gray-300 leading-relaxed">
                {t("company.description")}
              </p>
            )}

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <FiMapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-gray-300">{t("company.address")}</span>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="w-4 h-4 flex-shrink-0" />
                <span className="text-gray-300">{t("company.email")}</span>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="w-4 h-4 flex-shrink-0" />
                <span className="text-gray-300">{t("company.phone")}</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4 ">
              <p className="text-base font-medium">{t("social.title")}</p>

              {/* @bioganceofficiel */}
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  {t("social.biogance")}
                </p>
                <div className="flex gap-2">
                  <a
                    href="https://www.facebook.com/bioganceofficiel/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="w-8 h-8 bg-[#373737]  flex items-center justify-center hover:bg-[#5a5a5a] transition"
                  >
                    <SlSocialFacebook className="w-4 h-4  text-[#E3E3E3]" />
                  </a>
                  <a
                    href="https://www.instagram.com/bioganceofficiel/?hl=en"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="w-8 h-8 bg-[#373737]  flex items-center justify-center hover:bg-[#5a5a5a] transition"
                  >
                    <FaInstagram className="w-4 h-4  text-[#E3E3E3]" />
                  </a>
                  <a
                    href="https://www.youtube.com/channel/UCo-KLXCLV10LTMilyd-y7aQ"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                    className="w-8 h-8 bg-[#373737]  flex items-center justify-center hover:bg-[#5a5a5a] transition"
                  >
                    <SlSocialYoutube className="w-4 h-4  text-[#E3E3E3]" />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/biogance/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                    className="w-8 h-8 bg-[#373737]  flex items-center justify-center hover:bg-[#5a5a5a] transition"
                  >
                    <SlSocialLinkedin className="w-4 h-4  text-[#E3E3E3]" />
                  </a>
                  <a
                    href="https://x.com/BIOGANCE"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Twitter"
                    className="w-8 h-8 bg-[#373737]  flex items-center justify-center hover:bg-[#5a5a5a] transition"
                  >
                    <PiTwitterLogo className="w-4 h-4  text-[#E3E3E3]" />
                  </a>
                  <a
                    href="https://www.tiktok.com/@bioganceofficiel"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="TikTok"
                    className="w-8 h-8 bg-[#373737]  flex items-center justify-center hover:bg-[#5a5a5a] transition"
                  >
                    <BsTiktok
                      size={15}
                      className="p-[0.9]  border border gray-200   text-[#E3E3E3] "
                    />
                  </a>
                </div>
              </div>

              {/* @ekinatofficiel */}
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  {t("social.ekinat")}
                </p>
                <div className="flex gap-2">
                  <a
                    href="https://www.facebook.com/Ekinatofficiel"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="w-8 h-8 bg-[#373737]  flex items-center justify-center hover:bg-[#5a5a5a] transition"
                  >
                    <SlSocialFacebook className="w-4 h-4  text-[#E3E3E3]" />
                  </a>
                  <a
                    href="https://www.instagram.com/ekinatofficiel/?hl=fr"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="w-8 h-8 bg-[#373737]  flex items-center justify-center hover:bg-[#5a5a5a] transition"
                  >
                    <FaInstagram className="w-4 h-4  text-[#E3E3E3]" />
                  </a>
                  <a
                    href="https://www.tiktok.com/@ekinatofficiel?_t=8m2Ye0GqQDo&_r=1"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="TikTok"
                    className="w-8 h-8 bg-[#373737]  flex items-center justify-center hover:bg-[#5a5a5a] transition"
                  >
                    <BsTiktok
                      size={15}
                      className="p-[0.9]  text-[#E3E3E3] border border gray-200"
                    />
                  </a>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="pt-4">
              <p className="text-white font-medium mb-3 text-sm sm:text-base">
                {t("newsletter.title")}
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs sm:text-sm text-white block mb-2">
                    {t("newsletter.emailLabel")}
                  </label>
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2" noValidate>
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => {
                        setNewsletterEmail(e.target.value);
                        if (newsletterError) setNewsletterError("");
                      }}
                      disabled={newsletterStatus === "loading" || newsletterStatus === "success"}
                      placeholder={t("newsletter.emailPlaceholder")}
                      className={`flex-1 min-w-0 bg-[#393939] border ${
                        newsletterError ? "border-red-500" : "border-[#393939]"
                      } text-white px-3 sm:px-4 py-2.5 text-xs sm:text-sm placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 disabled:opacity-70`}
                    />
                    <button
                      type="submit"
                      disabled={newsletterStatus === "loading" || newsletterStatus === "success"}
                      className="px-4 sm:px-6 py-2.5 border border-white cursor-pointer text-white text-xs sm:text-sm font-normal hover:bg-black transition whitespace-nowrap inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-80"
                    >
                      {newsletterStatus === "loading" ? (
                        "Subscribing..."
                      ) : newsletterStatus === "success" ? (
                        <>
                          You&apos;re in <FiCheck className="w-4 h-4 text-white" />
                        </>
                      ) : (
                        t("newsletter.subscribeButton")
                      )}
                    </button>
                  </form>
                  {newsletterError && (
                    <p className="text-red-500 text-xs mt-2">{newsletterError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* App Download — neither store listing exists yet, so these are
                buttons that toast "coming soon" rather than links to #.
                Sized down (w-[120px]) below sm — at 320-360px viewports two
                140px badges side by side ran past the column's content
                width (p-6's 24px padding still leaves less room than the
                pair needs) and pushed the row into horizontal overflow. */}
           <div className="flex flex-row flex-wrap items-start gap-2 sm:gap-0">
  <button
    type="button"
    onClick={handleAppComingSoon}
    aria-label={t("mobileApp.googlePlay")}
    className="block cursor-pointer"
  >
    <img
      src="/FPlay.png"
      alt="Google Play"
      className="block w-[120px] h-[69px] sm:w-[140px] sm:h-[81px] object-fill -mt-1"
    />
  </button>

  <button
    type="button"
    onClick={handleAppComingSoon}
    aria-label={t("mobileApp.appStore")}
    className="block cursor-pointer"
  >
    <img
      src="/FApple.png"
      alt="App Store"
      className="block w-[120px] h-[73px] sm:w-[140px] sm:h-[85px] object-fill"
    />
  </button>
</div>
          </div>

          {/* Middle Section - Product Categories — px-6 sm:px-8 matches the
              Left/Right columns' p-6 sm:p-8 horizontal padding exactly at
              every breakpoint, so on small screens (where all three columns
              stack full-width) this column's content lines up with theirs
              instead of sitting off by a few px. pb-12 (desktop only, see
              lg:pb-12) mirrors the mt-8 + pt-4 (= 48px) gap the content
              gets above it there, so the category lists get the same
              breathing room below them instead of sitting flush against
              the column's bottom edge; below lg the accordion rows already
              carry their own bottom padding so this column just needs a
              little (pb-2). */}
          <div className="lg:col-span-6 bg-[#1c1c1c] px-6 sm:px-8 pb-2 lg:pb-12">
            {apiCategories && apiCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 lg:gap-8 mt-2 lg:mt-8 pt-2 lg:pt-4">
                {apiCategories.map((category) => (
                  <FooterAccordionSection key={category.id} title={getName(category)}>
                    <ul className="space-y-2.5 text-sm text-gray-300">
                      {getFamilies(category).map((fam) => (
                        <li
                          key={fam.id}
                          className="hover:translate-x-2 cursor-pointer transition-all duration-300"
                        >
                          {/* Same category_id + family_name selection
                              OurProducts.jsx's goToFamily() sends (as a query
                              string there), just carried via shopDeepLink
                              instead so the URL stays a plain /shop. fam.name
                              (canonical, not the localized getName()) is what
                              FilterProducts.jsx's familyOptions actually
                              matches against, regardless of site language. */}
                          <button
                            type="button"
                            onClick={() => goToShop({ type: "family", category_id: category.id, family_name: fam.name })}
                            className="hover:text-white transition cursor-pointer text-left"
                          >
                            {getName(fam)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </FooterAccordionSection>
                ))}
              </div>
            ) : (
              // Falls back to the static translation lists until
              // splashData's categories have loaded.
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 lg:gap-8 mt-2 lg:mt-8 pt-2 lg:pt-4">
                  {/* Dogs & Puppies */}
                  <FooterAccordionSection title={t("categories.dogs.title")}>
                    <ul className="space-y-2.5 text-sm text-gray-300">
                      {dogsItems.map((item, index) => (
                        <li
                          key={index}
                          className="hover:translate-x-2 cursor-pointer transition-all duration-300"
                        >
                          <a href="#" className="hover:text-white transition">
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </FooterAccordionSection>

                  {/* Cats & Kittens */}
                  <FooterAccordionSection title={t("categories.cats.title")}>
                    <ul className="space-y-2.5 text-sm text-gray-300">
                      {catsItems.map((item, index) => (
                        <li
                          key={index}
                          className="hover:translate-x-2 cursor-pointer transition-all duration-300"
                        >
                          <a href="#" className="hover:text-white transition">
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </FooterAccordionSection>

                  {/* Horses */}
                  <FooterAccordionSection title={t("categories.horses.title")}>
                    <ul className="space-y-2.5 text-sm text-gray-300">
                      {horsesItems.map((item, index) => (
                        <li
                          key={index}
                          className="hover:translate-x-2 cursor-pointer transition-all duration-300"
                        >
                          <a href="#" className="hover:text-white transition">
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </FooterAccordionSection>

                  {/* Empty column for spacing — desktop only, the accordion
                      rows above stack full-width below lg so this would
                      otherwise leave a dangling empty block there. */}
                  <div className="hidden lg:block"></div>
                </div>

                {/* Bottom row - Small Mammals, Birds & Poultry, Reptiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 lg:gap-8 lg:mt-4 lg:pt-2">
                  {/* Small Mammals */}
                  <FooterAccordionSection title={t("categories.smallMammals.title")}>
                    <ul className="space-y-2.5 text-sm text-gray-300">
                      {smallMammalsItems.map((item, index) => (
                        <li
                          key={index}
                          className="hover:translate-x-2 cursor-pointer transition-all duration-300"
                        >
                          <a href="#" className="hover:text-white transition">
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </FooterAccordionSection>

                  {/* Birds & Poultry */}
                  <FooterAccordionSection title={t("categories.birdsPoultry.title")}>
                    <ul className="space-y-2.5 text-sm text-gray-300">
                      {birdsPoultryItems.map((item, index) => (
                        <li
                          key={index}
                          className="hover:translate-x-2 cursor-pointer transition-all duration-300"
                        >
                          <a href="#" className="hover:text-white transition">
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </FooterAccordionSection>

                  {/* Reptiles */}
                  <FooterAccordionSection title={t("categories.reptiles.title")}>
                    <ul className="space-y-2.5 text-sm text-gray-300">
                      {reptilesItems.map((item, index) => (
                        <li
                          key={index}
                          className="hover:translate-x-2 cursor-pointer transition-all duration-300"
                        >
                          <a href="#" className="hover:text-white transition">
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </FooterAccordionSection>
                </div>
              </>
            )}
          </div>

          {/* Right Column — lg:space-y-6 only (no gap below lg): each
              FooterAccordionSection already carries its own border-bottom
              divider + vertical padding as the mobile row separator, so an
              extra 24px gap between them there would just double up on top
              of that. At lg the accordion look/border/padding are switched
              off, so space-y-6 goes back to being the section spacing. */}
          <div className="lg:col-span-3 lg:space-y-6 p-6 sm:p-8 lg:pl-6">
            {/* Our Products Ranges */}
            <FooterAccordionSection title={t("productRanges.title")}>
              <ul className="space-y-2.5 text-sm text-gray-300">
                {apiRanges && apiRanges.length > 0
                  ? apiRanges.map((range) => (
                      <li
                        key={range.id}
                        className="hover:translate-x-2 cursor-pointer transition-all duration-300"
                      >
                        {/* range.name (not the localized french_name) is what
                            FilterProducts.jsx's Range filter actually matches
                            against — see its shopDeepLink handling. */}
                        <button
                          type="button"
                          onClick={() => goToShop({ type: "range", range_name: range.name })}
                          className="hover:text-white transition cursor-pointer text-left"
                        >
                          {isFrench && range.french_name ? range.french_name : range.name}
                        </button>
                      </li>
                    ))
                  : // Falls back to the static translation list until the home
                    // API's ranges have loaded (e.g. a first visit that
                    // didn't land on the home page yet), so this section is
                    // never empty.
                    productRangesItems.map((item, index) => (
                      <li
                        key={index}
                        className="hover:translate-x-2 cursor-pointer transition-all duration-300"
                      >
                        <a href="#" className="hover:text-white transition">
                          {item}
                        </a>
                      </li>
                    ))}
              </ul>
            </FooterAccordionSection>

            {/* Our Laboratory */}
            <FooterAccordionSection title={t("laboratory.title")}>
              <ul className="space-y-2.5 text-sm text-gray-300">
                <li className="hover:translate-x-2 cursor-pointer transition-all duration-300">
                  <Link
                    href="/our-laboratory"
                    className="hover:text-white transition"
                  >
                    {laboratoryItems[0]}
                  </Link>
                </li>
                <li className="hover:translate-x-2 cursor-pointer transition-all duration-300">
                  <Link
                    href="/our-laboratory#commitments"
                    className="hover:text-white transition"
                  >
                    {laboratoryItems[1]}
                  </Link>
                </li>
                <li className="hover:translate-x-2 cursor-pointer transition-all duration-300">
                  <Link
                    href="/our-laboratory#proofs"
                    className="hover:text-white transition"
                  >
                    {laboratoryItems[2]}
                  </Link>
                </li>
                <li className="hover:translate-x-2 cursor-pointer transition-all duration-300">
                  <Link href="/advices" className="hover:text-white transition">
                    {laboratoryItems[3]}
                  </Link>
                </li>
                <li className="hover:translate-x-2 cursor-pointer transition-all duration-300">
                  <Link
                    href="/ingredients"
                    className="hover:text-white transition"
                  >
                    {laboratoryItems[4]}
                  </Link>
                </li>
                <li className="hover:translate-x-2 cursor-pointer transition-all duration-300">
                  <Link
                    href="/breed-guide"
                    className="hover:text-white transition"
                  >
                    {laboratoryItems[5]}
                  </Link>
                </li>
                <li className="hover:translate-x-2 cursor-pointer transition-all duration-300">
                  <Link href="loyalty" className="hover:text-white transition">
                    {laboratoryItems[6]}
                  </Link>
                </li>
                <li className="hover:translate-x-2 cursor-pointer transition-all duration-300">
                  <button
                    onClick={() => setShowModal(true)}
                    className="hover:text-white transition text-left cursor-pointer"
                  >
                    {laboratoryItems[7]}
                  </button>
                </li>
              </ul>
            </FooterAccordionSection>

            {/* Professional — items[0] Resellers & Distributors, items[1]
                Become Partner/Ambassadors (see footer.json) */}
            <FooterAccordionSection title={t("professional.title")}>
              <ul className="space-y-2.5 text-sm text-gray-300">
                <li className="hover:translate-x-2 cursor-pointer transition-all duration-300">
                  <Link
                    href="/become-a-reseller"
                    className="hover:text-white transition"
                  >
                    {professionalItems[0]}
                  </Link>
                </li>
                <li className="hover:translate-x-2 cursor-pointer transition-all duration-300">
                  <Link
                    href="/become-an-ambassador"
                    className="hover:text-white transition"
                  >
                    {professionalItems[1]}
                  </Link>
                </li>
              </ul>
            </FooterAccordionSection>

            {/* News */}
            <FooterAccordionSection title={t("news.title")}>
              <ul className="space-y-2.5 text-sm text-gray-300 ">
                {newsItems.map((item, index) => (
                  <li
                    key={index}
                    className="hover:translate-x-2 cursor-pointer transition-all duration-300"
                  >
                    <Link href="/advices" className="hover:text-white transition ">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterAccordionSection>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-5">
          {/* text-xs sm:text-sm replaces the old "text-xs  text-[14px]" —
              two conflicting size utilities on the same element (both
              single-class specificity, so whichever Tailwind happened to
              emit later in the generated stylesheet silently won). */}
          <div className="flex flex-col md:flex-row justify-between items-center  gap-4 text-xs sm:text-sm text-black">
            <p>{t("bottom.copyright", { year: new Date().getFullYear() })}</p>
            <div className="flex flex-wrap gap-3 sm:gap-5 justify-center ">
              <a href="#" className="hover:text-gray-900 transition">
                {t("bottom.conception")}
              </a>
              <a href="#" className="hover:text-gray-900 transition">
                {t("bottom.agency")}
              </a>
              <Link href="/faq" className="hover:text-gray-900 transition">
                {t("bottom.faqs")}
              </Link>
              <Link
                href="/termsCondition?section=disclaimer"
                className="hover:text-gray-900 transition cursor-pointer"
              >
                {t("bottom.disclaimer")}
              </Link>
              <Link
                href="/termsCondition?section=shipping"
                className="hover:text-gray-900 transition cursor-pointer"
              >
                {t("bottom.shipping")}
              </Link>
              <Link
                href="/termsCondition?section=privacy"
                className="hover:text-gray-900 transition cursor-pointer"
              >
                {t("bottom.privacy")}
              </Link>
              <Link
                href="/termsCondition?section=terms"
                className="hover:text-gray-900 transition cursor-pointer"
              >
                {t("bottom.terms")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Us Modal — ContactUs.jsx now owns its own backdrop + open/
          close animation (same as Login.jsx), so it needs to stay mounted
          through the close animation instead of being conditionally
          rendered here. */}
      <ContactUs isOpen={showModal} onClose={() => setShowModal(false)} />
    </footer>
  );
}
