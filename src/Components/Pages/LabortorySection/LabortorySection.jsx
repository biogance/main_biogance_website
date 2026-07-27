"use client";

import { useEffect, useState } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { MEDIA_URL } from "../../API/API";

// Same splash-data pattern used in Reseller.jsx: header media (image/video)
// and footer tags are read from the cached "splashData" payload in
// localStorage rather than hardcoded, so this section stays in sync with
// whatever the Splash API returns (who_we_are_header / who_we_are_footer).

function useSplashData(key) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const read = () => {
      try {
        const parsed = JSON.parse(localStorage.getItem("splashData") || "null");
        setData(parsed?.[key] ?? null);
      } catch {
        /* silent */
      }
    };
    read();
    window.addEventListener("splashDataReady", read);
    return () => window.removeEventListener("splashDataReady", read);
  }, [key]);
  return data;
}

function SplashMedia({ data }) {
  const [loaded, setLoaded] = useState(false);
  const rawPath = data?.media || (Array.isArray(data?.images) && data.images.length > 0 ? data.images[0] : null);
  if (!rawPath) return null;
  const mediaStr = typeof rawPath === "string" ? rawPath : (rawPath?.media || rawPath?.url || "");
  if (!mediaStr) return null;
  const src = mediaStr.startsWith("http") ? mediaStr : `${MEDIA_URL}${mediaStr}`;
  const isVideo = data?.media_type === "video" || mediaStr.match(/\.(mp4|webm|ogg|mov)$/i);
  const mediaStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    opacity: loaded ? 1 : 0,
    transition: "opacity 0.5s ease",
    objectFit: "cover",
  };
  return (
    <>
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              border: "3px solid rgba(0,0,0,.15)",
              borderTopColor: "#000",
              borderRadius: "50%",
              animation: "lab-media-spin 0.8s linear infinite",
            }}
          />
        </div>
      )}
      {isVideo ? (
        <video
          className="lab-splash-media"
          src={src}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setLoaded(true)}
          style={mediaStyle}
        />
      ) : (
        <img className="lab-splash-media" src={src} alt="" onLoad={() => setLoaded(true)} style={mediaStyle} />
      )}
    </>
  );
}

const DEFAULT_MARQUEE_TAGS = [
  "98% organic & natural ingredients",
  "Expert pet-care formulas",
  "Pioneer in organic & natural hygiene and care for pets",
  "Family business & independent French laboratory",
  "Animal welfare first",
  "Responsible care routines",
];

export default function LabortorySection() {
  const headerMedia = useSplashData("who_we_are_header");
  const footerData = useSplashData("who_we_are_footer");

  const marqueeTags =
    Array.isArray(footerData?.tags) && footerData.tags.length > 0 ? footerData.tags : DEFAULT_MARQUEE_TAGS;
  // Repeated several times (not just once) so the CSS keyframe
  // (translateX -50%) keeps looping seamlessly with no gap at the end —
  // if the API returns a short tag list, two copies alone can be narrower
  // than the viewport, leaving a blank stretch before the loop restarts.
  // The marquee's CSS animation-duration is scaled to match (90s = 30s per
  // "set" x 3 sets moved per cycle), so the scroll speed stays the same as
  // the original single-set version instead of speeding up.
  const MARQUEE_REPEAT = 6;
  const marqueeItems = Array.from({ length: MARQUEE_REPEAT }, () => marqueeTags).flat();

  const hasHeaderMedia = Boolean(
    headerMedia?.media || (Array.isArray(headerMedia?.images) && headerMedia.images.length > 0)
  );

  useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = prev;
    };
  }, []);

  return (
    <>
      {/* Rendered outside .laboratory-landing on purpose: that wrapper sets
          its own font-family/color via CSS custom properties below, and
          since Navbar is a real child component (not styled-jsx-scoped
          content), those properties would otherwise inherit straight into
          Navbar's own text through normal CSS inheritance, overriding its
          intended site-wide styling. */}
      <Navbar bgWhite={true} />

      <div className="laboratory-landing">
      <div className="laboratory-page-offset">
        <main className="page">
          <div className="hero-viewport">
          <section className="hero" id="about">
            <div className="hero-copy">
              <div className="eyebrow">About Biogance</div>
              <h1 style={{lineHeight:"1"}}>
                Natural care.
                <br />
                <span className="small-line">French</span> expertise.
              </h1>
              <p>
                Biogance is an independent French family business dedicated to animal well-being.
                As a pioneer in organic and natural hygiene and care for pets, the brand combines selected ingredients, Research & Innovation expertise and certified production standards to create safe, effective and responsible daily care.
              </p>
              <div className="hero-actions">
                <a className="btn dark" href="#commitments">
                  Our commitments
                </a>
                <a className="btn" href="#story">
                  Our story
                </a>
              </div>
            </div>
            <div className="hero-visual" aria-label="Editorial visual inspired by natural pet care">
              <div className={`hero-editorial${hasHeaderMedia ? " has-media" : ""}`}>
                <SplashMedia data={headerMedia} />
              </div>
              <div className="hero-editorial-card">
                <span>Organic & natural pet care</span>
                <strong>Formulated for animals, designed with purpose.</strong>
              </div>
            </div>
          </section>

          <section className="reassurance-marquee" aria-label="Biogance reassurance values">
            <div className="reassurance-track">
              {marqueeItems.map((tag, index) => (
                <span key={`${tag}-${index}`}>{tag}</span>
              ))}
            </div>
          </section>
          </div>

          <section className="section white" id="story">
            <div className="wrap">
              <div className="section-head">
                <div>
                  <span className="kicker">Our identity</span>
                  <h2 style={{lineHeight:"1"}}>Born in Angers. Built for animal care.</h2>
                </div>
                <p>
                  Born in Angers and guided by a responsible French laboratory culture, Biogance has grown with one clear ambition: creating natural, effective and desirable care routines that respect animals, their families and the planet.
                </p>
              </div>

              <div className="story-grid">
                <div className="story-aside">
                  <span className="big-year">2008</span>
                  <p>
                    The beginning of a French pet-care laboratory with a clear ambition: make animal hygiene cleaner, softer and more responsible.
                  </p>
                </div>
                <div className="story-copy">
                  <p>
                    Founded in Angers, in the heart of the Pays de la Loire, Biogance grew from a laboratory project into a recognised name in natural pet care. From the beginning, the brand has worked with experts to create formulas adapted to the needs of pets and companion animals.
                  </p>
                  <p>
                    Today, Biogance continues to combine <strong>natural inspiration, scientific precision and French know-how</strong> to support families, breeders, groomers, veterinarians and pet professionals with trusted daily care routines.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="section soft" id="values">
            <div className="wrap">
              <div className="section-head">
                <div>
                  <span className="kicker">What guides us</span>
                  <h2 style={{lineHeight:"1"}}>Care without excess.</h2>
                </div>
                <p>
                  Biogance is shaped by simple but demanding principles: respect for animals, carefully selected ingredients, controlled manufacturing and continuous improvement.
                </p>
              </div>

              <div className="value-grid">
                <article className="value-card">
                  <span>01</span>
                  <div>
                    <h3>Animal well-being</h3>
                    <p>Products developed to support comfort, hygiene, skin balance and coat beauty — paraben-free, phenoxyethanol-free, animal oil-free and not tested on animals.</p>
                  </div>
                </article>
                <article className="value-card">
                  <span>02</span>
                  <div>
                    <h3>Natural inspiration</h3>
                    <p>Formulas enriched with organic and natural ingredients, selected for performance and softness.</p>
                  </div>
                </article>
                <article className="value-card">
                  <span>03</span>
                  <div>
                    <h3>Expert formulation</h3>
                    <p>French laboratory know-how at every step, from ingredient selection to product control.</p>
                  </div>
                </article>
                <article className="value-card">
                  <span>04</span>
                  <div>
                    <h3>Responsible progress</h3>
                    <p>A long-term approach guided by recyclable packaging, selected raw materials and improvement over time.</p>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section className="dark-feature" id="commitments">
            <div className="wrap">
              <div>
                <span className="kicker">Our commitments</span>
                <h2 style={{lineHeight:"1"}}>Better care starts with better choices.</h2>
              </div>
              <div>
                <p>
                  At Biogance, every commitment is translated into concrete choices: formulas developed for animal welfare, carefully selected raw materials, recyclable packaging, certified production standards and a team culture built on respect, trust and continuous improvement.
                </p>
                <div className="dark-feature-list">
                  <div className="dark-feature-item">
                    <span>Animal</span>
                    <strong>Care routines designed for comfort, hygiene and well-being.</strong>
                  </div>
                  <div className="dark-feature-item">
                    <span>Nature</span>
                    <strong>Organic actives and ingredients of natural origin, carefully selected.</strong>
                  </div>
                  <div className="dark-feature-item">
                    <span>Planet</span>
                    <strong>Recyclable packaging and an eco-responsible approach.</strong>
                  </div>
                  <div className="dark-feature-item">
                    <span>Quality</span>
                    <strong>GMP / ISO 22716 certified production and controlled traceability.</strong>
                  </div>
                  <div className="dark-feature-item">
                    <span>People</span>
                    <strong>A family business driven by collaboration and respect.</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="section white">
            <div className="wrap">
              <div className="section-head">
                <div>
                  <span className="kicker">From intention to product</span>
                  <h2 style={{lineHeight:"1"}}>Natural care, made tangible.</h2>
                </div>
                <p>
                  The Biogance promise lives in five essential pillars: animal welfare, environmental responsibility, innovation, quality and respect for the people who make the brand move forward every day.
                </p>
              </div>

              <div className="proof-row" aria-label="Biogance proof points">
                <article className="proof proof-hero dark">
                  <div>
                    <span className="proof-label">Signature fact</span>
                    <strong>98%</strong>
                    <h3 style={{lineHeight:"1"}}>Organic & natural ingredients at the heart of Biogance care.</h3>
                  </div>
                  <p>A powerful proof point, designed to be seen first: Biogance care begins with a formula philosophy rooted in organic and natural ingredients.</p>
                </article>
                <article className="proof proof-iso">
                  <div>
                    <span className="proof-label">Certified quality</span>
                    <strong>ISO 22716</strong>
                    <h3 style={{lineHeight:"1"}}>GMP-certified production standards.</h3>
                  </div>
                  <p>Controlled traceability and quality standards at every stage.</p>
                </article>
                <article className="proof proof-pioneer">
                  <div>
                    <span className="proof-label">Brand heritage</span>
                    <strong>Pioneer</strong>
                    <h3 style={{lineHeight:"1"}}>Natural pet care since the beginning.</h3>
                  </div>
                  <p>Biogance has championed organic and natural hygiene and care from day one.</p>
                </article>
                <article className="proof proof-wide dark">
                  <div>
                    <span className="proof-label">Laboratory DNA</span>
                    <strong>Family business</strong>
                    <h3 style={{lineHeight:"1.1"}}>Independent French laboratory with a long-term vision.</h3>
                  </div>
                  <p>A human brand built on expertise, trust and continuity.</p>
                </article>
              </div>

              <div className="commitment-grid">
                <article className="commitment-card welfare">
                  <div>
                    <span>Respect for the animal</span>
                    <h3 style={{lineHeight:"1", fontSize:"45px"}}>Welfare first</h3>
                  </div>
                  <p>Organic and natural care products formulated with certified organic active ingredients and ingredients of natural origin, designed for the specific needs of dogs, cats, small mammals, birds, reptiles and other companions.</p>
                </article>
                <article  className="commitment-card responsible">
                  <div>
                    <span>Respect for the environment</span>
                    <h3 style={{lineHeight:"1", fontSize:"45px"}}>Responsible by design</h3>
                  </div>
                  <p>Selected raw materials, recyclable packaging and an eco-responsible approach to reduce impact while preserving formula quality, safety and conservation.</p>
                </article>
                <article className="commitment-card science">
                  <div>
                    <span>Innovation</span>
                    <h3 style={{lineHeight:"1",fontSize:"45px"}}>Science meets nature</h3>
                  </div>
                  <p>A Research &amp; Development team inspired by aromatic and medicinal plants, constantly improving formulas to answer market expectations and the real needs of pets.</p>
                </article>
                <article className="commitment-card quality">
                  <div>
                    <span>Quality</span>
                    <h3 style={{lineHeight:"1", fontSize:"45px"}}>Controlled standards</h3>
                  </div>
                  <p>Production units certified GMP / ISO 22716, quality controls at every step and the Organissime range launched with ECOCERT as a reference for natural, ethical animal cosmetics.</p>
                </article>
                <article className="commitment-card human">
                  <div>
                    <span>Sharing &amp; respect</span>
                    <h3 style={{lineHeight:"1", fontSize:"45px"}}>Human expertise</h3>
                  </div>
                  <p>A family business where R&amp;D, quality, production, logistics and marketing work together with trust, dynamism and respect — because caring for animals also means respecting people.</p>
                </article>
              </div>
            </div>
          </section>

          <section className="closing" aria-label="Biogance closing statement">
            <span className="kicker">The natural way</span>
            <h2 style={{lineHeight:"1"}}>Care that respects animals, people and the planet.</h2>
            <p>
              Choosing Biogance means choosing an expert French brand that blends science and nature to create trusted, responsible and desirable pet-care routines.
            </p>
            <div className="closing-actions">
              <a className="btn dark" href="#">
                Discover our products
              </a>
              <a className="btn" href="#commitments">
                Read our commitments
              </a>
            </div>
          </section>
        </main>
      </div>

      <Footer />

      <style jsx>{`
        .laboratory-landing {
          --black: #111111;
          --ink: #1d1d1d;
          --charcoal: #2a2a2a;
          --white: #ffffff;
          --paper: #f8f8f6;
          --soft: #f1f1ee;
          --soft-2: #e9e9e5;
          --line: #d7d7d3;
          --line-soft: #e7e7e2;
          --muted: #707070;
          --muted-2: #9a9a9a;
          --sage: #edf1eb;
          --green: #5d7a62;
          --max: 1440px;
          --sans: Arial, Helvetica, sans-serif;
          background: var(--paper);
          color: var(--ink);
          font-family: var(--sans);
        }

        .laboratory-page-offset {
          min-height: 100vh;
          padding-top: 104px;
        }
        @media (max-width: 1023px) {
          .laboratory-page-offset {
            padding-top: 64px;
          }
        }

        .page {
          min-height: 100vh;
        }

        /* Hero + the reassurance tags strip right under it together fill
           exactly one screen (viewport height minus the fixed Navbar), same
           forceful h-screen + overflow:hidden approach as the home hero
           (see MainVideo.jsx) — on every screen size. Below 1180px .hero
           stacks hero-copy above hero-visual and the two together genuinely
           don't fit one screen without clipping real content, so on those
           widths the decorative hero-visual is dropped instead (see the
           max-width:1180px rule further down) and hero-copy is sized more
           compactly — trading the side image for guaranteeing the headline,
           description, buttons and tags are always fully visible. */
        .hero-viewport {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 104px);
          overflow: hidden;
        }
        @media (max-width: 1023px) {
          .hero-viewport {
            height: calc(100vh - 64px);
          }
        }

        .wrap {
          max-width: full;
          margin: 0 auto;
          padding: 0 24px;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 28px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.26em;
          color: var(--muted);
        }
        .eyebrow::before {
          content: "";
          width: 48px;
          height: 1px;
          background: var(--ink);
          display: block;
        }

        .hero {
          /* Grows to fill whatever's left of .hero-viewport above the
             marquee's fixed 54px band (see below) — now that the hero's
             own content is compact, growing it (instead of stretching the
             marquee) keeps the tags a slim fixed-height strip instead of a
             tall band with a lot of empty space around one centered line. */
          flex: 1 1 auto;
          min-height: 0;
          overflow: hidden;
          display: grid;
          grid-template-columns: minmax(0, 1.04fr) minmax(420px, 0.96fr);
          border-bottom: 1px solid var(--line);
          background: var(--paper);
        }

        .hero-copy {
          padding: 40px clamp(24px, 6vw, 100px) 40px clamp(24px, 6vw, 90px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
        }

        .hero h1 {
          margin: 0;
          max-width: 820px;
          /* Kept well under the old clamp(58px,8vw,132px) — that sized off
             viewport WIDTH alone, so on a wide-but-short laptop screen
             (1440x816 etc.) it rendered huge regardless of how little
             vertical room .hero actually had, which is what was pushing
             the description/buttons out past the overflow:hidden clip. */
          font-size: clamp(32px, 5.5vw, 96px);
          line-height: 0.92;
          letter-spacing: -0.09em;
          text-transform: uppercase;
          font-weight: 500;
          color: var(--ink);
        }
        .hero h1 .small-line {
          display: block;
          font-size: 0.73em;
        }
        .hero p {
          max-width: 620px;
          margin: 16px 0 0;
          color: var(--charcoal);
          font-size: 14px;
          line-height: 1.6;
          /* Bounds the paragraph to a predictable height regardless of how
             many words actually wrap, for the same reason as the h1 above. */
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .hero-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 20px;
        }
        .hero-actions .btn {
          min-height: 42px;
        }
        .btn {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 30px;
          border: 1px solid var(--ink);
          background: transparent;
          color: var(--ink);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: 0.25s ease;
          white-space: nowrap;
          text-decoration: none;
        }
        .btn.dark {
          background: var(--ink);
          color: var(--white);
        }
        .btn:hover {
          transform: translateY(-1px);
          background: var(--ink);
          color: var(--white);
        }
        .btn.dark:hover {
          background: #000;
        }

        .hero-visual {
          position: relative;
          border-left: 1px solid var(--line);
          /* Just a floor now (grid stretch matches it to hero-copy's real
             height on most screens) — was 620px, which alone was taller
             than the available budget on common ~768px-tall laptop
             viewports and forced clipping regardless of text size. */
          min-height: 260px;
          overflow: hidden;
          background:
            radial-gradient(circle at 28% 22%, rgba(255, 255, 255, 0.86), transparent 28%),
            radial-gradient(circle at 74% 70%, rgba(93, 122, 98, 0.18), transparent 32%),
            linear-gradient(135deg, #eeeeeb 0%, #d8d8d2 100%);
        }

        .hero-editorial {
          position: absolute;
          inset: 8%;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.76);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.09);
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.46)),
            radial-gradient(circle at 62% 32%, rgba(255, 255, 255, 0.88), transparent 0 17%, transparent 18%),
            radial-gradient(circle at 40% 56%, rgba(93, 122, 98, 0.22), transparent 0 28%, transparent 29%),
            linear-gradient(135deg, #d7d7d1, #f3f3ef 45%, #cfcfc8);
        }

        /* Once real splash media (image/video) loads, it fills this frame
           box only (see .lab-splash-media below) — the decorative gradient
           stays underneath as a placeholder while it loads and simply gets
           covered once the media is ready. The caption card's look is not
           affected by whether media is present. */
        .hero-editorial-card {
          position: absolute;
          left: 8%;
          right: 8%;
          bottom: 8%;
          z-index: 2;
          padding: 30px;
          background: var(--white);
          border: 1px solid rgba(255, 255, 255, 0.78);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.08);
        }
        .hero-editorial-card span {
          display: block;
          margin-bottom: 18px;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .hero-editorial-card strong {
          display: block;
          max-width: 500px;
          font-size: clamp(28px, 3vw, 48px);
          line-height: 0.95;
          letter-spacing: -0.07em;
          text-transform: uppercase;
          font-weight: 500;
        }

        .reassurance-marquee {
          flex: 0 0 54px;
          display: flex;
          align-items: center;
          overflow: hidden;
          border-bottom: 1px solid var(--line);
          background: var(--white);
          white-space: nowrap;
        }
        .reassurance-track {
          display: flex;
          gap: 34px;
          min-width: max-content;
          animation: reassurance-marquee 90s linear infinite;
          font-size: 10px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .reassurance-track span {
          display: inline-flex;
          align-items: center;
          gap: 34px;
        }
        .reassurance-track span::after {
          content: "";
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--ink);
          opacity: 0.28;
        }
        @keyframes reassurance-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .section {
          padding: 92px 0;
          border-bottom: 1px solid var(--line);
        }
        .section.white {
          background: var(--white);
        }
        .section.soft {
          background: var(--paper);
        }
        .section-head {
          display: grid;
          grid-template-columns: minmax(260px, 0.42fr) minmax(0, 0.58fr);
          gap: 70px;
          margin-bottom: 48px;
          align-items: end;
        }
        .kicker {
          display: block;
          margin-bottom: 22px;
          font-size: 11px;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .section h2 {
          margin: 0;
          max-width: 820px;
          font-size: clamp(38px, 5.7vw, 94px);
          line-height: 0.88;
          letter-spacing: -0.085em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .section-head p {
          margin: 0;
          max-width: 650px;
          font-size: 15px;
          line-height: 1.8;
          color: var(--charcoal);
        }

        .story-grid {
          display: grid;
          grid-template-columns: minmax(320px, 0.7fr) minmax(0, 1.3fr);
          border: 1px solid var(--line);
          background: var(--white);
        }
        .story-aside {
          padding: 44px;
          border-right: 1px solid var(--line-soft);
          background:
            radial-gradient(circle at 20% 18%, rgba(255, 255, 255, 0.95), transparent 30%),
            var(--soft);
        }
        .story-aside .big-year {
          display: block;
          margin-bottom: 28px;
          font-size: clamp(64px, 8vw, 118px);
          line-height: 0.78;
          letter-spacing: -0.1em;
          font-weight: 500;
        }
        .story-aside p {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.7;
          max-width: 330px;
        }
        .story-copy {
          padding: 58px clamp(32px, 5vw, 78px);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 44px;
          align-items: start;
        }
        .story-copy p {
          margin: 0;
          color: var(--charcoal);
          font-size: 15px;
          line-height: 1.85;
        }
        .story-copy p strong {
          color: var(--ink);
          font-weight: 700;
        }

        .value-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          border: 1px solid var(--line);
          background: var(--white);
        }
        .value-card {
          min-height: 280px;
          padding: 30px;
          border-right: 1px solid var(--line-soft);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: 0.25s ease;
        }
        .value-card:last-child {
          border-right: 0;
        }
        .value-card:hover {
          background: var(--ink);
          color: var(--white);
        }
        .value-card:hover p,
        .value-card:hover span {
          color: rgba(255, 255, 255, 0.72);
        }
        .value-card span {
          display: block;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--muted-2);
        }
        .value-card h3 {
          margin: 0 0 14px;
          font-size: clamp(22px, 2.4vw, 36px);
          line-height: 0.96;
          letter-spacing: -0.065em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .value-card p {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.7;
        }

        .dark-feature {
          background: var(--ink);
          color: var(--white);
          border-bottom: 1px solid var(--ink);
        }
        .dark-feature .wrap {
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(360px, 1.05fr);
          gap: 70px;
          align-items: center;
          padding-top: 104px;
          padding-bottom: 104px;
        }
        .dark-feature .kicker {
          color: rgba(255, 255, 255, 0.55);
        }
        .dark-feature h2 {
          margin: 0;
          font-size: clamp(46px, 6.8vw, 108px);
          line-height: 0.86;
          letter-spacing: -0.095em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .dark-feature p {
          margin: 0;
          max-width: 700px;
          color: rgba(255, 255, 255, 0.72);
          font-size: 16px;
          line-height: 1.85;
        }
        .dark-feature-list {
          display: grid;
          gap: 14px;
          margin-top: 30px;
        }
        .dark-feature-item {
          display: grid;
          grid-template-columns: 82px minmax(0, 1fr);
          gap: 22px;
          padding: 20px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.16);
        }
        .dark-feature-item span {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.44);
        }
        .dark-feature-item strong {
          display: block;
          font-size: 19px;
          line-height: 1.2;
          letter-spacing: -0.045em;
          text-transform: uppercase;
          font-weight: 500;
        }

        .proof-row {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          grid-auto-rows: minmax(168px, auto);
          gap: 18px;
          margin: 4px 0 22px;
        }
        .proof {
          position: relative;
          padding: 30px;
          border: 1px solid var(--line);
          background:
            radial-gradient(circle at 82% 16%, rgba(255, 255, 255, 0.94), transparent 23%),
            radial-gradient(circle at 18% 84%, rgba(93, 122, 98, 0.12), transparent 28%),
            linear-gradient(180deg, #ffffff 0%, #f7f7f3 100%);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.045);
        }
        .proof > * {
          position: relative;
          z-index: 1;
        }
        .proof.dark {
          background:
            radial-gradient(circle at 82% 14%, rgba(255, 255, 255, 0.1), transparent 22%),
            radial-gradient(circle at 18% 84%, rgba(255, 255, 255, 0.06), transparent 24%),
            linear-gradient(180deg, #181818 0%, #101010 100%);
          border-color: #111111;
          color: var(--white);
          box-shadow: 0 32px 90px rgba(0, 0, 0, 0.16);
        }
        .proof-hero {
          grid-column: span 5;
          grid-row: span 2;
          min-height: 392px;
          padding: 38px;
        }
        .proof-iso {
          grid-column: span 3;
          min-height: 187px;
        }
        .proof-pioneer {
          grid-column: span 4;
          min-height: 187px;
        }
        .proof-wide {
          grid-column: span 7;
          min-height: 187px;
        }
        .proof-label {
          display: block;
          margin-bottom: 18px;
          font-size: 10px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--muted-2);
        }
        .proof.dark .proof-label {
          color: rgba(255, 255, 255, 0.55);
        }
        .proof strong {
          display: block;
          margin-bottom: 10px;
          font-size: clamp(34px, 4vw, 68px);
          line-height: 0.92;
          letter-spacing: -0.09em;
          font-weight: 500;
          text-transform: uppercase;
        }
        .proof-hero strong {
          font-size: clamp(74px, 10vw, 148px);
          line-height: 0.86;
        }
        .proof h3 {
          margin: 0;
          max-width: 280px;
          font-size: clamp(22px, 1.85vw, 32px);
          line-height: 0.9;
          letter-spacing: -0.07em;
          text-transform: uppercase;
          font-weight: 500;
          color: inherit;
        }
        .proof-hero h3 {
          max-width: 320px;
          font-size: clamp(28px, 2.5vw, 42px);
        }
        .proof p {
          margin: 26px 0 0;
          max-width: 300px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.68;
        }
        .proof.dark p {
          color: rgba(255, 255, 255, 0.74);
        }

        .commitment-grid {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 18px;
        }
        .commitment-card {
          position: relative;
          min-height: 330px;
          padding: 30px;
          border: 1px solid var(--line);
          background: var(--white);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.03);
        }
        .commitment-card.welfare {
          grid-column: span 5;
          min-height: 390px;
        }
        .commitment-card.responsible {
          grid-column: span 3;
        }
        .commitment-card.science {
          grid-column: span 4;
        }
        .commitment-card.quality {
          grid-column: span 6;
        }
        .commitment-card.human {
          grid-column: span 6;
        }
        .commitment-card > * {
          position: relative;
          z-index: 1;
        }
        .commitment-card span {
          display: block;
          margin-bottom: 22px;
          font-size: 10px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--muted-2);
        }
        .commitment-card h3 {
          margin: 0;
          max-width: 460px;
          font-size: clamp(30px, 2.9vw, 50px);
          line-height: 0.88;
          letter-spacing: -0.08em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .commitment-card p {
          margin: 34px 0 0;
          max-width: 540px;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.76;
        }

        .closing {
          padding: 106px 24px 114px;
          background:
            radial-gradient(circle at 12% 14%, rgba(255, 255, 255, 0.92), transparent 28%),
            radial-gradient(circle at 88% 72%, rgba(93, 122, 98, 0.13), transparent 34%),
            var(--paper);
          text-align: center;
        }
        .closing h2 {
          max-width: 980px;
          margin: 0 auto 28px;
          font-size: clamp(48px, 7.6vw, 118px);
          line-height: 0.84;
          letter-spacing: -0.1em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .closing p {
          max-width: 680px;
          margin: 0 auto 34px;
          color: var(--charcoal);
          font-size: 16px;
          line-height: 1.8;
        }
        .closing-actions {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 1180px) {
          .hero {
            grid-template-columns: 1fr;
          }
          /* Decorative side image — dropped below the two-column breakpoint
             so the headline/description/buttons (the content that actually
             matters) always have room to breathe within one screen instead
             of being squeezed or clipped alongside a full-height photo. */
          .hero-visual {
            display: none;
          }
          .hero-copy {
            justify-content: center;
          }
          /* Tablet tier: everything below scales down a notch from the
             desktop paddings/gaps so sections don't feel oversized between
             the two-column desktop layout and the fully-stacked mobile one. */
          .section {
            padding: 72px 0;
          }
          .section-head {
            gap: 40px;
          }
          .story-grid {
            grid-template-columns: 1fr;
          }
          .story-aside {
            border-right: 0;
            border-bottom: 1px solid var(--line-soft);
          }
          .value-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .value-card:nth-child(2n) {
            border-right: 0;
          }
          .value-card:nth-child(-n + 2) {
            border-bottom: 1px solid var(--line-soft);
          }
          .dark-feature .wrap {
            grid-template-columns: 1fr;
            padding-top: 80px;
            padding-bottom: 80px;
            gap: 48px;
          }
          .commitment-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .commitment-card.welfare,
          .commitment-card.responsible,
          .commitment-card.science,
          .commitment-card.quality,
          .commitment-card.human {
            grid-column: span 1;
            min-height: 320px;
          }
          .proof-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .proof-hero,
          .proof-iso,
          .proof-pioneer,
          .proof-wide {
            grid-column: span 1;
            grid-row: span 1;
            min-height: 240px;
          }
        }

        @media (max-width: 900px) {
          /* Compact hero-copy: with .hero-visual dropped above, this is now
             the only thing that has to fit inside one screen alongside the
             tags marquee (see .hero's overflow:hidden safety net), so every
             size here is intentionally tighter than the desktop version. */
          .hero-copy {
            padding: 28px 24px;
            gap: 0;
          }
          .hero .eyebrow {
            margin-bottom: 14px;
          }
          .hero h1 {
            font-size: clamp(32px, 11vw, 56px);
            line-height: 0.92;
          }
          .hero p {
            margin: 12px 0 0;
            font-size: 13px;
            line-height: 1.55;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .hero-actions {
            margin-top: 16px;
          }
          .hero-actions .btn {
            min-height: 36px;
            padding: 0 16px;
            font-size: 9px;
          }
          .section {
            padding: 66px 0;
          }
          .section-head {
            grid-template-columns: 1fr;
            gap: 24px;
            margin-bottom: 34px;
          }
          .story-copy {
            grid-template-columns: 1fr;
            padding: 38px 28px;
          }
          .value-grid,
          .commitment-grid,
          .proof-row {
            grid-template-columns: 1fr;
          }
          /* Fully stacked now — border-right (used to separate columns)
             would just leave a stray vertical line down the right edge of
             each full-width card with nothing separating the cards
             themselves, so it's swapped for a border-bottom between them. */
          .value-card {
            border-right: 0;
            border-bottom: 1px solid var(--line-soft);
          }
          .value-card:last-child {
            border-bottom: 0;
          }
          .commitment-card.welfare,
          .commitment-card.responsible,
          .commitment-card.science,
          .commitment-card.quality,
          .commitment-card.human {
            grid-column: span 1;
            min-height: 300px;
          }
          .proof-hero,
          .proof-iso,
          .proof-pioneer,
          .proof-wide {
            grid-column: span 1;
            grid-row: span 1;
            min-height: 220px;
          }
          .commitment-card {
            min-height: 300px;
          }
        }

        @media (max-width: 560px) {
          .btn {
            width: 100%;
          }
          /* Overrides the rule above just for the hero: keeps its two CTAs
             side by side (instead of stacking to two rows) so the hero
             still fits one screen height on the smallest phones. */
          .hero-actions .btn {
            width: auto;
            flex: 1 1 0;
          }
          .hero-copy {
            padding: 24px 20px;
          }
          .hero h1 {
            font-size: clamp(28px, 12vw, 44px);
          }
          .hero-editorial {
            inset: 20px;
          }
          .hero-editorial-card {
            left: 20px;
            right: 20px;
            bottom: 20px;
            padding: 24px;
          }
          .dark-feature .wrap {
            padding-top: 70px;
            padding-bottom: 70px;
          }
          .dark-feature-item {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .closing-actions {
            display: grid;
          }
        }

        :global(.lab-splash-media) {
          width: 100%;
          height: 100%;
          object-fit: cover !important;
          display: block;
        }

        @keyframes lab-media-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      </div>
    </>
  );
}