"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlagImage, defaultCountries, parseCountry } from "react-international-phone";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import toast from "react-hot-toast";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { BASE_URL, MEDIA_URL } from "../../API/API";
import { getPhoneValidationErrorCode } from "../../../utils/phoneValidation";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// Maps getPhoneValidationErrorCode's return value to an ambassador.json
// errors.* key — same codes CheckOut.jsx and UserProfile.jsx map through
// their own translation files.
const PHONE_ERROR_KEYS = {
  required: "errors.phoneRequired",
  tooShort: "errors.phoneTooShort",
  tooLong: "errors.phoneTooLong",
  invalid: "errors.phoneInvalid",
};

// Ported 1:1 from the PAGE_DEVENIR_AMBASSADEUR ("Become a Partner") mockup —
// same fonts/colors/layout, scoped via styled-jsx so it never leaks into (or
// gets overridden by) the site's global Tailwind/Inter styles. The mockup's
// own promo-bar/site-header/footer markup is dropped in favor of the site's
// real Navbar/Footer. The mockup's vanilla-JS form logic (profile + animal
// universe -> program resolution, dynamic field list, side-panel copy, the
// hidden score/priority computation and the submit success/error message)
// is re-implemented with React state instead of direct DOM manipulation,
// but every data object, label, option list and piece of copy is carried
// over verbatim from the mockup's <script> block.
//
// APPLICATION SECTION PINNING
// ---------------------------
// On desktop the right-hand .side-panel is pinned: once the application
// section reaches the viewport the panel parks itself at --pin-gap below the
// fixed navbar and stays there while only the left column (.form-card) keeps
// moving under it. When the form column runs out, the section ends and the
// page continues scrolling normally — scrolling back up re-pins it.
//
// The panel is height-capped (max-height: viewport minus navbar/pin-gap)
// with its own inner scrollbar: once its content is taller than the space
// under the navbar, hovering the panel and scrolling moves only the panel's
// content while the left column stays put. overscroll-behavior: contain
// stops that inner scroll from chaining into the page once the panel hits
// its own top/bottom edge, so scrolling past it resumes the normal page
// scroll (and the left column) instead of getting trapped.
//
// Pinning is done with position: sticky rather than by locking page scroll:
// the left column is a real form, so its inputs must stay reachable by
// keyboard, browser autofill and mobile focus-scroll. Sticky gives the same
// visual result (right frozen, left travelling) without taking the scroll
// away. Below 1180px the two columns stack and the pin is disabled.

function text(name, label, required = false, score = false) {
  return { type: "text", name, label, required, score };
}
function number(name, label, required = false, score = false) {
  return { type: "number", name, label, required, score };
}
function select(name, label, required = false, options = [], score = false) {
  return { type: "select", name, label, required, options, score };
}
function otherProgram(brand, label, title) {
  return {
    brand,
    label,
    title,
    side: label,
    tags: ["Open", "Custom", "Review"],
    description: "For any partnership idea that does not fit the predefined categories.",
    subtitle: "A few quick details to help our team identify the right opportunity.",
    fields: [
      select(
        "project_type",
        "Project type",
        true,
        ["Event", "Association / charity", "Media / press", "Retail activation", "Education project", "Other"],
        true
      ),
      text("project_name", "Project name / short title", true, true),
      select(
        "requested_support",
        "Support requested",
        true,
        ["Products", "Samples", "Discount vouchers", "Goodies", "Event support", "Visibility", "Other"],
        true
      ),
    ],
  };
}

// Defined but unused in the source mockup too (its own script never reads
// `brands` anywhere) — kept here for a faithful 1:1 data port.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const brands = {
  biogance: {
    label: "Biogance",
    description:
      "Biogance partners represent pets and companion animals: dogs, cats, small mammals, birds and reptiles.",
    profiles: ["biogance_creator", "youtube", "breeder", "club", "behaviourist", "trainer", "groomer", "veterinarian", "other_biogance"],
  },
  ekinat: {
    label: "Ekinat",
    description:
      "Ekinat partners represent the equestrian universe only: horses, stable life, riding centres, stud farms and horse-care experts.",
    profiles: ["ekinat_creator", "stud_farms", "horse_groom", "other_ekinat"],
  },
};

const baseSelect = {
  yesNo: ["Yes", "No", "Not sure"],
  contentComfort: ["Very comfortable", "Comfortable", "Not yet, but willing to improve", "Not comfortable"],
  formats: ["Photos", "Short videos / Reels", "Long-form videos", "Articles / expert words", "Event content", "Other"],
  frequency: ["Several times per week", "Weekly", "A few times per month", "Occasionally"],
};

const programs = {
  biogance_creator: {
    brand: "biogance",
    label: "Content Creators",
    title: "Content Creator Application",
    side: "Content Creator",
    tags: ["Instagram", "UGC", "Pet care"],
    description: "For creators who can share authentic pet-care routines, product moments and community stories.",
    subtitle: "A short application to understand your universe, your animals and your content potential.",
    fields: [
      text("pets_featured", "Animal(s) featured", true),
      select("content_formats", "Preferred content format", true, baseSelect.formats, true),
      select("publishing_frequency", "Publishing frequency", true, baseSelect.frequency, true),
      select("content_comfort", "Photo / video comfort", true, baseSelect.contentComfort, true),
      select(
        "content_type",
        "Content you can create",
        true,
        ["Reels / short videos", "Photos", "Stories", "UGC product content", "Expert tips", "Not sure yet"],
        true
      ),
    ],
  },
  youtube: {
    brand: "biogance",
    label: "YouTubers",
    title: "YouTube Partner Application",
    side: "YouTube Partner",
    tags: ["YouTube", "Reviews", "Education"],
    description: "For creators who can produce credible video content, reviews, routines or educational animal-care videos.",
    subtitle: "Tell us what your channel is about and how the selected universe could naturally appear in your videos.",
    fields: [
      select(
        "youtube_content_type",
        "Main video theme",
        true,
        ["Pet care advice", "Breed / animal education", "Grooming tutorials", "Equestrian care", "Lifestyle with animals", "Other"],
        true
      ),
      number("average_youtube_views", "Average views per video", true, true),
      select(
        "video_format",
        "Preferred collaboration format",
        true,
        ["Dedicated review", "Routine / tutorial", "Integrated segment", "Shorts series", "Not sure"],
        true
      ),
      select("tracking_ready", "Can you share a link or promo code?", true, baseSelect.yesNo, true),
      select(
        "youtube_video_style",
        "Video content you can create",
        true,
        ["Product review", "Routine / tutorial", "Shorts series", "Integrated segment", "Educational video", "Not sure yet"],
        true
      ),
    ],
  },
  breeder: {
    brand: "biogance",
    label: "Breeders",
    title: "Breeder Application",
    side: "Breeder Partner",
    tags: ["Breed expertise", "Kits", "Articles"],
    description: "For responsible small-scale breeders with strong ethics, breed expertise and ability to share advice.",
    subtitle: "A short form to understand your breeding activity and how you could contribute expert content.",
    fields: [
      text("breeding_name", "Breeding name / kennel / cattery", true),
      text("breeds", "Breed(s)", true),
      number("litters_per_year", "Litters per year", true, true),
      text("champion_titles", "Champion titles / awards, if any", false, true),
      select("article_writing", "Comfortable writing expert articles?", true, ["Yes", "With editorial support", "No"], true),
    ],
  },
  club: {
    brand: "biogance",
    label: "Clubs / Associations",
    title: "Club Application",
    side: "Club Partner",
    tags: ["Events", "Community", "Awards"],
    description: "For dog, cat or animal clubs with regular events, active members and community visibility.",
    subtitle: "Tell us about your club, your events and the visibility you can offer after sponsored moments.",
    fields: [
      text("club_name", "Club / association name", true),
      text("club_scope", "Breed, species or activity", true),
      number("club_members", "Number of members", true, true),
      number("events_per_year", "Events per year", true, true),
      select(
        "post_event_content",
        "Can you send photos/videos after events?",
        true,
        ["Yes — photos and videos", "Yes — photos only", "Maybe", "No"],
        true
      ),
      select(
        "sponsorship_request",
        "Support requested",
        true,
        ["BOB / BOS / BIS prize lots", "Samples", "Discount vouchers", "Goodies", "Event partnership", "Not sure yet"],
        true
      ),
    ],
  },
  behaviourist: {
    brand: "biogance",
    label: "Behaviourists",
    title: "Behaviourist Application",
    side: "Behaviourist",
    tags: ["Expert voice", "Advice", "Education"],
    description: "For behaviour experts who can share practical advice through expert words, articles or videos.",
    subtitle: "Share your expertise and the type of advice you could bring to our community.",
    fields: [
      text("professional_title", "Professional title / certification", true, true),
      number("years_experience", "Years of experience", true, true),
      select(
        "specialties",
        "Main specialty",
        true,
        ["Anxiety / stress", "Reactivity", "Puppy / kitten education", "Cat behaviour", "Everyday behaviour", "Other"],
        true
      ),
      select("expert_content_format", "Preferred expert content format", true, ["Text", "Video", "Text + video", "Interview"], true),
    ],
  },
  trainer: {
    brand: "biogance",
    label: "Educators / Dog Trainers",
    title: "Educator Application",
    side: "Educator",
    tags: ["Training", "Tutorials", "Advice"],
    description: "For educators and trainers able to create useful tips, tutorials or expert advice.",
    subtitle: "A short application to understand your expertise and content comfort.",
    fields: [
      text("business_name", "Business / professional name", true),
      text("certifications", "Certifications / training background", false, true),
      number("years_experience", "Years of experience", true, true),
      select("tutorial_ready", "Comfortable creating tips or tutorials?", true, ["Yes — video", "Yes — text", "Text + video", "Not yet"], true),
      select(
        "training_topic",
        "Topic you can cover",
        true,
        ["Puppy education", "Recall / walking", "Positive training", "Dog confidence", "Daily routines", "Other"],
        true
      ),
    ],
  },
  groomer: {
    brand: "biogance",
    label: "Groomers",
    title: "Groomer Application",
    side: "Groomer",
    tags: ["Video", "Before / After", "Tutorials"],
    description: "For groomers comfortable creating audiovisual content, routines, tutorials or before/after visuals.",
    subtitle: "Tell us about your salon and your ability to showcase Biogance routines in image or video.",
    fields: [
      text("salon_name", "Salon name", true),
      number("clients_per_month", "Approx. clients per month", true, true),
      select("audiovisual_comfort", "Comfortable creating videos?", true, baseSelect.contentComfort, true),
      select(
        "before_after_ready",
        "Can you provide before/after visuals?",
        true,
        ["Yes — photos and videos", "Yes — photos only", "Maybe", "No"],
        true
      ),
      select(
        "tutorial_type",
        "Tutorial you can create",
        true,
        ["Complete grooming routine", "Before / after", "Shampoo routine", "Coat care tip", "Sensitive skin routine", "Other"],
        true
      ),
    ],
  },
  veterinarian: {
    brand: "biogance",
    label: "Veterinarians",
    title: "Veterinarian Application",
    side: "Veterinarian",
    tags: ["Expert", "Credibility", "Advice"],
    description: "For veterinary professionals comfortable sharing reliable expert advice in text or video format.",
    subtitle: "A short form to understand your expertise and the topics you could help explain.",
    fields: [
      text("clinic_name", "Clinic / practice name", true),
      text("veterinary_registration", "Professional registration / ID", true, true),
      text("specialties", "Specialties", false),
      select("expert_content_format", "Preferred expert content format", true, ["Text", "Video", "Text + video", "Interview"], true),
      select(
        "expert_topic",
        "Expert topic you can cover",
        true,
        ["Skin and coat care", "Hygiene routine", "Puppy / kitten care", "Sensitive animals", "Prevention and well-being", "Other"],
        true
      ),
    ],
  },
  ekinat_creator: {
    brand: "ekinat",
    label: "Equestrian Creators",
    title: "Equestrian Creator Application",
    side: "Equestrian Creator",
    tags: ["Horse care", "Stable life", "Ekinat"],
    description: "For equestrian profiles who can show horse-care routines, competition moments or stable-life content.",
    subtitle: "Tell us about your equestrian world and how Ekinat could naturally fit into your content.",
    fields: [
      text("equestrian_profile", "Rider / stable / creator profile", true),
      select("discipline", "Main discipline", true, ["Show jumping", "Dressage", "Eventing", "Racing", "Endurance", "Leisure riding", "Other"], true),
      number("horses_featured", "Horses regularly featured", true, true),
      select("competition_level", "Competition level", true, ["International", "National", "Regional", "Local", "No competition"], true),
      select(
        "ekinat_content_type",
        "Ekinat content you can create",
        true,
        ["Horse-care routine", "Stable-life content", "Competition preparation", "Product demonstration", "Before / after", "Other"],
        true
      ),
    ],
  },
  stud_farms: {
    brand: "ekinat",
    label: "Stud Farms & Clubs",
    title: "Stud Farm / Club Application",
    side: "Stud Farms & Clubs",
    tags: ["Stable", "Club", "Events"],
    description: "For riding centres, stud farms, clubs and equestrian institutions with horses, members and visibility.",
    subtitle: "Share your structure, your audience and the support you are looking for.",
    fields: [
      text("institution_name", "Institution / stud farm / club name", true),
      select("institution_type", "Structure type", true, ["Stud farm", "Riding centre", "Pony club", "Training centre", "Equestrian club", "Other"], true),
      number("horses_on_site", "Number of horses", true, true),
      number("members_or_clients", "Members / regular clients", true, true),
      number("events_per_year", "Events per year", true, true),
      select(
        "requested_support",
        "Support requested",
        true,
        ["Product allocation", "Samples", "Goodies", "Event support", "Communication support", "Not sure yet"],
        true
      ),
    ],
  },
  horse_groom: {
    brand: "ekinat",
    label: "Horse Grooms",
    title: "Horse Groom Application",
    side: "Horse Groom",
    tags: ["Video", "Routine", "Stable care"],
    description: "For horse grooms able to create practical videos, routines or stable-life content with Ekinat.",
    subtitle: "Tell us about your role and your comfort with video content.",
    fields: [
      text("professional_role", "Professional role", true),
      text("stable_or_team", "Stable / team / rider", true),
      number("horses_cared_for", "Horses cared for weekly", true, true),
      select("routine_video_ready", "Comfortable filming care routines?", true, ["Yes", "With guidance", "Not yet"], true),
      select(
        "video_type",
        "Video you can create",
        true,
        ["Horse-care routine", "Stable care tip", "Competition preparation", "Product demonstration", "Before / after", "Other"],
        true
      ),
    ],
  },
  other_biogance: otherProgram("biogance", "Other Project", "Other Project Application"),
  other_ekinat: otherProgram("ekinat", "Other Ekinat Project", "Other Project Application"),
};

// All dynamic-field names across every program, used to clear stale values
// (e.g. "specialties" exists on both behaviourist and veterinarian) whenever
// the resolved program changes — the mockup gets this for free because it
// rebuilds the dynamic fieldset's innerHTML from scratch on every change.
const dynamicFieldNames = Array.from(new Set(Object.values(programs).flatMap((p) => p.fields.map((f) => f.name))));

const sidePanelCopy = {
  default: {
    missionTitle: "More than a collaboration",
    missionCopy:
      "Join a human brand adventure built around animals, expertise and authentic stories. Bring your voice, your community and your way of caring.",
    missionTags: ["#Trust", "#Expertise", "#Content", "#Community"],
    rewardTitle: "What you can expect",
    rewardCopy:
      "If your application is selected, our Marketing Team will contact you to imagine the right collaboration: Biogance for pets or Ekinat for horses.",
    rewardTags: ["#Visibility", "#Support", "#Community", "#Surprises"],
  },
  content_creator: {
    missionTitle: "Your mission",
    missionCopy:
      "Help Biogance grow its awareness and visibility through beautiful Reels, photos, stories and authentic content shared with your community.",
    missionTags: ["#Reels", "#Photos", "#Stories", "#Community"],
    rewardTitle: "What you receive",
    rewardCopy: "Early access to products, features on our social media, a discount code for your followers and many other surprises along the way.",
    rewardTags: ["#EarlyAccess", "#DiscountCode", "#SocialFeature", "#Surprises"],
  },
  biogance_creator: {
    missionTitle: "Your mission",
    missionCopy:
      "Help Biogance grow its awareness and visibility through beautiful Reels, photos, stories and authentic content shared with your community.",
    missionTags: ["#Reels", "#Photos", "#Stories", "#Community"],
    rewardTitle: "What you receive",
    rewardCopy: "Early access to products, features on our social media, a discount code for your followers and many other surprises along the way.",
    rewardTags: ["#EarlyAccess", "#DiscountCode", "#SocialFeature", "#Surprises"],
  },
  youtube: {
    missionTitle: "Your mission",
    missionCopy:
      "Bring the selected universe to life through credible video content: reviews, routines, tutorials, Shorts or long-form stories that inspire your audience.",
    missionTags: ["#YouTube", "#Reviews", "#Tutorials", "#Shorts"],
    rewardTitle: "What you receive",
    rewardCopy: "Products to test, social media visibility, a discount code for your community and exclusive collaboration opportunities.",
    rewardTags: ["#Products", "#DiscountCode", "#Visibility", "#Collaboration"],
  },
  breeder: {
    missionTitle: "Your mission",
    missionCopy:
      "Share your breed expertise through expert videos or articles, and give Biogance visibility when you attend shows, competitions or community events.",
    missionTags: ["#BreedExpertise", "#Articles", "#ExpertVideo", "#Shows"],
    rewardTitle: "What you receive",
    rewardCopy:
      "Puppy or kitten kits for adopting families, product allocation, social media features, Biogance signage and other surprises to support your breeding program.",
    rewardTags: ["#PuppyKits", "#KittenKits", "#Products", "#Signage"],
  },
  club: {
    missionTitle: "Your mission",
    missionCopy: "Highlight Biogance during your events, on social media and across your communication supports while sharing beautiful moments from the show.",
    missionTags: ["#Events", "#BOB", "#BOS", "#BIS"],
    rewardTitle: "What you receive",
    rewardCopy: "Prize lots for BOB, BOS and BIS, plus samples, discount vouchers and goodies for your members and participants.",
    rewardTags: ["#PrizeLots", "#Samples", "#Vouchers", "#Goodies"],
  },
  behaviourist: {
    missionTitle: "Your mission",
    missionCopy:
      "Share expert words, practical advice or videos that help pet owners better understand animal behaviour and build healthier routines.",
    missionTags: ["#ExpertVoice", "#Advice", "#Video", "#Education"],
    rewardTitle: "What you receive",
    rewardCopy: "Product allocation, discount vouchers for your clients or community, samples and visibility on Biogance social media.",
    rewardTags: ["#Products", "#Vouchers", "#Samples", "#SocialFeature"],
  },
  trainer: {
    missionTitle: "Your mission",
    missionCopy: "Create expert tips, short videos or educational content that help pet owners progress with care, confidence and responsible training.",
    missionTags: ["#ExpertVoice", "#Training", "#Video", "#Education"],
    rewardTitle: "What you receive",
    rewardCopy: "Product allocation, discount vouchers for your clients or community, samples and visibility on Biogance social media.",
    rewardTags: ["#Products", "#Vouchers", "#Samples", "#SocialFeature"],
  },
  groomer: {
    missionTitle: "Your mission",
    missionCopy:
      "Show your grooming expertise through high-quality videos: complete grooming routines, product use, before/after results and professional gestures.",
    missionTags: ["#Grooming", "#FullRoutine", "#BeforeAfter", "#Video"],
    rewardTitle: "What you receive",
    rewardCopy:
      "Product allocation for each validated video, very advantageous discounts and the opportunity to actively contribute to our continuous product improvement.",
    rewardTags: ["#Products", "#PreferredDiscounts", "#ProductFeedback", "#Expertise"],
  },
  veterinarian: {
    missionTitle: "Your mission",
    missionCopy: "Share reliable expert words, articles or videos that help pet owners understand care routines with clarity, trust and professional insight.",
    missionTags: ["#ExpertVoice", "#VeterinaryAdvice", "#Video", "#Trust"],
    rewardTitle: "What you receive",
    rewardCopy: "Product allocation, discount vouchers for your clients or community, samples and visibility on Biogance social media.",
    rewardTags: ["#Products", "#Vouchers", "#Samples", "#SocialFeature"],
  },
  ekinat_creator: {
    missionTitle: "Your mission",
    missionCopy: "Increase Ekinat visibility through elegant equestrian content: horse-care routines, stable life, competition moments, Reels, photos and stories.",
    missionTags: ["#HorseCare", "#StableLife", "#Reels", "#Community"],
    rewardTitle: "What you receive",
    rewardCopy: "Early product access, features on our social media, a discount code for your community and exclusive Ekinat surprises.",
    rewardTags: ["#EarlyAccess", "#DiscountCode", "#SocialFeature", "#Ekinat"],
  },
  stud_farms: {
    missionTitle: "Your mission",
    missionCopy:
      "Give Ekinat visibility at the stable, during events and on your communication supports while sharing real care moments with your equestrian community.",
    missionTags: ["#Stable", "#Events", "#Club", "#Visibility"],
    rewardTitle: "What you receive",
    rewardCopy: "Dedicated support, product allocation, samples, goodies and communication opportunities adapted to your equestrian structure.",
    rewardTags: ["#Products", "#Samples", "#Goodies", "#Support"],
  },
  horse_groom: {
    missionTitle: "Your mission",
    missionCopy:
      "Create practical, high-quality videos showing Ekinat routines, stable care, event preparation and professional gestures around the horse.",
    missionTags: ["#HorseGroom", "#Routine", "#Video", "#StableCare"],
    rewardTitle: "What you receive",
    rewardCopy: "Ekinat product allocation, preferential discounts, social media visibility and the opportunity to share feedback for continuous improvement.",
    rewardTags: ["#Products", "#PreferredDiscounts", "#SocialFeature", "#Feedback"],
  },
  other: {
    missionTitle: "Your mission",
    missionCopy:
      "Tell us about your project and how you would like to bring Biogance for pets or Ekinat for horses to life through your community, event or expertise.",
    missionTags: ["#Project", "#Community", "#Visibility", "#Care"],
    rewardTitle: "What you receive",
    rewardCopy: "Our Marketing Team will review your proposal and come back to you with the most relevant partnership opportunity.",
    rewardTags: ["#Review", "#Support", "#Opportunity", "#NextSteps"],
  },
  other_biogance: {
    missionTitle: "Your mission",
    missionCopy: "Tell us about your project and how you would like to bring Biogance to life through your community, event or expertise.",
    missionTags: ["#Project", "#Community", "#Visibility", "#Biogance"],
    rewardTitle: "What you receive",
    rewardCopy: "Our Marketing Team will review your proposal and come back to you with the most relevant partnership opportunity.",
    rewardTags: ["#Review", "#Support", "#Opportunity", "#NextSteps"],
  },
  other_ekinat: {
    missionTitle: "Your mission",
    missionCopy: "Tell us about your project and how you would like to bring Ekinat to life through your equestrian community, event or expertise.",
    missionTags: ["#Project", "#Community", "#Visibility", "#Ekinat"],
    rewardTitle: "What you receive",
    rewardCopy: "Our Marketing Team will review your proposal and come back to you with the most relevant partnership opportunity.",
    rewardTags: ["#Review", "#Support", "#Opportunity", "#NextSteps"],
  },
};

function brandFromAnimal(animal) {
  if (animal === "horse") return "ekinat";
  if (animal === "all") return "biogance_ekinat";
  if (animal) return "biogance";
  return "";
}

function brandLabel(t, key) {
  if (key === "ekinat") return t("brand.label.ekinat");
  if (key === "biogance_ekinat") return t("brand.label.bioganceEkinat");
  if (key === "biogance") return t("brand.label.biogance");
  return t("brand.label.fallback");
}

function brandShortLabel(t, key) {
  if (key === "ekinat") return t("brand.shortLabel.ekinat");
  if (key === "biogance_ekinat") return t("brand.shortLabel.bioganceEkinat");
  if (key === "biogance") return t("brand.shortLabel.biogance");
  return t("brand.shortLabel.fallback");
}

function brandHashLabel(t, key) {
  if (key === "ekinat") return t("brand.hashLabel.ekinat");
  if (key === "biogance_ekinat") return t("brand.hashLabel.bioganceEkinat");
  if (key === "biogance") return t("brand.hashLabel.biogance");
  return t("brand.hashLabel.fallback");
}

function sideCopyKeyFromProfile(profile, animal) {
  if (!profile) return "default";
  if (animal === "horse") {
    if (profile === "content_creator") return "ekinat_creator";
    if (profile === "breeder" || profile === "club") return "stud_farms";
    if (profile === "groomer") return "horse_groom";
    if (profile === "other") return "other_ekinat";
  }
  const map = {
    content_creator: "content_creator",
    youtube: "youtube",
    breeder: "breeder",
    club: "club",
    behaviourist: "behaviourist",
    trainer: "trainer",
    groomer: "groomer",
    veterinarian: "veterinarian",
    other: "other",
  };
  return map[profile] || profile || "default";
}

function resolveProgram(profile, animal) {
  if (!profile || !animal) return "";
  const horse = animal === "horse";
  if (horse) {
    if (profile === "content_creator") return "ekinat_creator";
    if (profile === "youtube") return "youtube";
    if (profile === "breeder" || profile === "club") return "stud_farms";
    if (profile === "groomer") return "horse_groom";
    return "other_ekinat";
  }
  const map = {
    content_creator: "biogance_creator",
    youtube: "youtube",
    breeder: "breeder",
    club: "club",
    behaviourist: "behaviourist",
    trainer: "trainer",
    groomer: "groomer",
    veterinarian: "veterinarian",
    other: "other_biogance",
  };
  return map[profile] || "other_biogance";
}

// Mirrors updatePath()'s four branches (neither/profile-only/animal-only/
// both selected) from the mockup script — computed as a pure function of
// the two selects instead of imperative textContent/classList writes.
function computePathState(t, profile, animal) {
  const brandKey = brandFromAnimal(animal);
  const brandLbl = brandLabel(t, brandKey);
  const derivedUniverseText = brandKey ? t("path.suggestedUniverse", { brand: brandLbl }) : "";

  if (!profile && !animal) {
    return {
      brandKey,
      derivedUniverseText,
      sideTitle: t("path.neither.sideTitle"),
      sideDescription: t("path.neither.sideDescription"),
      sideTags: t("path.neither.tags", { returnObjects: true }),
      sideCopyKey: "default",
      formTitle: t("path.genericFormTitle"),
      formSubtitle: t("path.genericFormSubtitle"),
      pathNote: t("path.neither.pathNote"),
      programKey: "",
      dynamicLegend: t("path.genericDynamicLegend"),
      visible: false,
    };
  }

  if (profile && !animal) {
    const profileLbl = t(`profileLabels.${profile}`) || t("path.profileOnly.fallbackTitle");
    return {
      brandKey,
      derivedUniverseText,
      sideTitle: profileLbl,
      sideDescription: t("path.profileOnly.sideDescription"),
      sideTags: [`#${(profileLbl || t("path.profileOnly.fallbackTag")).replaceAll(" ", "")}`, t("path.profileOnly.tagAnimals")],
      sideCopyKey: sideCopyKeyFromProfile(profile, animal),
      formTitle: t("path.genericFormTitle"),
      formSubtitle: t("path.genericFormSubtitle"),
      pathNote: t("path.profileOnly.pathNote"),
      programKey: "",
      dynamicLegend: t("path.genericDynamicLegend"),
      visible: false,
    };
  }

  if (!profile && animal) {
    const animalLbl = t(`animalLabels.${animal}`) || t("path.animalOnly.fallbackTitle");
    return {
      brandKey,
      derivedUniverseText,
      sideTitle: animalLbl,
      sideDescription: t("path.animalOnly.sideDescriptionTemplate", { animal: animalLbl, brand: brandLbl }),
      sideTags: [`#${brandLbl.replaceAll(" ", "")}`, t("path.animalOnly.tagProfile")],
      sideCopyKey: "default",
      formTitle: t("path.genericFormTitle"),
      formSubtitle: t("path.genericFormSubtitle"),
      pathNote: t("path.animalOnly.pathNote"),
      programKey: "",
      dynamicLegend: t("path.genericDynamicLegend"),
      visible: false,
    };
  }

  const programKey = resolveProgram(profile, animal);
  const brandHash = brandHashLabel(t, brandKey);
  const animalLbl = t(`animalLabels.${animal}`);
  const profileLbl = t(`profileLabels.${profile}`);
  const programLabel = t(`programs.${programKey}.label`);
  const programSide = t(`programs.${programKey}.side`);
  const programTitle = t(`programs.${programKey}.title`);
  const programDescription = t(`programs.${programKey}.description`, { brand: brandLbl });
  const programSubtitle = t(`programs.${programKey}.subtitle`, { brand: brandLbl });
  const brandNoteKey = brandKey === "ekinat" ? "ekinat" : brandKey === "biogance" ? "biogance" : "both";
  const brandNote = t(`path.brandNote.${brandNoteKey}`);
  const reviewNote = t(`path.reviewNote.${brandNoteKey}`);

  return {
    brandKey,
    derivedUniverseText,
    sideTitle: programSide,
    sideDescription: t("path.final.sideDescriptionTemplate", { description: programDescription, animal: animalLbl, note: brandNote }),
    sideTags: [`#${brandHash}`, `#${(profileLbl || programLabel).replaceAll(" ", "")}`, `#${animalLbl.replaceAll(" ", "")}`],
    sideCopyKey: programKey,
    formTitle: programTitle,
    formSubtitle: t("path.final.formSubtitleTemplate", { brand: brandShortLabel(t, brandKey), subtitle: programSubtitle }),
    pathNote: t("path.final.pathNoteTemplate", { brand: brandShortLabel(t, brandKey), label: programLabel, note: reviewNote }),
    programKey,
    dynamicLegend: t("path.final.dynamicLegendTemplate", { label: programLabel }),
    visible: true,
  };
}

const platformCheckNames = ["has_instagram", "has_tiktok", "has_youtube", "has_facebook", "has_other_platform"];

// Mirrors updateScore() from the mockup script line for line.
function computeScore({ profile, animal, brandKey, programKey, values, checks }) {
  const v = (name) => (checks[name] !== undefined ? (checks[name] ? "yes" : "") : String(values[name] ?? "").trim());

  let score = 0;
  if (profile) score += 10;
  if (animal) score += 10;
  if (brandKey) score += 5;

  const platformFollowerFields = ["instagram_followers", "tiktok_followers", "youtube_subscribers", "facebook_followers", "other_platform_followers"];
  const followerValues = platformFollowerFields.map((name) => Number(v(name)) || 0).filter(Boolean);
  const maxFollowers = followerValues.length ? Math.max(...followerValues) : 0;
  const totalFollowers = followerValues.reduce((sum, value) => sum + value, 0);
  const activePlatforms = platformCheckNames.filter((name) => v(name)).length;

  if (maxFollowers >= 100000) score += 26;
  else if (maxFollowers >= 50000) score += 22;
  else if (maxFollowers >= 15000) score += 17;
  else if (maxFollowers >= 5000) score += 12;
  else if (maxFollowers >= 1000) score += 8;
  else if (maxFollowers > 0) score += 4;

  if (totalFollowers >= 150000) score += 12;
  else if (totalFollowers >= 50000) score += 9;
  else if (totalFollowers >= 15000) score += 6;
  else if (totalFollowers >= 3000) score += 3;

  if (activePlatforms >= 3) score += 8;
  else if (activePlatforms === 2) score += 5;
  else if (activePlatforms === 1) score += 3;

  const avgViews = Number(v("average_youtube_views")) || 0;
  if (avgViews >= 20000) score += 10;
  else if (avgViews >= 8000) score += 7;
  else if (avgViews >= 2500) score += 4;

  const expertiseNames = ["champion_titles", "professional_title", "certifications", "veterinary_registration", "competition_level"];
  expertiseNames.forEach((name) => {
    if (v(name)) score += 4;
  });

  const usefulContentNames = [
    "content_idea",
    "youtube_video_idea",
    "training_topic",
    "tutorial_idea",
    "expert_topic",
    "ekinat_content_idea",
    "project_description",
    "requested_support",
  ];
  usefulContentNames.forEach((name) => {
    if (v(name).length > 18) score += 5;
  });

  const videoReady = [
    "content_comfort",
    "audiovisual_comfort",
    "routine_video_ready",
    "before_after_ready",
    "post_event_content",
    "tracking_ready",
    "tutorial_ready",
    "expert_content_format",
  ].some((name) => {
    const val = v(name).toLowerCase();
    return val.includes("yes") || val.includes("video") || val.includes("comfortable") || val.includes("photos and videos");
  });
  if (videoReady) score += 8;

  if (v("portfolio_link")) score += 4;
  if (v("content_usage_rights_accepted")) score += 2;
  if (v("information_accuracy")) score += 2;
  if (programKey && programs[programKey]) score += 2;
  score = Math.min(100, Math.round(score));

  let priority = "Incomplete";
  if (score >= 75) priority = "High priority";
  else if (score >= 55) priority = "Promising";
  else if (score >= 35) priority = "Manual review";

  return { score, priority };
}

const getDialCodeByIso2 = (iso2) => {
  const country = defaultCountries.find((c) => parseCountry(c).iso2 === iso2);
  return country ? `+${parseCountry(country).dialCode}` : "";
};

// Same flag + dial-code dropdown design as the phone field on the account
// profile page (src/Components/Pages/MyAccount/UserProfile.jsx's
// PhoneFieldBox), ported here so both phone inputs share one look.
function PhoneFieldBox({ iso2, onCountryChange, value, onChange, onBlur, required, onInvalid }) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef(null);
  const dialCode = getDialCodeByIso2(iso2 || "fr");

  const filteredCountries = defaultCountries
    .map((c) => parseCountry(c))
    .filter((p) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.dialCode.includes(q);
    });

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`phone-field-box relative flex items-stretch bg-gray-50 border transition-colors ${
        focused ? "border-gray-400 ring-2 ring-gray-400" : "border-gray-200"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="phone-country-button flex items-center gap-1.5 px-3 h-[48px] border-r border-gray-200 shrink-0 cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <FlagImage iso2={iso2 || "fr"} size="20px" />
        <span className="text-sm text-gray-700">{dialCode}</span>
        <MdOutlineKeyboardArrowDown
          className={`text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          size={16}
        />
      </button>

      <div className="relative flex-1">
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="555 777 888"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          onInvalid={onInvalid}
          className="phone-number-input w-full h-[48px] px-4 bg-transparent focus:outline-none text-gray-900 text-sm"
        />
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 shadow-lg z-20">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country..."
              className="phone-search-input w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <p className="px-3 py-4 text-sm text-gray-400 text-center">No country found</p>
            ) : (
              filteredCountries.map((p) => (
                <button
                  key={p.iso2}
                  type="button"
                  onClick={() => {
                    onCountryChange(p.iso2);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`group w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-gray-900 hover:bg-black hover:text-white transition-colors cursor-pointer ${
                    p.iso2 === iso2 ? "bg-gray-100" : ""
                  }`}
                >
                  <FlagImage iso2={p.iso2} size="18px" />
                  <span className="flex-1 truncate">{p.name}</span>
                  <span className="text-gray-400 group-hover:text-gray-300">+{p.dialCode}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function useSplashMedia(key) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const read = () => {
      try {
        const parsed = JSON.parse(localStorage.getItem("splashData") || "null");
        setData(parsed?.[key] ?? null);
      } catch {
        /* silent */
      }
    };
    read();
    window.addEventListener("splashDataReady", read);
    return () => window.removeEventListener("splashDataReady", read);
  }, [key]);
  return data;
}

function extractMediaItems(data) {
  const items = [];

  if (Array.isArray(data?.images) && data.images.length > 0) {
    data.images.forEach((img) => {
      let rawUrl = "";
      let type = "image";
      if (typeof img === "string" && img.trim()) {
        rawUrl = img.trim();
      } else if (img && typeof img === "object") {
        rawUrl = img.media || img.url || img.path || "";
        if (img.media_type) type = img.media_type;
      }
      if (rawUrl) {
        if (rawUrl.match(/\.(mp4|webm|ogg|mov)$/i)) {
          type = "video";
        }
        const url = rawUrl.startsWith("http") ? rawUrl : `${MEDIA_URL}${rawUrl}`;
        items.push({ url, type, rawUrl });
      }
    });
  }

  if (data?.media) {
    let rawUrl = typeof data.media === "string" ? data.media.trim() : (data.media?.media || data.media?.url || "");
    if (rawUrl) {
      const isVideo = data.media_type === "video" || rawUrl.match(/\.(mp4|webm|ogg|mov)$/i);
      const url = rawUrl.startsWith("http") ? rawUrl : `${MEDIA_URL}${rawUrl}`;
      if (!items.some((it) => it.rawUrl === rawUrl || it.url === url)) {
        items.push({ url, type: isVideo ? "video" : "image", rawUrl });
      }
    }
  }

  if (items.length <= 1) return items;

  const images = items.filter((it) => it.type === "image");
  const videos = items.filter((it) => it.type === "video");

  if (images.length > 0 && videos.length > 0) {
    const ordered = [images[0], videos[0], ...images.slice(1), ...videos.slice(1)];
    return ordered;
  }

  return items;
}

function AmbassadorHeaderSlider({ data }) {
  const items = useMemo(() => {
    const extracted = extractMediaItems(data);
    if (extracted.length > 0) return extracted;
    return [
      {
        url: "assets/biogance-partner-community.mp4",
        type: "video",
        poster: "assets/biogance-partners-poster.jpg",
      },
    ];
  }, [data]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  // Same loader pattern as Reseller.jsx's SplashMedia: each slide's own
  // image/video stays hidden (and a spinner shows in its place) until it
  // actually finishes loading, then it fades in and the spinner disappears.
  // Tracked per-index since every slide is mounted at once for the
  // crossfade, not just the active one.
  const [mediaLoaded, setMediaLoaded] = useState({});
  const markLoaded = (idx) => setMediaLoaded((prev) => (prev[idx] ? prev : { ...prev, [idx]: true }));

  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items, currentIndex]);

  const goToNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const goToPrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToSlide = (idx, e) => {
    e?.stopPropagation();
    setCurrentIndex(idx);
  };

  return (
    <div
      className="hero-video-frame"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="slider-track"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {items.map((item, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={idx}
              className={`slide-item ${isActive ? "active" : ""}`}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                opacity: isActive ? 1 : 0,
                zIndex: isActive ? 2 : 1,
                pointerEvents: isActive ? "auto" : "none",
                transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
                transform: isActive ? "scale(1)" : "scale(1.02)",
              }}
            >
              {!mediaLoaded[idx] && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      border: "3px solid rgba(255,255,255,.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "ambassador-media-spin 0.8s linear infinite",
                    }}
                  />
                </div>
              )}
              {item.type === "video" ? (
                <video
                  src={item.url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={item.poster}
                  onLoadedData={() => markLoaded(idx)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    opacity: mediaLoaded[idx] ? 0.92 : 0,
                    transition: "opacity 0.5s ease",
                  }}
                />
              ) : (
                <img
                  src={item.url}
                  alt={`Ambassador slide ${idx + 1}`}
                  onLoad={() => markLoaded(idx)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    opacity: mediaLoaded[idx] ? 0.92 : 0,
                    transition: "opacity 0.5s ease",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {items.length > 1 && (
        <>
          <div className="video-nav" aria-hidden="false">
            <button
              type="button"
              className="video-arrow left"
              onClick={goToPrev}
              aria-label="Previous slide"
            />
            <button
              type="button"
              className="video-arrow right"
              onClick={goToNext}
              aria-label="Next slide"
            />
          </div>

          <div className="dots-indicator-container">
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`dot-indicator ${idx === currentIndex ? "active" : ""}`}
                onClick={(e) => goToSlide(idx, e)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Ambasseder() {
  const { t } = useTranslation("ambassador");
  const headerMedia = useSplashMedia("ambassador_header");
  const [profile, setProfile] = useState("");
  const [animal, setAnimal] = useState("");
  const [values, setValues] = useState({});
  const [checks, setChecks] = useState({
    has_instagram: false,
    has_tiktok: false,
    has_youtube: false,
    has_facebook: false,
    has_other_platform: false,
    content_usage_rights_accepted: false,
    contact_consent: false,
    information_accuracy: false,
  });
  const [submitMessage, setSubmitMessage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messageRef = useRef(null);

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    document.body.style.overflow = "";
  };

  const [phoneIso2, setPhoneIso2] = useState("fr");
  const phoneCountryEditedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const applyDetectedCountry = (code) => {
      if (cancelled || phoneCountryEditedRef.current) return;
      const matched = defaultCountries.find((c) => parseCountry(c).iso2 === code);
      if (matched) setPhoneIso2(code);
    };

    const cached = sessionStorage.getItem("_visitorCountry");
    if (cached) {
      applyDetectedCountry(cached);
      return;
    }

    // Firefox ETP / uBlock can block fetch() to same-origin API routes with
    // geo-related path segments — XHR goes through a different pipeline and
    // isn't caught by the same filter lists (same fallback as CheckOut.jsx).
    const fetchLocaleViaXhr = () =>
      new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "/api/visitor-locale", true);
        xhr.timeout = 5000;
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Invalid JSON"));
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("XHR network error"));
        xhr.ontimeout = () => reject(new Error("XHR timeout"));
        xhr.send();
      });

    (async () => {
      try {
        let data;
        try {
          const res = await fetch("/api/visitor-locale", { credentials: "same-origin" });
          data = await res.json();
        } catch {
          data = await fetchLocaleViaXhr();
        }
        const code = (data?.countryCode || "").toLowerCase();
        if (!code) return;
        try {
          sessionStorage.setItem("_visitorCountry", code);
        } catch {
          /* ignore */
        }
        applyDetectedCountry(code);
      } catch {
        /* silent — the "fr" default still applies */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const pathState = useMemo(() => computePathState(t, profile, animal), [t, profile, animal]);
  const program = pathState.programKey ? programs[pathState.programKey] : null;

  const sideCopyKey = sidePanelCopy[pathState.sideCopyKey] ? pathState.sideCopyKey : "default";
  const brandLbl = brandLabel(t, pathState.brandKey);
  const missionTitle = t(`sidePanelCopy.${sideCopyKey}.missionTitle`);
  const missionCopyText = t(`sidePanelCopy.${sideCopyKey}.missionCopy`, { brand: brandLbl });
  const missionTags = t(`sidePanelCopy.${sideCopyKey}.missionTags`, { returnObjects: true });
  const rewardTitle = t(`sidePanelCopy.${sideCopyKey}.rewardTitle`);
  const rewardCopyText = t(`sidePanelCopy.${sideCopyKey}.rewardCopy`, { brand: brandLbl });
  const rewardTags = t(`sidePanelCopy.${sideCopyKey}.rewardTags`, { returnObjects: true });

  const { score, priority } = useMemo(
    () => computeScore({ profile, animal, brandKey: pathState.brandKey, programKey: pathState.programKey, values, checks }),
    [profile, animal, pathState.brandKey, pathState.programKey, values, checks]
  );

  // Clears stale dynamic-field values (some field names are reused across
  // programs, e.g. "specialties") and the success/error banner whenever
  // profile or animal universe changes — the mockup gets both for free
  // since updatePath()/selectProgram() rebuild the dynamic fieldset's
  // innerHTML from scratch and call successMessage.classList.remove("show")
  // on every change. Done inline in the two onChange handlers below instead
  // of a useEffect so it doesn't trigger a second, avoidable render pass.
  function resetOnPathChange() {
    setSubmitMessage(null);
    setValues((prev) => {
      const next = { ...prev };
      dynamicFieldNames.forEach((name) => delete next[name]);
      return next;
    });
  }

  // In-page anchors (#apply, #process) — without this they jump instantly.
  useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = prev;
    };
  }, []);

  const setVal = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear that field's error the moment the user starts fixing it.
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  };
  const getVal = (name) => values[name] ?? "";

  // Validates the phone number's digit count and leading-digit pattern
  // against whichever country is currently selected — same
  // libphonenumber-js-backed check CheckOut.jsx and UserProfile.jsx use.
  // Returns true when valid.
  const validatePhone = () => {
    const code = getPhoneValidationErrorCode(getVal("phone"), phoneIso2 || "fr");
    setErrors((prev) => ({ ...prev, phone: code ? t(PHONE_ERROR_KEYS[code]) : "" }));
    return !code;
  };

  const togglePlatform = (checkName, relatedFieldNames) => (e) => {
    const active = e.target.checked;
    setChecks((prev) => ({ ...prev, [checkName]: active }));
    if (!active) {
      setValues((prev) => {
        const next = { ...prev };
        relatedFieldNames.forEach((n) => {
          next[n] = "";
        });
        return next;
      });
    }
  };

  const toggleConsent = (name) => (e) => setChecks((prev) => ({ ...prev, [name]: e.target.checked }));

  function renderDynamicField(field) {
    const req = field.required ? (
      <>
        {" "}
        <span className="req">*</span>
      </>
    ) : null;
    // No native `required` here — these are the "content creator detail"
    // fields (contact_detail1-5 on submit), custom-validated in
    // handleSubmit instead so they get the same red-border/message
    // treatment as every other required field on this form.
    const hasError = !!errors[field.name];
    const fieldBase = `programs.${pathState.programKey}.fields.${field.name}`;
    const fieldLabel = t(`${fieldBase}.label`);
    if (field.type === "select") {
      const options = t(`${fieldBase}.options`, { returnObjects: true });
      return (
        <div className={`field${hasError ? " has-error" : ""}`} key={field.name}>
          <label htmlFor={field.name}>
            {fieldLabel}
            {req}
          </label>
          <select
            id={field.name}
            name={field.name}
            data-export={field.name}
            value={getVal(field.name)}
            onChange={(e) => setVal(field.name, e.target.value)}
            style={hasError ? { borderColor: "#dc2626" } : undefined}
          >
            <option value="">{t("selectPlaceholder")}</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {hasError && (
            <p style={{ margin: "6px 0 0", color: "#dc2626", fontSize: "11px", lineHeight: 1.5, fontWeight: 600 }}>
              {errors[field.name]}
            </p>
          )}
        </div>
      );
    }
    return (
      <div className={`field${hasError ? " has-error" : ""}`} key={field.name}>
        <label htmlFor={field.name}>
          {fieldLabel}
          {req}
        </label>
        <input
          type={field.type}
          id={field.name}
          name={field.name}
          data-export={field.name}
          min={field.type === "number" ? 0 : undefined}
          inputMode={field.type === "number" ? "numeric" : undefined}
          value={getVal(field.name)}
          onChange={(e) => setVal(field.name, e.target.value)}
          style={hasError ? { borderColor: "#dc2626" } : undefined}
        />
        {hasError && (
          <p style={{ margin: "6px 0 0", color: "#dc2626", fontSize: "11px", lineHeight: 1.5, fontWeight: 600 }}>
            {errors[field.name]}
          </p>
        )}
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const selectedPlatforms = platformCheckNames.filter((name) => checks[name]).length;
    if (!selectedPlatforms) {
      setSubmitMessage({
        error: true,
        node: (
          <>
            <strong>{t("errors.platformRequiredTitle")}</strong>
            <br />
            {t("errors.platformRequiredBody")}
          </>
        ),
      });
      requestAnimationFrame(() => messageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }

    // Contact information + the active program's dynamic "detail" fields
    // (contact_detail1-5 on submit) are custom-validated so they get a red
    // border and message instead of the browser's native validation popup.
    const newErrors = {};
    if (!getVal("first_name").trim()) newErrors.first_name = t("errors.firstName");
    if (!getVal("last_name").trim()) newErrors.last_name = t("errors.lastName");
    if (!getVal("email").trim()) {
      newErrors.email = t("errors.emailRequired");
    } else if (!isValidEmail(getVal("email"))) {
      newErrors.email = t("errors.emailInvalid");
    }
    const phoneErrorCode = getPhoneValidationErrorCode(getVal("phone"), phoneIso2 || "fr");
    if (phoneErrorCode) newErrors.phone = t(PHONE_ERROR_KEYS[phoneErrorCode]);
    if (!getVal("country").trim()) newErrors.country = t("errors.country");
    if (!getVal("city").trim()) newErrors.city = t("errors.city");
    if (!getVal("postal_address").trim()) newErrors.postal_address = t("errors.postalAddress");

    (program?.fields || []).forEach((field) => {
      if (!getVal(field.name).trim()) {
        const fieldLabel = t(`programs.${pathState.programKey}.fields.${field.name}.label`).toLowerCase();
        newErrors[field.name] =
          field.type === "select"
            ? t("errors.selectFieldTemplate", { field: fieldLabel })
            : t("errors.enterFieldTemplate", { field: fieldLabel });
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitMessage(null);
      requestAnimationFrame(() => {
        document.querySelector(".field.has-error")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    const dialCode = getDialCodeByIso2(phoneIso2);
    // contact_detail1-5: the currently active program's own dynamic fields,
    // in order — most programs define exactly 5, matching the 5 backend
    // slots (a couple define 6 and get truncated to the first 5, a couple
    // define fewer and leave the trailing slots empty).
    const dynamicValues = (program?.fields || []).map((field) => getVal(field.name));
    const platformValue = (check, field) => (checks[check] ? getVal(field) : "");

    try {
      setIsSubmitting(true);
      const res = await fetch(`${BASE_URL}/app/ambassadors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: profile,
          pets: animal,
          first_name: getVal("first_name"),
          last_name: getVal("last_name"),
          email: getVal("email"),
          contact: `${dialCode}${getVal("phone")}`,
          city: getVal("city"),
          country: getVal("country"),
          postal_code: getVal("postal_address"),
          instagram_link: platformValue("has_instagram", "instagram_url"),
          instagram_follower: platformValue("has_instagram", "instagram_followers"),
          tiktok_link: platformValue("has_tiktok", "tiktok_url"),
          tiktok_follower: platformValue("has_tiktok", "tiktok_followers"),
          youtube_link: platformValue("has_youtube", "youtube_url"),
          youtube_follower: platformValue("has_youtube", "youtube_subscribers"),
          social_link: getVal("portfolio_link"),
          facebook_link: platformValue("has_facebook", "facebook_url"),
          facebook_follower: platformValue("has_facebook", "facebook_followers"),
          other_name: platformValue("has_other_platform", "other_platform_name"),
          other_link: platformValue("has_other_platform", "other_platform_url"),
          other_follower: platformValue("has_other_platform", "other_platform_followers"),
          contact_detail1: dynamicValues[0] || "",
          contact_detail2: dynamicValues[1] || "",
          contact_detail3: dynamicValues[2] || "",
          contact_detail4: dynamicValues[3] || "",
          contact_detail5: dynamicValues[4] || "",
        }),
      });
      const data = await res.json();
      if (data.status === false || data.status === "false" || !res.ok) {
        const msg =
          data.errors?.length > 0
            ? data.errors[0].message
            : data.action || data.title || t("errors.genericSubmit");
        toast.error(msg);
        return;
      }

      setShowSuccessModal(true);
      document.body.style.overflow = "hidden";
      setValues({});
      setChecks({
        has_instagram: false,
        has_tiktok: false,
        has_youtube: false,
        has_facebook: false,
        has_other_platform: false,
        content_usage_rights_accepted: false,
        contact_consent: false,
        information_accuracy: false,
      });
      setProfile("");
      setAnimal("");
      setErrors({});
    } catch (err) {
      console.error("Ambassador form error:", err);
      toast.error(t("errors.genericSubmit"));
    } finally {
      setIsSubmitting(false);
    }
  }

  const platforms = [
    { key: "instagram", check: "has_instagram", label: t("social.platforms.instagram.label"), urlField: "instagram_url", followersField: "instagram_followers", urlPlaceholder: t("social.platforms.instagram.urlPlaceholder"), followersPlaceholder: t("social.platforms.instagram.followersPlaceholder"), inputId: "instagram", followersId: "instagramFollowers" },
    { key: "tiktok", check: "has_tiktok", label: t("social.platforms.tiktok.label"), urlField: "tiktok_url", followersField: "tiktok_followers", urlPlaceholder: t("social.platforms.tiktok.urlPlaceholder"), followersPlaceholder: t("social.platforms.tiktok.followersPlaceholder"), inputId: "tiktok", followersId: "tiktokFollowers" },
    { key: "youtube", check: "has_youtube", label: t("social.platforms.youtube.label"), urlField: "youtube_url", followersField: "youtube_subscribers", urlPlaceholder: t("social.platforms.youtube.urlPlaceholder"), followersPlaceholder: t("social.platforms.youtube.followersPlaceholder"), inputId: "youtubeProfile", followersId: "youtubeSubscribers" },
    { key: "facebook", check: "has_facebook", label: t("social.platforms.facebook.label"), urlField: "facebook_url", followersField: "facebook_followers", urlPlaceholder: t("social.platforms.facebook.urlPlaceholder"), followersPlaceholder: t("social.platforms.facebook.followersPlaceholder"), inputId: "facebook", followersId: "facebookFollowers" },
    {
      key: "other",
      check: "has_other_platform",
      label: t("social.platforms.other.label"),
      nameField: "other_platform_name",
      urlField: "other_platform_url",
      followersField: "other_platform_followers",
      urlPlaceholder: t("social.platforms.other.urlPlaceholder"),
      followersPlaceholder: t("social.platforms.other.followersPlaceholder"),
      inputId: "otherPlatformUrl",
      followersId: "otherPlatformFollowers",
    },
  ];

  return (
    <>
      {/* Rendered outside .ambassador-landing on purpose: that wrapper sets
          its own font-family/color via CSS custom properties below, and
          since Navbar is a real child component (not styled-jsx-scoped
          content), those properties would otherwise inherit straight into
          Navbar's own text through normal CSS inheritance, overriding its
          intended site-wide styling. */}
      <Navbar bgWhite={true} />

      {showSuccessModal && (
        <div
          onClick={() => closeSuccessModal()}
          style={{
            position: "fixed", inset: 0, zIndex: 99999,
            background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px",
            animation: "smBackdropIn 0.3s ease both",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              maxWidth: "480px", width: "100%",
              position: "relative",
              animation: "smPopIn 0.4s cubic-bezier(0.34,1.45,0.64,1) both",
              overflow: "hidden",
            }}
          >
            <div style={{ height: "4px", background: "#111" }} />

            <div style={{ padding: "44px 40px 40px" }}>
              <div style={{
                width: "56px", height: "56px",
                border: "1px solid #111",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "28px",
              }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M3 11.5L8.5 17L19 6" stroke="#111" strokeWidth="1.8" strokeLinecap="square"/>
                </svg>
              </div>

              <p style={{ fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "#888", margin: "0 0 12px" }}>
                {t("successModal.eyebrow")}
              </p>
              <h2 style={{
                margin: "0 0 16px",
                fontSize: "clamp(28px,5vw,38px)",
                lineHeight: 1, letterSpacing: "-0.055em",
                fontWeight: 700, textTransform: "uppercase", color: "#111",
              }}>
                {t("successModal.titleLine1")}<br />{t("successModal.titleLine2")}
              </h2>
              <p style={{ margin: "0 0 32px", fontSize: "14px", lineHeight: 1.75, color: "#555" }}>
                {t("successModal.message")}
              </p>

              <div style={{
                borderTop: "1px solid #e8e8e4",
                paddingTop: "24px",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px",
              }}>
                <div style={{ padding: "16px", background: "#f8f8f6", borderLeft: "2px solid #111" }}>
                  <p style={{ margin: 0, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#888" }}>{t("successModal.nextStepLabel")}</p>
                  <p style={{ margin: "6px 0 0", fontSize: "12px", fontWeight: 600, color: "#111" }}>{t("successModal.nextStepValue")}</p>
                </div>
                <div style={{ padding: "16px", background: "#f8f8f6", borderLeft: "2px solid #111" }}>
                  <p style={{ margin: 0, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#888" }}>{t("successModal.responseTimeLabel")}</p>
                  <p style={{ margin: "6px 0 0", fontSize: "12px", fontWeight: 600, color: "#111" }}>{t("successModal.responseTimeValue")}</p>
                </div>
              </div>

              <button
                onClick={() => closeSuccessModal()}
                style={{
                  marginTop: "28px", width: "100%",
                  height: "48px", background: "#111", color: "#fff",
                  border: "none", cursor: "pointer",
                  fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase",
                  fontWeight: 700, fontFamily: "inherit",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#000"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#111"}
              >
                {t("successModal.close")}
              </button>
            </div>

            <style>{`
              @keyframes smBackdropIn { from { opacity: 0 } to { opacity: 1 } }
              @keyframes smPopIn { from { opacity: 0; transform: scale(0.88) translateY(16px) } to { opacity: 1; transform: scale(1) translateY(0) } }
            `}</style>
          </div>
        </div>
      )}

      <div className="ambassador-landing">
      <div className="ambassador-page-offset">
        <main className="page">
          <section className="hero" id="top">
            <div className="hero-copy">
              <div className="eyebrow">{t("hero.eyebrow")}</div>
              <h1 style={{ lineHeight: "1" }}>
                {t("hero.titleLine1")}
                <br />
                <span className="small-line">{t("hero.titleSmall")}</span> {t("hero.titleLine2")}
              </h1>
              <p>{t("hero.lead")}</p>
              <div className="hero-actions">
                <a className="btn dark" href="#apply">
                  {t("hero.startApplication")}
                </a>
                <a className="btn" href="#process">
                  {t("hero.howItWorks")}
                </a>
              </div>
            </div>
            <div className="hero-visual" aria-label="Biogance partner media">
              <AmbassadorHeaderSlider data={headerMedia} />
            </div>
          </section>

          <section className="section" id="process">
            <div className="wrap">
              <div className="section-head">
                <div>
                  <div className="kicker">{t("process.kicker")}</div>
                  <h2 style={{ lineHeight: "1" }}>
                    {t("process.titleLine1")}
                    <br />
                    {t("process.titleLine2")}
                    <br />
                    {t("process.titleLine3")}
                  </h2>
                </div>
                <p>{t("process.intro")}</p>
              </div>

              <div className="process-row">
                {t("process.steps", { returnObjects: true }).map((item) => (
                  <div className="process-step" key={item.step}>
                    <span>{item.step}</span>
                    <strong>{item.title}</strong>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="process-actions">
                <a className="btn dark" href="#apply">
                  {t("hero.startApplication")}
                </a>
              </div>
            </div>
          </section>

          <section className="section" id="apply">
            <div className="wrap">
              <div className="application-shell">
                <aside className="side-panel" aria-label="Partnership journey">
                  <div className="program-label">{t("sidePanel.label")}</div>
                  <h3>{pathState.sideTitle}</h3>
                  <p>{pathState.sideDescription}</p>
                  <div className="side-tags">
                    {pathState.sideTags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  <div className="export-panel">
                    <strong>{missionTitle}</strong>
                    <p>{missionCopyText}</p>
                    <div className="export-keys">
                      {missionTags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="export-panel">
                    <strong>{rewardTitle}</strong>
                    <p>{rewardCopyText}</p>
                    <div className="export-keys">
                      {rewardTags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </aside>

                <form className="form-card" onSubmit={handleSubmit}>
                  <input type="hidden" name="selected_brand" value={pathState.brandKey} readOnly />
                  <input type="hidden" name="partner_program" value={pathState.programKey} readOnly />
                  <input type="hidden" name="computed_score" value={score} readOnly />
                  <input type="hidden" name="computed_priority" value={priority} readOnly />

                  <div className="form-intro">
                    <div>
                      <h3>{pathState.formTitle}</h3>
                      <p>{pathState.formSubtitle}</p>
                    </div>
                  </div>

                  <fieldset className="application-path-fieldset">
                    <legend>{t("applicationPath.legend")}</legend>
                    <div className="form-grid">
                      <div className="field full">
                        <label htmlFor="profileSelect">
                          {t("applicationPath.profile.label")} <span className="req">*</span>
                        </label>
                        <select
                          id="profileSelect"
                          name="partnership_profile"
                          required
                          data-export="partnership_profile"
                          value={profile}
                          onChange={(e) => {
                            setProfile(e.target.value);
                            resetOnPathChange();
                          }}
                        >
                          <option value="">{t("applicationPath.profile.placeholder")}</option>
                          <option value="content_creator">{t("profileLabels.content_creator")}</option>
                          <option value="youtube">{t("profileLabels.youtube")}</option>
                          <option value="breeder">{t("profileLabels.breeder")}</option>
                          <option value="club">{t("profileLabels.club")}</option>
                          <option value="behaviourist">{t("profileLabels.behaviourist")}</option>
                          <option value="trainer">{t("profileLabels.trainer")}</option>
                          <option value="groomer">{t("profileLabels.groomer")}</option>
                          <option value="veterinarian">{t("profileLabels.veterinarian")}</option>
                          <option value="other">{t("profileLabels.other")}</option>
                        </select>
                        <div className="hint">{t("applicationPath.profile.hint")}</div>
                      </div>
                      <div className="field full">
                        <label htmlFor="animalSelect">
                          {t("applicationPath.animal.label")} <span className="req">*</span>
                        </label>
                        <select
                          id="animalSelect"
                          name="animal_universe"
                          required
                          data-export="animal_universe"
                          value={animal}
                          onChange={(e) => {
                            setAnimal(e.target.value);
                            resetOnPathChange();
                          }}
                        >
                          <option value="">{t("applicationPath.animal.placeholder")}</option>
                          <option value="dog">{t("animalLabels.dog")}</option>
                          <option value="cat">{t("animalLabels.cat")}</option>
                          <option value="small_mammal">{t("animalLabels.small_mammal")}</option>
                          <option value="bird">{t("animalLabels.bird")}</option>
                          <option value="reptile">{t("animalLabels.reptile")}</option>
                          <option value="horse">{t("animalLabels.horse")}</option>
                          <option value="all">{t("animalLabels.all")}</option>
                        </select>
                        <div className="hint">{t("applicationPath.animal.hint")}</div>
                        <div className="derived-universe">{pathState.derivedUniverseText}</div>
                      </div>
                      <div className="path-note">{pathState.pathNote}</div>
                    </div>
                  </fieldset>

                  <fieldset className={pathState.visible ? undefined : "is-hidden"}>
                    <legend>{t("contact.legend")}</legend>
                    <div className="form-grid">
                      <div className={`field${errors.first_name ? " has-error" : ""}`}>
                        <label htmlFor="firstName">
                          {t("contact.firstName")} <span className="req">*</span>
                        </label>
                        <input
                          id="firstName"
                          name="first_name"
                          type="text"
                          autoComplete="given-name"
                          data-export="first_name"
                          value={getVal("first_name")}
                          onChange={(e) => setVal("first_name", e.target.value)}
                        />
                        {errors.first_name && <p className="field-error">{errors.first_name}</p>}
                      </div>
                      <div className={`field${errors.last_name ? " has-error" : ""}`}>
                        <label htmlFor="lastName">
                          {t("contact.lastName")} <span className="req">*</span>
                        </label>
                        <input
                          id="lastName"
                          name="last_name"
                          type="text"
                          autoComplete="family-name"
                          data-export="last_name"
                          value={getVal("last_name")}
                          onChange={(e) => setVal("last_name", e.target.value)}
                        />
                        {errors.last_name && <p className="field-error">{errors.last_name}</p>}
                      </div>
                      <div className={`field${errors.email ? " has-error" : ""}`}>
                        <label htmlFor="email">
                          {t("contact.email")} <span className="req">*</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          data-export="email"
                          value={getVal("email")}
                          onChange={(e) => setVal("email", e.target.value)}
                        />
                        {errors.email && <p className="field-error">{errors.email}</p>}
                      </div>
                      <div className={`field${errors.phone ? " has-error" : ""}`}>
                        <label htmlFor="phone">
                          {t("contact.phone")} <span className="req">*</span>
                        </label>
                        <PhoneFieldBox
                          iso2={phoneIso2}
                          onCountryChange={(iso2) => {
                            phoneCountryEditedRef.current = true;
                            setPhoneIso2(iso2);
                            setErrors((prev) => (prev.phone ? { ...prev, phone: "" } : prev));
                          }}
                          value={getVal("phone")}
                          onChange={(phone) => setVal("phone", phone)}
                          onBlur={validatePhone}
                        />
                        {errors.phone && <p className="field-error">{errors.phone}</p>}
                      </div>
                      <div className={`field${errors.country ? " has-error" : ""}`}>
                        <label htmlFor="country">
                          {t("contact.country")} <span className="req">*</span>
                        </label>
                        <input
                          id="country"
                          name="country"
                          type="text"
                          autoComplete="country-name"
                          data-export="country"
                          value={getVal("country")}
                          onChange={(e) => setVal("country", e.target.value)}
                        />
                        {errors.country && <p className="field-error">{errors.country}</p>}
                      </div>
                      <div className={`field${errors.city ? " has-error" : ""}`}>
                        <label htmlFor="city">
                          {t("contact.city")} <span className="req">*</span>
                        </label>
                        <input
                          id="city"
                          name="city"
                          type="text"
                          autoComplete="address-level2"
                          data-export="city"
                          value={getVal("city")}
                          onChange={(e) => setVal("city", e.target.value)}
                        />
                        {errors.city && <p className="field-error">{errors.city}</p>}
                      </div>
                      <div className={`field full${errors.postal_address ? " has-error" : ""}`}>
                        <label htmlFor="address">
                          {t("contact.postalAddress")} <span className="req">*</span>
                        </label>
                        <input
                          id="address"
                          name="postal_address"
                          type="text"
                          autoComplete="street-address"
                          data-export="postal_address"
                          value={getVal("postal_address")}
                          onChange={(e) => setVal("postal_address", e.target.value)}
                        />
                        {errors.postal_address && <p className="field-error">{errors.postal_address}</p>}
                        <div className="hint">{t("contact.postalAddressHint")}</div>
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className={pathState.visible ? undefined : "is-hidden"}>
                    <legend>{t("social.legend")}</legend>
                    <div className="form-grid">
                      <div className="platform-intro">{t("social.intro")}</div>
                      <div className="platform-grid">
                        {platforms.map((platform) => {
                          const active = checks[platform.check];
                          return (
                            <div className={`platform-card${active ? " is-active" : ""}`} key={platform.key}>
                              <div className="platform-head">
                                <input
                                  id={`has-${platform.key}`}
                                  name={platform.check}
                                  type="checkbox"
                                  data-export={platform.check}
                                  checked={active}
                                  onChange={togglePlatform(
                                    platform.check,
                                    [platform.nameField, platform.urlField, platform.followersField].filter(Boolean)
                                  )}
                                />
                                <label htmlFor={`has-${platform.key}`}>{platform.label}</label>
                              </div>
                              <div className="platform-fields" hidden={!active}>
                                {platform.nameField && (
                                  <input
                                    id="otherPlatformName"
                                    name={platform.nameField}
                                    type="text"
                                    placeholder={t("social.otherNamePlaceholder")}
                                    data-export={platform.nameField}
                                    disabled={!active}
                                    required={active}
                                    value={getVal(platform.nameField)}
                                    onChange={(e) => setVal(platform.nameField, e.target.value)}
                                  />
                                )}
                                <input
                                  id={platform.inputId}
                                  name={platform.urlField}
                                  type="url"
                                  placeholder={platform.urlPlaceholder}
                                  data-export={platform.urlField}
                                  disabled={!active}
                                  required={active}
                                  value={getVal(platform.urlField)}
                                  onChange={(e) => setVal(platform.urlField, e.target.value)}
                                />
                                <input
                                  id={platform.followersId}
                                  name={platform.followersField}
                                  type="number"
                                  min="0"
                                  inputMode="numeric"
                                  placeholder={platform.followersPlaceholder}
                                  data-score="platform_followers"
                                  data-export={platform.followersField}
                                  disabled={!active}
                                  required={active}
                                  value={getVal(platform.followersField)}
                                  onChange={(e) => setVal(platform.followersField, e.target.value)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className={pathState.visible ? undefined : "is-hidden"}>
                    <legend>{pathState.dynamicLegend}</legend>
                    <div className="form-grid">{program?.fields.map((field) => renderDynamicField(field))}</div>
                  </fieldset>

                  <fieldset className={pathState.visible ? undefined : "is-hidden"}>
                    <legend>{t("consentSection.legend")}</legend>
                    <div className="form-grid">
                      <div className="field full">
                        <label htmlFor="portfolio">{t("consentSection.portfolioLabel")}</label>
                        <input
                          id="portfolio"
                          name="portfolio_link"
                          type="url"
                          placeholder="https://..."
                          data-score="portfolio"
                          data-export="portfolio_link"
                          value={getVal("portfolio_link")}
                          onChange={(e) => setVal("portfolio_link", e.target.value)}
                        />
                        <div className="hint">{t("consentSection.portfolioHint")}</div>
                      </div>
                      <div className="field full">
                        <div className="checkbox-row">
                          <input
                            id="rights"
                            name="content_usage_rights_accepted"
                            type="checkbox"
                            required
                            data-score="rights"
                            data-export="content_usage_rights_accepted"
                            checked={checks.content_usage_rights_accepted}
                            onChange={toggleConsent("content_usage_rights_accepted")}
                          />
                          <label htmlFor="rights">{t("consentSection.rights")}</label>
                        </div>
                        <div className="checkbox-row">
                          <input
                            id="contactConsent"
                            name="contact_consent"
                            type="checkbox"
                            required
                            data-export="contact_consent"
                            checked={checks.contact_consent}
                            onChange={toggleConsent("contact_consent")}
                          />
                          <label htmlFor="contactConsent">{t("consentSection.contact")}</label>
                        </div>
                        <div className="checkbox-row">
                          <input
                            id="truth"
                            name="information_accuracy"
                            type="checkbox"
                            required
                            data-export="information_accuracy"
                            checked={checks.information_accuracy}
                            onChange={toggleConsent("information_accuracy")}
                          />
                          <label htmlFor="truth">{t("consentSection.truth")}</label>
                        </div>
                      </div>
                    </div>
                  </fieldset>

                  <div className="form-actions" style={{ display: pathState.visible ? "flex" : "none" }}>
                    <button className="btn dark" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? t("actions.submitting") : t("actions.submit")}
                    </button>
                  </div>
                  <div ref={messageRef} className={`success-message${submitMessage ? " show" : ""}`}>
                    {submitMessage?.node}
                  </div>
                </form>
              </div>
            </div>
          </section>

          <section className="social-strip" aria-label="Follow Biogance">
            <div className="social-copy">
              <div className="kicker">{t("socialStrip.kicker")}</div>
              <h2 style={{ lineHeight: "1" }}>{t("socialStrip.title")}</h2>
              <p>{t("socialStrip.text")}</p>
            </div>
            <div className="social-actions">
              <a className="btn" href="https://www.instagram.com/bioganceofficiel" target="_blank" rel="noopener noreferrer">
                {t("socialStrip.instagram")}
              </a>
              <a className="btn" href="https://www.facebook.com/bioganceofficiel" target="_blank" rel="noopener noreferrer">
                {t("socialStrip.facebook")}
              </a>
              <a className="btn" href="https://youtube.com/@bioganceofficiel?si=IJV8iaJ1YTgSos8z" target="_blank" rel="noopener noreferrer">
                {t("socialStrip.youtube")}
              </a>
              <a className="btn" href="https://www.tiktok.com/@bioganceofficiel" target="_blank" rel="noopener noreferrer">
                {t("socialStrip.tiktok")}
              </a>
            </div>
          </section>
        </main>
      </div>

      <Footer />

      <style jsx>{`
        .ambassador-landing {
          --black: #111111;
          --ink: #1d1d1d;
          --charcoal: #2a2a2a;
          --white: #ffffff;
          --paper: #f8f8f6;
          --soft: #f1f1ee;
          --soft-2: #e9e9e5;
          --line: #d7d7d3;
          --line-soft: #e7e7e2;
          --muted: #707070;
          --muted-2: #9a9a9a;
          --sage: #edf1eb;
          --green: #5d7a62;
          --max: 1440px;
          --sans: Arial, Helvetica, sans-serif;

          /* fixed navbar height + the equal breathing room used above and
             below the pinned side panel */
          --nav-h: 104px;
          --pin-gap: 24px;

          margin: 0;
          /* IMPORTANT: clip, not hidden. overflow-x: hidden silently computes
             overflow-y to auto, which turns this element into a scroll
             container — and position: sticky always sticks against its
             nearest scroll container, so the pinned .side-panel below would
             stick to a box that never scrolls (i.e. appear not to stick at
             all). overflow-x: clip suppresses horizontal overflow the same
             way without creating a scroll container. */
          overflow-x: clip;
          font-family: var(--sans);
          color: var(--ink);
          background: var(--paper);
          letter-spacing: -0.01em;
          -webkit-font-smoothing: antialiased;
          text-rendering: geometricPrecision;
        }
        .ambassador-landing,
        .ambassador-landing :global(*) {
          box-sizing: border-box;
        }
        .ambassador-landing :global(a) {
          color: inherit;
          text-decoration: none;
        }
        .ambassador-landing :global(p),
        .ambassador-landing :global(h1),
        .ambassador-landing :global(h2),
        .ambassador-landing :global(h3) {
          margin-top: 0;
        }
        .ambassador-landing :global(img) {
          display: block;
          max-width: 100%;
        }
        .ambassador-landing :global(button),
        .ambassador-landing :global(input),
        .ambassador-landing :global(select) {
          font: inherit;
        }

        /* Navbar is fixed (104px desktop / 64px mobile) — same offset used
           across the rest of the site (see ProSection.jsx / ExpertAdvicesDetail.jsx). */
        .ambassador-page-offset {
          padding-top: 104px;
        }
        @media (max-width: 1023px) {
          .ambassador-page-offset {
            padding-top: 64px;
          }
        }
        #process,
        #apply {
          scroll-margin-top: 104px;
        }
        @media (max-width: 1023px) {
          #process,
          #apply {
            scroll-margin-top: 64px;
          }
        }

        .page {
          min-height: 100vh;
        }
        .wrap {
          max-width: var(--max);
          margin: 0 auto;
          padding: 0 24px;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 28px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.26em;
          color: var(--muted);
        }
        .eyebrow::before {
          content: "";
          width: 48px;
          height: 1px;
          background: var(--ink);
          display: block;
        }

        .hero {
          min-height: calc(100vh - 72px);
          display: grid;
          grid-template-columns: minmax(0, 1.03fr) minmax(420px, 0.97fr);
          border-bottom: 1px solid var(--line);
          background: var(--paper);
        }
        .hero-copy {
          padding: 70px clamp(26px, 6vw, 112px) 70px clamp(24px, 6vw, 100px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
        }
        .hero-copy :global(h1) {
          margin: 0;
          max-width: 760px;
          font-size: clamp(56px, 8vw, 128px);
          line-height: 0.86;
          letter-spacing: -0.095em;
          text-transform: uppercase;
          font-weight: 500;
          color: var(--ink);
        }
        .hero-copy :global(.small-line) {
          display: block;
          font-size: 0.72em;
        }
        .hero-copy :global(p) {
          max-width: 610px;
          margin: 30px 0 0;
          color: var(--charcoal);
          font-size: 16px;
          line-height: 1.75;
        }
        .hero-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 32px;
        }
        .btn {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 30px;
          border: 1px solid var(--ink);
          background: transparent;
          color: var(--ink);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: 0.25s ease;
          white-space: nowrap;
        }
        .btn.dark {
          background: var(--ink);
          color: var(--white);
        }
        .btn:hover {
          transform: translateY(-1px);
          background: var(--ink);
          color: var(--white);
        }
        .btn.dark:hover {
          background: #000;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .btn.dark:disabled:hover {
          background: var(--ink);
        }
        .btn.soft {
          background: var(--white);
        }

        .hero-visual {
          position: relative;
          border-left: 1px solid var(--line);
          background: radial-gradient(circle at 36% 20%, rgba(255, 255, 255, 0.86), transparent 32%),
            radial-gradient(circle at 74% 72%, rgba(120, 130, 110, 0.14), transparent 35%), linear-gradient(135deg, #efefed 0%, #dadad5 100%);
          overflow: hidden;
          min-height: 620px;
        }
        .hero-visual::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.55), transparent 54%);
          mix-blend-mode: screen;
        }
        /* .hero-card is unused in the mockup's own body markup (superseded
           by .hero-video-frame) — kept for a 1:1 CSS port regardless. */
        .hero-card {
          position: absolute;
          left: 9%;
          right: 9%;
          bottom: 11%;
          padding: 34px;
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.08);
        }
        .hero-card :global(.number) {
          font-size: 80px;
          line-height: 0.82;
          letter-spacing: -0.08em;
          margin-bottom: 22px;
          color: var(--ink);
        }
        .hero-card :global(p) {
          font-size: 13px;
          line-height: 1.7;
          margin: 0;
          color: var(--muted);
        }

        .section {
          padding: 86px 0;
          border-bottom: 1px solid var(--line);
        }
        .section-head {
          display: grid;
          grid-template-columns: minmax(270px, 0.44fr) minmax(0, 0.56fr);
          gap: 60px;
          margin-bottom: 46px;
          align-items: end;
        }
        .kicker {
          font-size: 10px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 18px;
        }
        .section :global(h2) {
          margin: 0;
          max-width: 700px;
          font-weight: 500;
          text-transform: uppercase;
          font-size: clamp(34px, 5.4vw, 88px);
          line-height: 0.92;
          letter-spacing: -0.075em;
        }
        .section-head :global(p) {
          margin: 0;
          color: var(--muted);
          font-size: 15px;
          line-height: 1.8;
          max-width: 650px;
        }

        .process-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          border: 1px solid var(--line);
          background: var(--white);
          margin-bottom: 46px;
        }
        .process-step {
          padding: 26px;
          border-right: 1px solid var(--line-soft);
        }
        .process-step:hover {
          background: black;
          color: white;
          cursor: pointer;
        }
          .process-step:hover span,
.process-step:hover strong,
.process-step:hover p {
  color: #fff !important;
}
        .process-step:last-child {
          border-right: 0;
        }
        .process-step :global(span) {
          display: block;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted-2);
          margin-bottom: 16px;
        }
        .process-step :global(strong) {
          display: block;
          font-size: 17px;
          letter-spacing: -0.035em;
          text-transform: uppercase;
          margin-bottom: 8px;
          font-weight: 500;
        }
        .process-step :global(p) {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.6;
        }
        .process-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 24px;
        }

        /* ── PINNED APPLICATION SECTION ───────────────────────────────── */
        .application-shell {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 390px;
          gap: 28px;
          align-items: start;
        }
        .side-panel {
          position: sticky;
          top: calc(var(--nav-h) + var(--pin-gap));
          /* Same --pin-gap breathing room at the bottom as the top offset
             above uses, so the pinned card never presses flush against the
             bottom of the screen. Content taller than that available space
             scrolls inside the card itself (overscroll-behavior: contain
             stops that inner scroll from leaking into the page once it
             hits its own top/bottom edge). */
          max-height: calc(100vh - var(--nav-h) - (var(--pin-gap) * 2));
          overflow-y: auto;
          overscroll-behavior: contain;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
          background: var(--ink);
          color: var(--white);
          padding: 30px;
          order: 2;
        }
        .side-panel::-webkit-scrollbar {
          width: 3px;
        }
        .side-panel::-webkit-scrollbar-track {
          background: transparent;
        }
        .side-panel::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.25);
          border-radius: 999px;
        }
        .side-panel::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        .side-panel .program-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.24em;
          color: rgba(255, 255, 255, 0.58);
          margin-bottom: 34px;
        }
        .side-panel :global(h3) {
          margin: 0;
          font-size: 42px;
          line-height: 0.93;
          letter-spacing: -0.07em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .side-panel :global(p) {
          font-size: 13px;
          line-height: 1.75;
          color: rgba(255, 255, 255, 0.72);
          margin: 22px 0 0;
        }
        .side-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 24px;
        }
        .side-tags :global(span) {
          display: inline-flex;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.72);
        }
        /* .score-card/.meter are unused in the mockup's own body markup —
           the mission/reward .export-panel blocks replaced them — kept
           here for a 1:1 CSS port regardless. */
        .score-card {
          margin-top: 34px;
          padding: 22px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
        }
        .score-row {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 16px;
        }
        .score-row :global(b) {
          font-size: 42px;
          line-height: 1;
          letter-spacing: -0.06em;
          font-weight: 500;
        }
        .score-row :global(span) {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: rgba(255, 255, 255, 0.58);
        }
        .meter {
          height: 6px;
          background: rgba(255, 255, 255, 0.18);
          overflow: hidden;
        }
        .meter :global(span) {
          display: block;
          height: 100%;
          width: 0;
          background: var(--white);
          transition: 0.4s ease;
        }
        .score-label {
          margin-top: 14px;
          font-size: 12px;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.75);
        }

        .export-panel {
          margin-top: 18px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.14);
          display: grid;
          gap: 12px;
        }
        .export-panel :global(strong) {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.17em;
          margin-bottom: 4px;
        }
        .export-panel :global(p) {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.68);
          line-height: 1.6;
          margin: 0;
        }
        .export-keys {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 5px;
        }
        .export-keys :global(span) {
          display: inline-flex;
          color: rgba(255, 255, 255, 0.72);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .form-card {
          background: var(--white);
          border: 1px solid var(--line);
          padding: 30px;
          order: 1;
          /* guarantees there is always enough travel for the panel to stay
             pinned through the full section rather than un-sticking early */
          min-height: calc(100vh - var(--nav-h) - (var(--pin-gap) * 2));
        }
        .form-intro {
          display: block;
          padding-bottom: 26px;
          border-bottom: 1px solid var(--line-soft);
          margin-bottom: 28px;
        }
        .form-intro :global(h3) {
          margin: 0 0 8px;
          font-size: 30px;
          line-height: 1.05;
          letter-spacing: -0.045em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .form-intro :global(p) {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.65;
        }

        /* .selector-board/.selector-card are unused in the mockup's own
           body markup (the two <select> path fields replaced them) — kept
           here for a 1:1 CSS port regardless. */
        .selector-board {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 32px;
        }
        .selector-card {
          border: 1px solid var(--line-soft);
          background: var(--paper);
          padding: 22px;
          min-height: 156px;
          transition: 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .selector-card.active {
          border-color: var(--ink);
          background: #151515;
          color: #fff;
        }
        .selector-card.active :global(p),
        .selector-card.active :global(.select-label) {
          color: rgba(255, 255, 255, 0.68);
        }
        .selector-card :global(.select-label) {
          font-size: 10px;
          letter-spacing: 0.19em;
          text-transform: uppercase;
          color: var(--muted);
          display: block;
          margin-bottom: 14px;
        }
        .selector-card :global(h4) {
          margin: 0 0 10px;
          font-size: 22px;
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: -0.045em;
          font-weight: 500;
        }
        .selector-card :global(p) {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.65;
        }

        .ambassador-landing :global(fieldset) {
          border: 0;
          padding: 0;
          margin: 0 0 32px;
        }
        .ambassador-landing :global(fieldset.is-hidden) {
          display: none;
        }
        .ambassador-landing :global(legend) {
          width: 100%;
          padding: 0 0 16px;
          margin: 0 0 18px;
          border-bottom: 1px solid var(--line-soft);
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ink);
          font-weight: 700;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }
        .field.full {
          grid-column: 1 / -1;
        }
        .field :global(label) {
          font-size: 11px;
          line-height: 1.4;
          text-transform: uppercase;
          letter-spacing: 0.13em;
          color: var(--muted);
        }
        .ambassador-landing :global(.req) {
          color: var(--ink);
          font-weight: 700;
        }
        .ambassador-landing :global(input),
        .ambassador-landing :global(select) {
          width: 100%;
          border: 1px solid var(--line);
          background: var(--paper);
          color: var(--ink);
          min-height: 50px;
          padding: 0 14px;
          outline: none;
          transition: 0.2s ease;
          border-radius: 0;
        }
        .ambassador-landing :global(select) {
          appearance: auto;
        }
        .ambassador-landing :global(input:focus),
        .ambassador-landing :global(select:focus) {
          border-color: var(--ink);
          background: var(--white);
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.04);
        }
        /* keeps a focused / autofilled field from landing under the fixed
           navbar when the browser scrolls it into view */
        .ambassador-landing :global(input),
        .ambassador-landing :global(select) {
          scroll-margin-top: calc(var(--nav-h) + var(--pin-gap));
          scroll-margin-bottom: var(--pin-gap);
        }

        /* PhoneFieldBox (same flag/dial-code dropdown behaviour as
           UserProfile.jsx) sits inside a .field, so the generic ".field
           input" rules above would otherwise stamp their own border/
           background/padding onto its two inputs. Re-declared after those
           rules (same specificity, so source order decides) — using the
           same var(--paper)/var(--line) tokens as every other field here,
           so the phone box matches the rest of the form instead of
           standing out with Tailwind's gray palette. */
        .field :global(.phone-field-box) {
          width: 100%;
          min-height: 48px;
          padding: 0;
          border: 1px solid var(--line);
          background: var(--paper);
          transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
        }
        .field :global(.phone-field-box:focus-within) {
          border-color: var(--ink);
          background: var(--white);
          box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.045);
        }
        .field :global(.phone-country-button) {
          border-right: 1px solid var(--line);
          color: var(--ink);
        }
        .field :global(.phone-country-button:hover) {
          background: var(--soft);
        }
        .field :global(.phone-number-input),
        .field :global(.phone-number-input:focus) {
          border: 0;
          background: transparent;
          min-height: 46px;
          padding: 0 16px;
          font-size: 13px;
          color: var(--ink);
          box-shadow: none;
        }
        .field :global(.phone-search-input),
        .field :global(.phone-search-input:focus) {
          border: 1px solid var(--line);
          background: var(--paper);
          min-height: 0;
          padding: 8px 12px;
          font-size: 13px;
          color: var(--ink);
          box-shadow: none;
        }

        /* Required-field validation state — a field goes red the moment its
           submit-time error is set, and clears on the next edit.
           !important on both: the border/color rules earlier in this same
           block (.ambassador-landing :global(input/select), .field
           :global(label) etc.) are declared with the same or higher
           specificity, so a plain override here was silently losing to
           them regardless of source order. */
        .field.has-error :global(input),
        .field.has-error :global(select),
        .field.has-error :global(.phone-field-box) {
          border-color: #dc2626 !important;
        }
        .field-error {
          margin: 6px 0 0 !important;
          color: #dc2626 !important;
          font-size: 11px !important;
          line-height: 1.5 !important;
          font-weight: 600 !important;
          text-transform: none !important;
          letter-spacing: normal !important;
        }

        .hint {
          font-size: 11px;
          color: var(--muted-2);
          line-height: 1.55;
        }
        .field[data-disabled="true"] {
          opacity: 0.45;
          pointer-events: none;
        }

        .checkbox-row {
          display: grid;
          grid-template-columns: 20px minmax(0, 1fr);
          gap: 10px;
          align-items: start;
          padding: 13px 0;
          border-bottom: 1px solid var(--line-soft);
        }
        .checkbox-row :global(input) {
          width: 16px;
          height: 16px;
          min-height: auto;
          margin-top: 2px;
          accent-color: var(--ink);
        }
        .checkbox-row :global(label) {
          font-size: 13px;
          line-height: 1.55;
          color: var(--charcoal);
          letter-spacing: 0;
          text-transform: none;
        }

        .platform-intro {
          grid-column: 1 / -1;
          padding: 18px 20px;
          border: 1px solid var(--line-soft);
          background: var(--paper);
          color: var(--muted);
          font-size: 13px;
          line-height: 1.65;
        }
        .platform-grid {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .platform-card {
          border: 1px solid var(--line-soft);
          background: var(--paper);
          padding: 18px;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .platform-card.is-active {
          border-color: var(--ink);
          background: var(--white);
        }
        .platform-head {
          display: grid;
          grid-template-columns: 20px minmax(0, 1fr);
          gap: 10px;
          align-items: start;
        }
        .platform-head :global(input) {
          width: 16px;
          height: 16px;
          min-height: auto;
          margin-top: 2px;
          accent-color: var(--ink);
        }
        .platform-head :global(label) {
          font-size: 12px;
          line-height: 1.35;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--ink);
          cursor: pointer;
        }
        .platform-fields {
          display: grid;
          gap: 12px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--line-soft);
        }
        .platform-fields[hidden] {
          display: none;
        }
        .platform-fields :global(input) {
          min-height: 44px;
          background: var(--white);
        }

        /* .dynamic-note styles the "note" field type — no program in the
           mockup's own data actually uses a note field, but the CSS (and
           the renderField() branch it belongs to) is ported 1:1 regardless. */
        .dynamic-note {
          grid-column: 1 / -1;
          padding: 18px 20px;
          border: 1px solid var(--line-soft);
          background: var(--paper);
          font-size: 13px;
          color: var(--muted);
          line-height: 1.6;
        }
        .form-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          align-items: center;
          padding-top: 24px;
          border-top: 1px solid var(--line-soft);
        }
        .success-message {
          display: none;
          margin-top: 20px;
          padding: 20px;
          border: 1px solid var(--ink);
          background: var(--paper);
          font-size: 13px;
          line-height: 1.65;
          scroll-margin-top: calc(var(--nav-h) + var(--pin-gap));
        }
        .success-message.show {
          display: block;
        }

        .social-strip {
          width: calc(100% - 48px);
          max-width: var(--max);
          margin: 96px auto;
          display: grid;
          grid-template-columns: minmax(0, 0.58fr) minmax(360px, 0.42fr);
          background: var(--white);
          color: var(--ink);
          border: 1px solid var(--line);
          box-shadow: 0 34px 90px rgba(0, 0, 0, 0.045);
          position: relative;
          overflow: hidden;
        }
        .social-strip::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 5px;
          background: var(--ink);
        }
        .social-copy {
          padding: 64px clamp(24px, 5vw, 78px);
        }
        .social-copy :global(h2) {
          font-size: clamp(40px, 5.7vw, 86px);
          line-height: 0.9;
          letter-spacing: -0.08em;
          font-weight: 500;
          text-transform: uppercase;
          margin: 0;
        }
        .social-copy :global(p) {
          max-width: 660px;
          margin: 24px 0 0;
          color: var(--muted);
          line-height: 1.75;
          font-size: 15px;
        }
        .social-actions {
          border-left: 1px solid var(--line-soft);
          padding: 64px 34px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          align-content: center;
          gap: 14px;
          background: linear-gradient(135deg, #fbfbfa, #f0f0ec);
        }
        .social-actions :global(a) {
          width: 100%;
          border-color: var(--line);
          background: var(--white);
          color: var(--ink);
          padding: 0 16px;
        }
        .social-actions :global(a:hover) {
          background: var(--ink);
          color: #fff;
          border-color: var(--ink);
        }

        :global(.hero-video-frame) {
          position: absolute;
          inset: clamp(24px, 4vw, 62px);
          border: 1px solid rgba(17, 17, 17, 0.14);
          background: #111;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.08);
        }
        :global(.hero-video-frame video),
        :global(.hero-video-frame img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          background: linear-gradient(135deg, #e8e8e4, #cfcfca);
        }
        @keyframes ambassador-media-spin {
          to {
            transform: rotate(360deg);
          }
        }
        :global(.hero-video-frame::before) {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.34));
          pointer-events: none;
          z-index: 1;
        }
        :global(.video-nav) {
          position: absolute;
          inset: 0;
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(16px, 3vw, 34px);
          pointer-events: none;
        }
        :global(.video-arrow) {
          width: 58px;
          height: 58px;
          border: 1px solid rgba(255, 255, 255, 0.78);
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(255, 255, 255, 0.1);
          color: var(--white);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.12);
          font-size: 28px;
          line-height: 1;
          letter-spacing: 0;
          transition: all 0.25s ease;
          cursor: pointer;
          pointer-events: auto;
          user-select: none;
        }
        :global(.video-arrow::before) {
          display: block;
          transform: translateY(-1px);
        }
        :global(.video-arrow.left::before) {
          content: "←";
        }
        :global(.video-arrow.right::before) {
          content: "→";
        }
        :global(.video-arrow:hover) {
          background: rgba(255, 255, 255, 0.35);
          transform: scale(1.06);
        }
        :global(.video-arrow:active) {
          transform: scale(0.94);
        }
        :global(.dots-indicator-container) {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 8px;
          pointer-events: auto;
        }
        :global(.dot-indicator) {
          padding: 0;
          margin: 0;
          border: none;
          outline: none;
          cursor: pointer;
          height: 10px;
          width: 10px;
          border-radius: 999px;
          background-color: rgba(81, 79, 79, 0.4);
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        :global(.dot-indicator:hover) {
          background-color: rgba(0, 0, 0, 0.75);
        }
        :global(.dot-indicator.active) {
          width: 24px;
          background-color: #000000;
          border-radius: 999px;
        }

        .application-path-fieldset {
          padding-bottom: 8px;
        }
        .path-note {
          grid-column: 1 / -1;
          margin-top: 2px;
          padding: 16px 18px;
          border: 1px solid var(--line-soft);
          background: var(--paper);
          color: var(--muted);
          font-size: 12px;
          line-height: 1.65;
        }
        .derived-universe {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--muted);
          margin-top: 6px;
        }

        @media (max-width: 1180px) {
          .hero {
            grid-template-columns: 1fr;
          }
          .hero-visual {
            min-height: 420px;
            border-left: 0;
            border-top: 1px solid var(--line);
          }
          .application-shell {
            grid-template-columns: 1fr;
          }
          /* stacked layout — no pin, panel flows under the form */
          .side-panel {
            order: 2;
            position: relative;
            top: auto;
          }
          .form-card {
            order: 1;
            min-height: 0;
          }
        }
        @media (max-width: 1023px) {
          .ambassador-landing {
            --nav-h: 64px;
          }
        }
        @media (max-width: 860px) {
          .hero-copy {
            padding: 54px 24px;
          }
          .hero-copy :global(h1) {
            font-size: clamp(32px, 11vw, 68px);
          }
          .section {
            padding: 62px 0;
          }
          .section-head {
            grid-template-columns: 1fr;
            gap: 22px;
          }
          .process-row {
            grid-template-columns: 1fr;
          }
          .process-step {
            border-right: 0;
            border-bottom: 1px solid var(--line-soft);
          }
          .process-step:last-child {
            border-bottom: 0;
          }
          .selector-board,
          .form-grid,
          .platform-grid {
            grid-template-columns: 1fr;
          }
          .form-intro {
            grid-template-columns: 1fr;
          }
          .social-strip {
            grid-template-columns: 1fr;
          }
          .social-actions {
            border-left: 0;
            border-top: 1px solid var(--line-soft);
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 560px) {
          .social-strip {
            width: calc(100% - 28px);
            margin: 58px auto;
          }
          .social-actions {
            grid-template-columns: 1fr;
          }
          .btn {
            width: 100%;
          }
          .hero-card {
            left: 20px;
            right: 20px;
            bottom: 20px;
            padding: 24px;
          }
          .hero-video-frame {
            inset: 20px;
          }
          .video-nav {
            padding: 0 18px;
          }
          .video-arrow {
            width: 48px;
            height: 48px;
            font-size: 24px;
          }
        }
      `}</style>
      </div>
    </>
  );
}