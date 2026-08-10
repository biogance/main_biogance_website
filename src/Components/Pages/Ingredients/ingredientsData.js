// Ported from https://kase-ho-connect.lovable.app/ — the 74-name ingredient
// list and the 6 curated detail entries are the reference site's own data
// (extracted from its compiled bundle), kept as one JSON file instead of
// hand-retyped so nothing drifts from the source.
import raw from './ingredients-data-raw.json';

export const INGREDIENT_NAMES = raw.names;
export const INGREDIENT_DETAILS = raw.details;

export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=85';

// Reference site's genericDetail() — used for the 68 names that don't have
// a hand-written entry in INGREDIENT_DETAILS, so every name in the A-Z list
// still opens a fully-populated detail view instead of a blank/broken one.
export function genericDetail(name) {
  return {
    latin: name,
    eyebrow: 'Biogance ingredient library',
    image: FALLBACK_IMAGE,
    intro: `Discover how ${name.toLowerCase()} fits into Biogance's ingredient-led approach to everyday pet care.`,
    origin:
      'This ingredient is part of the Biogance ingredient library. The final page can connect this card to the complete origin information already available in the website ingredient database.',
    benefits: 'Explore the role of this ingredient in the formula and the care needs it is selected to address.',
    care: 'Find the Biogance products and care routines formulated with this ingredient.',
  };
}

export function getIngredientDetail(name) {
  return INGREDIENT_DETAILS[name] ?? genericDetail(name);
}
