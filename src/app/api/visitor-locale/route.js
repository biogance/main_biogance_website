// Deliberately NOT named "geoip"/"geo-ip"/"ip-api" — several ad-block and
// privacy-extension filter lists (commonly run in Firefox) block requests
// purely by matching those substrings anywhere in the URL path, even for a
// same-origin first-party route like this one. That silently killed the
// client's fetch() before it ever reached this handler, which looked from
// the outside like "always falls back to France, only in Firefox, every
// single time" — not a network/timing issue, so retries/caching couldn't
// have fixed it. Keep this route's path generic if it's ever renamed again.

// Short-lived in-memory cache (per server instance) so repeated requests
// from the same visitor (page reloads, multiple tabs, hot-reload in dev)
// don't re-hit the upstream geo providers — ip-api.com's free tier is
// limited to 45 req/min per source IP, and that limit was getting hit
// during normal dev/testing, silently degrading to {countryCode:null}
// with no indication why.
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal, next: { revalidate: 0 } });
  } finally {
    clearTimeout(timer);
  }
}

// ipwho.is: HTTPS, no key, no documented rate limit — primary provider so
// the lookup never depends on plain HTTP egress (some networks/security
// software block outbound port 80, which ip-api.com's free tier requires).
async function lookupIpwhois(ip) {
  const res = await fetchWithTimeout(`https://ipwho.is/${ip || ""}`, 4000);
  const data = await res.json();
  if (data?.success === false) throw new Error(data?.message || "ipwho.is lookup failed");
  const countryCode = data.country_code || null;
  const zip = data.postal || null;
  if (!countryCode) throw new Error("ipwho.is: no country_code in response");
  return { countryCode, zip };
}

// ip-api.com: HTTP-only on the free tier — kept as a fallback in case
// ipwho.is is ever unreachable.
async function lookupIpApi(ip) {
  const res = await fetchWithTimeout(`http://ip-api.com/json/${ip || ""}?fields=status,message,countryCode,zip`, 4000);
  const data = await res.json();
  if (data.status === "fail") throw new Error(data.message || "ip-api.com lookup failed");
  if (!data.countryCode) throw new Error("ip-api.com: no countryCode in response");
  return { countryCode: data.countryCode, zip: data.zip || null };
}

// ipinfo.io: HTTPS, no key required for basic lookups, works reliably
// for self-lookup (no IP passed) — used as third fallback.
async function lookupIpinfo(ip) {
  const url = ip ? `https://ipinfo.io/${ip}/json` : "https://ipinfo.io/json";
  const res = await fetchWithTimeout(url, 4000);
  const data = await res.json();
  if (!data?.country) throw new Error("ipinfo.io: no country in response");
  return { countryCode: data.country, zip: data.postal || null };
}

export async function GET(request) {
  // Collect every header that proxies/CDNs use to forward the real client IP.
  // Different browsers send slightly different headers in local dev (e.g.
  // Firefox omits some that Chrome includes), so check all of them.
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfIp = request.headers.get("cf-connecting-ip");       // Cloudflare
  const amznIp = request.headers.get("x-amzn-trace-id");      // AWS ALB (trace, not IP)
  const trueClientIp = request.headers.get("true-client-ip"); // Akamai / Cloudflare
  const fastlyIp = request.headers.get("fastly-client-ip");   // Fastly

  const rawIp =
    cfIp ||
    trueClientIp ||
    fastlyIp ||
    (forwarded ? forwarded.split(",")[0].trim() : null) ||
    realIp ||
    null;

  const isPrivate = (addr) =>
    !addr ||
    addr === "::1" ||
    addr === "127.0.0.1" ||
    addr.startsWith("192.168.") ||
    addr.startsWith("10.") ||
    addr.startsWith("172.16.") ||
    addr.startsWith("172.17.") ||
    addr.startsWith("172.18.") ||
    addr.startsWith("172.19.") ||
    addr.startsWith("172.2") ||
    addr.startsWith("172.30.") ||
    addr.startsWith("172.31.") ||
    addr === "::ffff:127.0.0.1";

  // For private/local IPs pass null — providers will geo-locate the
  // outbound server IP instead, which is still better than returning null.
  const target = isPrivate(rawIp) ? null : rawIp;

  console.log("[visitor-locale] incoming request:", {
    "x-forwarded-for": forwarded,
    "x-real-ip": realIp,
    "cf-connecting-ip": cfIp,
    "true-client-ip": trueClientIp,
    resolvedIp: rawIp,
    isPrivate: isPrivate(rawIp),
    lookupTarget: target || "(self)",
  });

  const cacheKey = target || "self";
  const cached = cache.get(cacheKey);
  const isFresh = cached && Date.now() - cached.at < CACHE_TTL_MS;
  if (isFresh) {
    console.log("[visitor-locale] serving cached result for", cacheKey, cached.result);
    return Response.json(cached.result);
  }

  const providers = [
    { name: "ipwho.is",   fn: () => lookupIpwhois(target || "") },
    { name: "ipinfo.io",  fn: () => lookupIpinfo(target) },
    { name: "ip-api.com", fn: () => lookupIpApi(target || "") },
  ];

  let result = null;
  for (const { name, fn } of providers) {
    try {
      result = await fn();
      console.log(`[visitor-locale] ${name} succeeded:`, result);
      break;
    } catch (err) {
      console.error(`[visitor-locale] ${name} failed:`, err?.message);
    }
  }

  if (!result) {
    if (cached) {
      console.warn("[visitor-locale] all providers failed — serving stale cache for", cacheKey);
      return Response.json(cached.result);
    }
    result = { countryCode: null, zip: null };
  }

  if (result.countryCode) {
    cache.set(cacheKey, { result, at: Date.now() });
  }
  console.log("[visitor-locale] final response:", result);
  return Response.json(result);
}
