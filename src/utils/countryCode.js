import { parseCountry, defaultCountries } from "react-international-phone";

// Common abbreviations/aliases users type into free-text country fields
// that don't match react-international-phone's iso2 code or official
// country name directly (e.g. "UK" instead of "United Kingdom").
export const COUNTRY_ALIASES = {
  uk: "gb",
  "u.k.": "gb",
  "united kingdom": "gb",
  usa: "us",
  "u.s.a.": "us",
  "u.s.": "us",
  "united states of america": "us",
  uae: "ae",
  "u.a.e.": "ae",
};

// Resolves a free-text country string (iso2 code, full name, or common
// alias like "UK") to the iso2 code used across the checkout flow. Returns
// "" when nothing matches, instead of leaving the field on its stale value.
export function resolveCountryIso2(countryRaw) {
  const countryVal = (countryRaw || "").trim().toLowerCase();
  if (!countryVal) return "";
  const aliasIso2 = COUNTRY_ALIASES[countryVal];
  const found =
    defaultCountries.find((c) => parseCountry(c).iso2 === countryVal) ||
    defaultCountries.find(
      (c) => parseCountry(c).name.toLowerCase() === countryVal,
    ) ||
    (aliasIso2 &&
      defaultCountries.find((c) => parseCountry(c).iso2 === aliasIso2));
  return found ? parseCountry(found).iso2 : "";
}
