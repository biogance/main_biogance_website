// Ported 1:1 from the "BREED PAGE.html" mockup's inline <script> logic
// (normalize/search/filter/related helpers) so BreedLibrary.jsx and
// BreedArticle.jsx share one source of truth instead of re-deriving it.

export function normalize(v = '') {
  return String(v)
    .normalize('NFD')
    .replace(new RegExp('[\u0300-\u036f]', 'g'), '')
    .toLowerCase();
}

export function titleSize(v = '') {
  return { Petit: 'Small', Moyen: 'Medium', Grand: 'Large', 'Tres Grand': 'Very large' }[v] || v;
}

export function apartmentLabel(v = '') {
  return v === 'Oui' ? 'Suitable' : v === 'Non' ? 'Not recommended' : '—';
}

export function firstSentences(text, count = 2) {
  const parts = (text || '').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  return parts.slice(0, count).join(' ').trim();
}

export function proseParagraphs(text) {
  const sentences = (text || '').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  if (sentences.length <= 3) return [text];
  const paras = [];
  for (let i = 0; i < sentences.length; i += 3) paras.push(sentences.slice(i, i + 3).join(' ').trim());
  return paras;
}

export function searchText(b) {
  return normalize([b.name, b.frenchName, b.tags, b.group, b.temperament, b.coat, b.concern, b.description].filter(Boolean).join(' '));
}

export function cardMeta(b) {
  if (b.species === 'dog') {
    return [b.size ? titleSize(b.size) : '', b.coat, b.apartment ? `${apartmentLabel(b.apartment)} apartment` : ''].filter(Boolean).slice(0, 3);
  }
  return (b.careCues || []).slice(0, 3);
}

// Returns [{ label, value, extra }] for the quickfacts grid — extra is a
// star-rating spec ({ n }) for energy/grooming, or null otherwise.
export function dogFacts(b) {
  return [
    { label: 'Size', value: titleSize(b.size) || '—' },
    { label: 'Group', value: (b.group || '').replace(/^Groupe \d+\s*[–-]\s*/, '') || '—' },
    { label: 'Energy', value: `${b.energy || '—'} / 5`, rating: b.energy },
    { label: 'Grooming', value: `${b.grooming || '—'} / 5`, rating: b.grooming },
    { label: 'Apartment life', value: apartmentLabel(b.apartment) },
    { label: 'Coat profile', value: [b.coat, b.concern].filter(Boolean).join(' · ') || '—' },
  ];
}

export function catFacts(b) {
  const cues = b.careCues || [];
  return [
    { label: 'Species', value: 'Cat' },
    { label: 'French name', value: b.frenchName || b.name },
    { label: 'Coat cue', value: cues[0] || '—' },
    { label: 'Care cue', value: cues[1] || '—' },
    { label: 'Profile', value: cues[2] || '—' },
    { label: 'Guide', value: 'Breed overview' },
  ];
}

export function relatedBreeds(breed, allBreeds) {
  const pool = breed.species === 'dog' ? allBreeds.dogs : allBreeds.cats;
  const scored = pool
    .filter((x) => x.slug !== breed.slug)
    .map((x) => {
      let score = 0;
      if (breed.species === 'dog') {
        if (x.group && x.group === breed.group) score += 4;
        if (x.size && x.size === breed.size) score += 2;
        if (x.coat && x.coat === breed.coat) score += 2;
        if (x.concern && x.concern === breed.concern) score += 1;
      } else {
        const a = new Set(breed.careCues || []);
        (x.careCues || []).forEach((c) => {
          if (a.has(c)) score += 2;
        });
      }
      return { x, score };
    });
  scored.sort((a, z) => z.score - a.score || a.x.name.localeCompare(z.x.name, 'en'));
  return scored.slice(0, 3).map((o) => o.x);
}
