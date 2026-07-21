import { isValidPhoneNumber, validatePhoneNumberLength } from "libphonenumber-js";

// Validates a national number (no dial code prefix, e.g. "612345678") against
// the phone number rules of the given country (iso2, e.g. "fr", "pk") — digit
// count and leading-digit patterns are both country-specific (a French mobile
// number is 9 digits after the +33 and starts with 6/7, a Pakistani mobile
// number is 10 digits after the +92 and starts with 3, etc.), so a plain
// "digits only" check can't catch a wrong-but-same-length number.
//
// Returns one of "required" | "tooShort" | "tooLong" | "invalid" | null
// (null = valid). Callers map the code to a translated message via
// t(`errorPhone${capitalize(code)}`).
export function getPhoneValidationErrorCode(nationalNumber, iso2) {
  const digits = (nationalNumber || "").replace(/\D/g, "");
  if (!digits) return "required";

  const country = (iso2 || "").toUpperCase();
  if (!country) return "invalid";

  const lengthIssue = validatePhoneNumberLength(digits, country);
  if (lengthIssue === "TOO_SHORT") return "tooShort";
  if (lengthIssue === "TOO_LONG") return "tooLong";
  if (lengthIssue === "INVALID_LENGTH" || lengthIssue === "NOT_A_NUMBER") return "invalid";

  if (!isValidPhoneNumber(digits, country)) return "invalid";

  return null;
}
