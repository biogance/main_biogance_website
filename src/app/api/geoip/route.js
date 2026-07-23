export async function GET(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded ? forwarded.split(",")[0].trim() : realIp || null;

  // localhost / private IPs — ip-api.com returns nothing useful for these
  const isLocal = !ip || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.");

  try {
    // In local dev (or anywhere that isn't behind a proxy setting these
    // forwarding headers) there's no client IP to pass along. Omitting the
    // IP from the ip-api.com URL makes it geolocate the request's own
    // source address instead — in local dev that's this machine's real
    // public IP, which is good enough to actually test with. In production,
    // the forwarded header (the real visitor's IP) always takes priority.
    const target = isLocal ? "" : ip;
    const res = await fetch(`http://ip-api.com/json/${target}?fields=countryCode,zip`, {
      next: { revalidate: 0 },
    });
    const data = await res.json();
    return Response.json({
      countryCode: data.countryCode || null,
      zip: data.zip || null,
    });
  } catch {
    return Response.json({ countryCode: null, zip: null });
  }
}
