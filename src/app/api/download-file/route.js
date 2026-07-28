// Same-origin download proxy for files hosted on the MEDIA_URL CDN
// (CloudFront). A direct <a href="https://cdn-domain/...pdf" download> is
// silently ignored by browsers for cross-origin URLs — it just opens the
// file in a new tab instead of downloading it — and a client-side
// fetch()-to-blob workaround fails outright when the CDN doesn't send
// CORS headers. Proxying the fetch through this same-origin route sidesteps
// both problems: the browser sees a same-origin response with a
// Content-Disposition: attachment header, so a plain <a download> works
// natively with no JS involved.
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL || "https://d18f57oyxifcsh.cloudfront.net/";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  const filename = searchParams.get("filename") || "download.pdf";

  if (!path) {
    return Response.json({ error: "Missing path" }, { status: 400 });
  }

  // Only ever proxy our own media CDN — otherwise this route would be an
  // open proxy that could be used to fetch and relay arbitrary URLs.
  const url = path.startsWith("http") ? path : `${MEDIA_URL}${path}`;
  if (!url.startsWith(MEDIA_URL)) {
    return Response.json({ error: "Invalid source" }, { status: 400 });
  }

  let upstream;
  try {
    upstream = await fetch(url, { next: { revalidate: 0 } });
  } catch {
    return Response.json({ error: "Failed to reach file" }, { status: 502 });
  }
  if (!upstream.ok) {
    return Response.json({ error: "File not found" }, { status: 502 });
  }

  const buffer = await upstream.arrayBuffer();
  const safeFilename = filename.replace(/["\r\n]/g, "");

  return new Response(buffer, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeFilename}"`,
      "Cache-Control": "no-store",
    },
  });
}
