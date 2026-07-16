export async function GET(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded ? forwarded.split(",")[0].trim() : realIp || null;

  // localhost / private IPs — ip-api.com returns nothing for these
  const isLocal = !ip || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.");

  if (isLocal) {
    return Response.json({ countryCode: null, zip: null });
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode,zip`, {
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
