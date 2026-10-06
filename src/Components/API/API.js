// Both come only from the environment (.env.local locally, the hosting
// provider's env settings in production) — no hard-coded fallback.
// NEXT_PUBLIC_* values are inlined at build time, so a rebuild is needed
// after changing them.
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;
