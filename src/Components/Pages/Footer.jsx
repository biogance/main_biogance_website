"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaInstagram, FaApple } from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin, FiCheck } from "react-icons/fi";
import {
  SlSocialFacebook,
  SlSocialLinkedin,
  SlSocialYoutube,
} from "react-icons/sl";
import {
  PiXLogo,
  PiDogFill,
  PiCatFill,
  PiHorseFill,
  PiRabbitFill,
  PiBirdFill,
  PiPawPrintFill,
  PiPackageFill,
  PiHandshakeFill,
  PiFlaskFill,
  PiNewspaperFill,
  PiAddressBookFill,
  PiShareNetworkFill,
} from "react-icons/pi";
import { GiTurtle } from "react-icons/gi";
import { BsTiktok } from "react-icons/bs";
import ContactUs from "./Onboarding/ContactUs";
import AppLaunchModal from "./AppLaunchModal";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { BASE_URL } from "../API/API";

export default function Footer() {
  const { t, i18n } = useTranslation("footer");
  const isFrench = i18n.language === "fr";
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Google Play / App Store badges — neither app is published yet, so both
  // open the launch countdown modal instead of linking out to a
  // dead/placeholder store page.
  const [showAppModal, setShowAppModal] = useState(false);
  const handleAppComingSoon = () => setShowAppModal(true);

  // Newsletter subscribe — POST {BASE_URL}/app/subscribers { email }.
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterError, setNewsletterError] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("idle"); // idle | loading | success

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (newsletterStatus === "loading" || newsletterStatus === "success")
      return;

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
      const res = await axios.post(`${BASE_URL}/app/subscribers`, {
        email: trimmed,
      });
      if (res.data.status === false) {
        setNewsletterStatus("idle");
        toast.error(
          res.data.action_message ||
            res.data.action ||
            "Something went wrong. Please try again.",
        );
      } else {
        setNewsletterStatus("success");
      }
    } catch {
      setNewsletterStatus("idle");
      toast.error("Something went wrong. Please try again.");
    }
  };

  const goToShop = (deepLink) => {
    sessionStorage.setItem("shopDeepLink", JSON.stringify(deepLink));
    window.dispatchEvent(new Event("shopDeepLinkReady"));
    router.push("/shop");
  };

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
    return () =>
      window.removeEventListener("splashDataReady", readFooterDescription);
  }, []);

  const getName = (item) =>
    isFrench && item?.french_name ? item.french_name : item?.name || "";
  const getFamilies = (category) =>
    (category.sub_categories || [])
      .filter((s) => s.type === "universe")
      .flatMap((universe) =>
        (universe.sub_categories || []).filter((s) => s.type === "family"),
      );

  // Splits the API categories into the two footer columns: dogs/cats (and
  // their young) under "Pet care by species", everything else under
  // "More animals".
  const isSpecies = (category) =>
    /dog|pupp|cat|kitten|chien|chiot|chat/i.test(category?.name || "");
  const speciesCategories = (apiCategories || []).filter(isSpecies);
  const otherCategories = (apiCategories || []).filter((c) => !isSpecies(c));

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
  const newsItems = t("news.items", { returnObjects: true });

  const bioganceSocials = [
    {
      href: "https://www.facebook.com/bioganceofficiel/",
      label: "Facebook",
      Icon: SlSocialFacebook,
    },
    {
      href: "https://www.instagram.com/bioganceofficiel/?hl=en",
      label: "Instagram",
      Icon: FaInstagram,
    },
    {
      href: "https://www.youtube.com/channel/UCo-KLXCLV10LTMilyd-y7aQ",
      label: "YouTube",
      Icon: SlSocialYoutube,
    },
    {
      href: "https://www.linkedin.com/company/biogance/",
      label: "LinkedIn",
      Icon: SlSocialLinkedin,
    },
    { href: "https://x.com/BIOGANCE", label: "X", Icon: PiXLogo },
    {
      href: "https://www.tiktok.com/@bioganceofficiel",
      label: "TikTok",
      Icon: BsTiktok,
    },
  ];
  const ekinatSocials = [
    {
      href: "https://www.facebook.com/Ekinatofficiel",
      label: "Facebook",
      Icon: SlSocialFacebook,
    },
    {
      href: "https://www.instagram.com/ekinatofficiel/?hl=fr",
      label: "Instagram",
      Icon: FaInstagram,
    },
    {
      href: "https://www.tiktok.com/@ekinatofficiel?_t=8m2Ye0GqQDo&_r=1",
      label: "TikTok",
      Icon: BsTiktok,
    },
  ];

  const staticSpecies = [
    { title: t("categories.dogs.title"), items: dogsItems },
    { title: t("categories.cats.title"), items: catsItems },
  ];
  const staticMoreAnimals = [
    { title: t("categories.smallMammals.title"), items: smallMammalsItems },
    { title: t("categories.birdsPoultry.title"), items: birdsPoultryItems },
    { title: t("categories.horses.title"), items: horsesItems },
    { title: t("categories.reptiles.title"), items: reptilesItems },
  ];

  const renderCategoryGroups = (categories) =>
    categories.map((category) => (
      <FooterGroup
        key={category.id}
        title={getName(category)}
        icon={speciesIcon(category.name)}
      >
        {getFamilies(category).map((fam) => (
          <FooterItem key={fam.id}>
            <button
              type="button"
              onClick={() =>
                goToShop({
                  type: "family",
                  category_id: category.id,
                  family_name: fam.name,
                })
              }
              className="text-left cursor-pointer"
            >
              {getName(fam)}
            </button>
          </FooterItem>
        ))}
      </FooterGroup>
    ));

  // Falls back to the static translation lists until splashData's
  // categories have loaded.
  const renderStaticGroups = (groups) =>
    groups.map((group) => (
      <FooterGroup
        key={group.title}
        title={group.title}
        icon={speciesIcon(group.title)}
      >
        {(Array.isArray(group.items) ? group.items : []).map((item, index) => (
          <FooterItem key={index}>
            <a href="#">{item}</a>
          </FooterItem>
        ))}
      </FooterGroup>
    ));

  const laboratoryLinks = [
    { href: "/our-laboratory", label: laboratoryItems[0] },
    { href: "/our-laboratory#commitments", label: laboratoryItems[1] },
    { href: "/our-laboratory#proofs", label: laboratoryItems[2] },
    { href: "/advices", label: laboratoryItems[3] },
    { href: "/ingredients", label: laboratoryItems[4] },
    { href: "/breed-guide", label: laboratoryItems[5] },
    { href: "/loyalty", label: laboratoryItems[6] },
  ];

  const hasApiCategories = apiCategories && apiCategories.length > 0;
  const bottomLinkClass = "hover:text-black transition-colors";

  return (
    <footer className="bg-[#1c1c1c] text-[#f3f3f3]">
      <div className="grid grid-cols-1 lg:grid-cols-[330px_1fr] xl:grid-cols-[370px_1fr]">
        {/* Brand, contact & socials */}
        <div className="bg-[#1c1c1c] text-[#f3f3f3] border-b lg:border-b-0 lg:border-r border-white/10 px-4 sm:px-6 lg:px-8 xl:px-12 py-10">
          <img src="/logo2.svg" alt="Biogance Logo" className="h-9 w-auto" />
          {apiFooterDescription ? (
            <p
              className="mt-4 text-[12.5px] text-[#e7e7e5]/65 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: apiFooterDescription }}
            />
          ) : (
            <p className="mt-4 text-[12.5px] text-[#e7e7e5]/65 leading-relaxed">
              {t("company.description")}
            </p>
          )}

          {/* Contact Info — address opens Google Maps, email opens a
              Gmail compose tab, phone opens the device's dialer. */}
          <h3 className="mt-6 flex items-center gap-2.5 text-[14.5px] font-semibold">
            <PiAddressBookFill className="w-[18px] h-[18px] flex-shrink-0" />
            {t("company.contactTitle")}
          </h3>
          <ul className="mt-3 space-y-2.5 text-[13px] text-[#e7e7e5]/80">
            <li className="flex items-start gap-2.5">
              <FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#e7e7e5]/50" />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t("company.address"))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                {t("company.address")}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <FiMail className="w-4 h-4 flex-shrink-0 text-[#e7e7e5]/50" />
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(t("company.email"))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                {t("company.email")}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <FiPhone className="w-4 h-4 flex-shrink-0 text-[#e7e7e5]/50" />
              <a
                href={`tel:${t("company.phone").replace(/\s+/g, "")}`}
                className="hover:text-white transition-colors"
              >
                {t("company.phone")}
              </a>
            </li>
          </ul>

          {/* Social Media */}
          <h3 className="mt-6 flex items-center gap-2.5 text-[14.5px] font-semibold">
            <PiShareNetworkFill className="w-[18px] h-[18px] flex-shrink-0" />
            {t("social.title")}
          </h3>
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3 lg:block lg:space-y-3">
            <div>
              <p className="text-[12px] text-[#e7e7e5]/50">
                {t("social.biogance")}
              </p>
              <SocialRow links={bioganceSocials} />
            </div>
            <div>
              <p className="text-[12px] text-[#e7e7e5]/50">
                {t("social.ekinat")}
              </p>
              <SocialRow links={ekinatSocials} />
            </div>
          </div>
        </div>

        {/* Link groups — CSS columns balance the groups across the width
            so no column is left with a tall empty gap. */}
        <div className="bg-[#111] px-4 sm:px-6 lg:px-8 xl:px-12 pt-10 pb-3 columns-2 md:columns-3 xl:columns-4 2xl:columns-5 gap-x-6 lg:gap-x-10">
          {/* Pet care by species */}
          {withEyebrow(
            hasApiCategories
              ? renderCategoryGroups(speciesCategories)
              : renderStaticGroups(staticSpecies),
            t("sections.petCare"),
          )}

          {/* More animals */}
          {withEyebrow(
            hasApiCategories
              ? renderCategoryGroups(otherCategories)
              : renderStaticGroups(staticMoreAnimals),
            t("sections.moreAnimals"),
          )}

          {/* Explore ranges */}
          <FooterGroup
            eyebrow={t("sections.exploreRanges")}
            title={t("productRanges.title")}
            icon={PiPackageFill}
          >
            {apiRanges && apiRanges.length > 0
              ? apiRanges.map((range) => (
                  <FooterItem key={range.id}>
                    {/* range.name (not the localized french_name) is what
                        FilterProducts.jsx's Range filter actually matches
                        against — see its shopDeepLink handling. */}
                    <button
                      type="button"
                      onClick={() =>
                        goToShop({ type: "range", range_name: range.name })
                      }
                      className="text-left cursor-pointer"
                    >
                      {isFrench && range.french_name
                        ? range.french_name
                        : range.name}
                    </button>
                  </FooterItem>
                ))
              : // Falls back to the static translation list until the home
                // API's ranges have loaded, so this section is never empty.
                productRangesItems.map((item, index) => (
                  <FooterItem key={index}>
                    <a href="#">{item}</a>
                  </FooterItem>
                ))}
          </FooterGroup>

          {/* Professional — items[0] Resellers & Distributors, items[1]
              Become Partner/Ambassadors (see footer.json) */}
          <FooterGroup title={t("professional.title")} icon={PiHandshakeFill}>
            <FooterItem>
              <Link href="/become-a-reseller">{professionalItems[0]}</Link>
            </FooterItem>
            <FooterItem>
              <Link href="/become-an-ambassador">{professionalItems[1]}</Link>
            </FooterItem>
          </FooterGroup>

          {/* Resources & about */}
          <FooterGroup
            eyebrow={t("sections.resources")}
            title={t("laboratory.title")}
            icon={PiFlaskFill}
          >
            {laboratoryLinks.map((link) => (
              <FooterItem key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </FooterItem>
            ))}
            <FooterItem>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="text-left cursor-pointer"
              >
                {laboratoryItems[7]}
              </button>
            </FooterItem>
          </FooterGroup>

          <FooterGroup title={t("news.title")} icon={PiNewspaperFill}>
            {newsItems.map((item, index) => (
              <FooterItem key={index}>
                <Link href="/advices">{item}</Link>
              </FooterItem>
            ))}
          </FooterGroup>
        </div>
      </div>

      {/* Newsletter + app download band */}
      <div className="bg-[#2a2a2a] text-[#f3f3f3]">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
          <p className="text-[16px] font-semibold lg:whitespace-nowrap">
            {t("newsletter.title")}
          </p>

          <form
            onSubmit={handleSubscribe}
            className="flex-1 min-w-0 lg:max-w-[400px]"
            noValidate
          >
            <div
              className={`group relative flex items-center gap-2 bg-white border ${
                newsletterError
                  ? "border-red-500"
                  : "border-white/15 focus-within:border-black/40"
              } p-1 pl-2 transition-colors duration-200`}
            >
              <FiMail className="w-4 h-4 text-black/45 flex-shrink-0" />
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => {
                  setNewsletterEmail(e.target.value);
                  if (newsletterError) setNewsletterError("");
                }}
                disabled={
                  newsletterStatus === "loading" ||
                  newsletterStatus === "success"
                }
                placeholder={t("newsletter.barPlaceholder")}
                aria-label={t("newsletter.emailLabel")}
                className="flex-1 min-w-0 bg-transparent text-black text-[13px] placeholder-black/40 focus:outline-none disabled:opacity-70"
              />
              <button
                type="submit"
                disabled={
                  newsletterStatus === "loading" ||
                  newsletterStatus === "success"
                }
                className="h-10 px-5 sm:px-7 bg-black text-white text-[13px] font-semibold uppercase tracking-[0.08em] cursor-pointer hover:bg-black/80 transition-colors whitespace-nowrap inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-80"
              >
                {newsletterStatus === "loading" ? (
                  "Subscribing..."
                ) : newsletterStatus === "success" ? (
                  <>
                    You&apos;re in <FiCheck className="w-4 h-4" />
                  </>
                ) : (
                  t("newsletter.subscribeButton")
                )}
              </button>
              {/* Same focus treatment as AuthInput (Login): a black
                  gradient bar grows in along the bottom edge. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-0 bottom-0 h-[2px] w-0 group-focus-within:w-full bg-gradient-to-r from-[#0b0b0a] via-[#5a584f] to-[#0b0b0a] transition-all duration-300"
              />
            </div>
            {newsletterError && (
              <p className="text-red-400 text-xs mt-2 pl-5">
                {newsletterError}
              </p>
            )}
          </form>

          {/* App Download — neither store listing exists yet, so these
              open the launch countdown modal rather than linking to # */}
          <div className="flex flex-wrap items-center gap-3 lg:ml-auto lg:pl-8 lg:border-l lg:border-white/15">
            <StoreBadge
              onClick={handleAppComingSoon}
              ariaLabel={t("mobileApp.googlePlay")}
              icon={<GooglePlayIcon />}
              prefix={t("mobileApp.googlePlayPrefix")}
              name="Google Play"
            />
            <StoreBadge
              onClick={handleAppComingSoon}
              ariaLabel={t("mobileApp.appStore")}
              icon={<FaApple className="w-5 h-5 text-white" />}
              prefix={t("mobileApp.appStorePrefix")}
              name="App Store"
            />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-black/10 bg-[#f3f3f3]">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-5 flex flex-col lg:flex-row justify-between items-center gap-3 text-[12px] text-center text-black/60">
          <p>{t("bottom.copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center">
            <a href="#" className={bottomLinkClass}>
              {t("bottom.conception")}
            </a>
            <a href="#" className={bottomLinkClass}>
              {t("bottom.agency")}
            </a>
            <Link href="/faq" className={bottomLinkClass}>
              {t("bottom.faqs")}
            </Link>
            <Link
              href="/termsCondition?section=disclaimer"
              className={bottomLinkClass}
            >
              {t("bottom.disclaimer")}
            </Link>
            <Link
              href="/termsCondition?section=shipping"
              className={bottomLinkClass}
            >
              {t("bottom.shipping")}
            </Link>
            <Link
              href="/termsCondition?section=privacy"
              className={bottomLinkClass}
            >
              {t("bottom.privacy")}
            </Link>
            <Link
              href="/termsCondition?section=terms"
              className={bottomLinkClass}
            >
              {t("bottom.terms")}
            </Link>
          </div>
        </div>
      </div>

      <ContactUs isOpen={showModal} onClose={() => setShowModal(false)} />
      <AppLaunchModal
        isOpen={showAppModal}
        onClose={() => setShowAppModal(false)}
      />
    </footer>
  );
}

// Puts a section label (e.g. "Pet care by species") above the first group
// of a section.
function withEyebrow(groups, eyebrow) {
  return groups.map((group, index) =>
    index === 0 ? React.cloneElement(group, { eyebrow }) : group,
  );
}

// Picks an animal icon for a species group from its (English or French)
// name. "dog" is checked before "pupp" so "Dogs & Puppies" gets the dog.
const SPECIES_ICONS = [
  [/dog|chien/i, PiDogFill],
  [/pupp|chiot/i, PiPawPrintFill],
  [/cat|kitten|chat/i, PiCatFill],
  [/horse|cheva|equi/i, PiHorseFill],
  [/mammal|mammif|rabbit|lapin/i, PiRabbitFill],
  [/bird|poultry|oiseau|volaille/i, PiBirdFill],
  [/reptile|turtle|tortue/i, GiTurtle],
];

function speciesIcon(name = "") {
  const match = SPECIES_ICONS.find(([pattern]) => pattern.test(name));
  return match ? match[1] : PiPawPrintFill;
}

// One block of links. break-inside-avoid keeps a group in a single column
// of the masonry layout.
function FooterGroup({ eyebrow, title, icon: Icon, children }) {
  return (
    <div className="break-inside-avoid mb-7">
      {eyebrow && (
        <p className="mb-2.5 flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em] text-[#e7e7e5]/50">
          <span className="w-4 h-px bg-[#e7e7e5]/60" />
          {eyebrow}
        </p>
      )}
      <h3 className="flex items-center gap-2.5 text-[14.5px] font-semibold text-[#f3f3f3] mb-3">
        {Icon && (
          <Icon className="w-[18px] h-[18px] flex-shrink-0 text-[#f3f3f3]" />
        )}
        {title}
      </h3>
      <ul className="space-y-2 text-[13px] text-[#e7e7e5]/65">{children}</ul>
    </div>
  );
}

function FooterItem({ children }) {
  return (
    <li className="hover:text-white hover:translate-x-1 transition-all duration-200">
      {children}
    </li>
  );
}

function SocialRow({ links }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {links.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          className="w-8 h-8 border border-white/20 text-[#e7e7e5]/80 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-colors"
        >
          <Icon className="w-3.5 h-3.5" />
        </a>
      ))}
    </div>
  );
}

function StoreBadge({ onClick, ariaLabel, icon, prefix, name }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="h-10 px-3 bg-black border border-white/20 flex items-center gap-2 cursor-pointer hover:border-white transition-colors"
    >
      {icon}
      <span className="flex flex-col items-start leading-none text-white">
        <span className="text-[8px] tracking-wide uppercase text-[#e7e7e5]/80">
          {prefix}
        </span>
        <span className="text-[14px] font-medium mt-0.5">{name}</span>
      </span>
    </button>
  );
}

function GooglePlayIcon() {
  return (
    <svg viewBox="0 0 24 26" className="w-[18px] h-5" aria-hidden="true">
      <path
        d="M1 1.2 13.4 13 1 24.8c-.4-.2-.6-.7-.6-1.2V2.4c0-.5.2-1 .6-1.2Z"
        fill="#2196F3"
      />
      <path
        d="M17.6 8.8 13.4 13 1 1.2c.2-.1.4-.2.7-.2.3 0 .5.1.8.2l15.1 7.6Z"
        fill="#4CAF50"
      />
      <path
        d="M17.6 17.2 2.5 24.8c-.3.1-.5.2-.8.2-.3 0-.5-.1-.7-.2L13.4 13l4.2 4.2Z"
        fill="#F44336"
      />
      <path
        d="M23 13c0 .6-.3 1.1-.9 1.4l-4.5 2.8L13.4 13l4.2-4.2 4.5 2.8c.6.3.9.8.9 1.4Z"
        fill="#FFC107"
      />
    </svg>
  );
}
