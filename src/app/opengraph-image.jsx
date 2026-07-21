import { ImageResponse } from "next/og";

// Next.js auto-detects this file and wires its output into every route's
// og:image (and twitter:image, which falls back to openGraph's image when a
// route has no dedicated twitter-image) that doesn't set its own — the root
// layout's metadata previously pointed openGraph.images at "/og-image.jpg",
// a file that was never actually added to public/, so every page without
// per-page metadata (i.e. everything except /advices/[slug]) was sharing a
// broken image link in its social-share preview. Generating the image here
// instead means there's no static asset to go missing.
export const alt = "Biogance - Pioneers in Natural Pet Care";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#faf9f7",
        }}
      >
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            color: "#1e1e1e",
            letterSpacing: -2,
            fontFamily: "sans-serif",
          }}
        >
          biogance
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            color: "#5b5b5b",
            fontFamily: "sans-serif",
          }}
        >
          Pioneers in Natural Pet Care
        </div>
      </div>
    ),
    { ...size },
  );
}