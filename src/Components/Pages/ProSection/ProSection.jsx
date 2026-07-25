"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { MEDIA_URL } from "../../API/API";

// Ported 1:1 from the navPro mockup (httpswww.website-dev.biogance.comnavPro(1).html)
// — same fonts/colors/layout, scoped to this component via styled-jsx so it
// never leaks into (or gets overridden by) the site's global Tailwind/Inter
// styles. The mockup's own header/promo-bar/footer are dropped entirely in
// favor of the site's real Navbar/Footer; the in-page "choose your path /
// resellers / partners / catalogues / apply" quick-links bar is kept since
// it's this page's own section navigation, not global site nav.

// PageLoader's callSplashApi() saves the splash response's `data` object
// (not the {status,data,action} wrapper) straight into localStorage, so
// pro_header/pro_footer sit at the top level — see PageLoader.jsx. Re-reads
// on "splashDataReady" (fired on every click, see PageLoader.jsx) in case
// this component mounted before that first fetch landed.
function useSplashMedia(key) {
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

// Fills the visual placeholder (hero-visual / editorial-visual) with
// whatever admin uploaded for that slot — image or video, either is valid
// per the API shape ({ media, media_type: "image" | "video" }).
function SplashMedia({ data }) {
  const [loaded, setLoaded] = useState(false);
  if (!data?.media) return null;
  const src = `${MEDIA_URL}${data.media}`;
  const mediaStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    opacity: loaded ? 1 : 0,
    transition: "opacity 0.5s ease",
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
              animation: "pro-media-spin 0.8s linear infinite",
            }}
          />
        </div>
      )}
      {data.media_type === "video" ? (
        <video
          className="pro-splash-media"
          src={src}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setLoaded(true)}
          style={mediaStyle}
        />
      ) : (
        <img className="pro-splash-media" src={src} alt="" onLoad={() => setLoaded(true)} style={mediaStyle} />
      )}
    </>
  );
}

export default function ProSection() {
  const heroMedia = useSplashMedia("pro_header");
  const footerVisualMedia = useSplashMedia("pro_footer");

  // "Choose your route" / "Download catalogue" are plain #hash anchors —
  // without this they jump instantly. Scoped to this page's lifetime
  // (reverted on unmount) rather than touching global CSS, since no other
  // page in the app uses in-page anchor links like this.
  useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = prev;
    };
  }, []);

  return (
    <div className="pro-landing">
      <Navbar bgWhite={true} />

      <div className="pro-page-offset">
      

        <main className="page-shell">
          {/* HERO */}
          <section className="hero">
            <div className="hero-copy">
              <div>
                <span className="eyebrow">Biogance Professional</span>
                <h1>
                  <span>The</span>
                  <span>Professional</span>
                  <span>Universe.</span>
                </h1>
                <p className="hero-lead">
                  A dedicated space for retailers, distributors, grooming
                  salons, ambassadors and expert partners who want to bring
                  naturally inspired, French-made pet care closer to their
                  communities.
                </p>
                <div className="hero-actions">
                  <a className="btn" href="#choose">
                    Choose your route
                  </a>
                  <a className="btn secondary" href="#catalogues">
                    Download catalogue
                  </a>
                </div>
              </div>
              <div className="hero-meta" aria-label="Biogance professional highlights">
                <div className="meta-item">
                  <strong>2008</strong>
                  <span>Founded in Angers, France</span>
                </div>
                <div className="meta-item">
                  <strong>40+</strong>
                  <span>Countries worldwide</span>
                </div>
                <div className="meta-item">
                  <strong>2</strong>
                  <span>Professional routes</span>
                </div>
              </div>
            </div>
            <div
              className={`hero-visual${heroMedia?.media ? " has-media" : ""}`}
              aria-label="Editorial professional visual placeholder"
            >
              <SplashMedia data={heroMedia} />
              <div className="hero-card">
                <div className="kicker-row">
                  <span>Professional care</span>
                  <span className="dot" />
                  <span>Sales support</span>
                </div>
                <div className="hero-card-title">One network. Many ways to grow.</div>
                <div className="seal-grid">
                  <div className="seal">
                    <strong>Resellers</strong>
                    <span>Access B2B terms, catalogues and sales support.</span>
                  </div>
                  <div className="seal">
                    <strong>Partners</strong>
                    <span>Share expert content and build meaningful collaborations.</span>
                  </div>
                  <div className="seal">
                    <strong>Ekinat</strong>
                    <span>Dedicated opportunities for the equestrian world.</span>
                  </div>
                  <div className="seal">
                    <strong>Biogance</strong>
                    <span>Pet care routines for dogs, cats and companion animals.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ROUTE SECTION */}
          <section className="route-section" id="choose">
            <div className="section-head refined-head">
              <div>
                <span className="eyebrow">Choose your professional route</span>
                <h2 style={{ marginTop:"30px" }} className="section-title">One space. Two clear paths.</h2>
              </div>
              <p className="section-intro">
                Select the application page that matches your project.
                Whether you want to distribute Biogance products or join our
                brand adventure as a partner, each route has its own
                dedicated form and team review.
              </p>
            </div>

            <div className="route-choice-grid" aria-label="Professional application routes">
              <article className="route-choice-card reseller-card" id="reseller-route">
                <div className="route-card-top">
                  <span className="route-label">Route 01</span>
                  <span className="route-code">B2B</span>
                </div>
                <div className="route-card-main">
                  <div className="kicker-row">
                    <span>Sales access</span>
                    <span className="dot" />
                    <span>Professional account</span>
                  </div>
                  <h3 style={{ marginTop:"20px" }}>Resellers &amp; distributors.</h3>
                  <p>
                    For retailers, distributors, grooming salons, pharmacies,
                    concept stores and online sellers who want to offer
                    Biogance products to their customers.
                  </p>
                </div>
                <div className="route-card-bottom">
                  <ul>
                    <li>Professional information</li>
                    <li>Sales team follow-up</li>
                    <li>Catalogue access</li>
                  </ul>
                  <Link style={{ backgroundColor:"black",  color: "white", padding: "10px 20px" }} className="btn" href="/become-a-reseller">
                    Access reseller form
                  </Link>
                </div>
              </article>

              <article className="route-choice-card partner-card" id="partner-route">
                <div className="route-card-top">
                  <span className="route-label">Route 02</span>
                  <span className="route-code">AMB</span>
                </div>
                <div className="route-card-main">
                  <div className="kicker-row">
                    <span>Community</span>
                    <span className="dot" />
                    <span>Brand adventure</span>
                  </div>
                  <h3 style={{ marginTop:"20px" }}>Partners &amp; ambassadors.</h3>
                  <p>
                    For creators, YouTubers, breeders, clubs, groomers,
                    veterinarians, behaviourists, educators and Ekinat
                    equestrian profiles ready to share their expertise.
                  </p>
                </div>
                <div className="route-card-bottom">
                  <ul>
                    <li>Biogance or Ekinat universe</li>
                    <li>Expert voice &amp; content</li>
                    <li>Marketing team review</li>
                  </ul>
                  <Link style={{ backgroundColor:"white",  color: "black", padding: "10px 20px" }} className="btn" href="/become-an-ambassador">
                    Access partner form
                  </Link>
                </div>
              </article>
            </div>

            <div className="route-note-bar">
              <span>Applications are reviewed by the Biogance team.</span>
              <span>
                Choose the route first — the dedicated page will collect the
                right information.
              </span>
            </div>
          </section>

          {/* SIGNATURE CARDS */}
          <section className="signature-section" id="resellers">
            <div className="section-head">
              <div>
                <span className="eyebrow">Why join the network</span>
                <h2 style={{ marginTop:"30px", fontSize:"clamp(34px, 5vw, 69px)" }} className="section-title">Built for professionals.</h2>
              </div>
              <p className="section-intro">
                Biogance supports professional clients with clear product
                information, sales resources and a brand universe designed
                to be easy to explain, recommend and display.
              </p>
            </div>
            <div className="signature-grid">
              <article className="signature-card">
                <div>
                  <span>01</span>
                  <h3 style={{ fontWeight: "bold", marginTop: "20px" }}>French-made expertise</h3>
                </div>
                <p>
                  Products developed with a laboratory approach and a strong
                  commitment to quality and traceability.
                </p>
              </article>
              <article className="signature-card">
                <div>
                  <span>02</span>
                  <h3 style={{ fontWeight: "bold", marginTop: "20px" }}>Natural pet care</h3>
                </div>
                <p>
                  Routines inspired by nature and designed for dogs, cats,
                  horses and companion animals.
                </p>
              </article>
              <article className="signature-card">
                <div>
                  <span>03</span>
                  <h3 style={{ fontWeight: "bold", marginTop: "20px" }}>Commercial support</h3>
                </div>
                <p>
                  A dedicated team reviews each request and guides
                  professionals through the next steps.
                </p>
              </article>
              <article className="signature-card">
                <div>
                  <span>04</span>
                  <h3 style={{ fontWeight: "bold", marginTop: "20px" }}>Brand material</h3>
                </div>
                <p>
                  Catalogues, visuals, POS assets and product information to
                  help activate the brand in-store and online.
                </p>
              </article>
            </div>
          </section>

          {/* SPLIT EDITORIAL */}
          <section className="editorial-split" id="partners">
            <div className="editorial-copy">
              <span className="eyebrow">Partners &amp; ambassadors</span>
              <h2 style={{ fontSize: "clamp(34px, 5vw, 80px)", marginTop: "30px" , lineHeight: "1", fontWeight: "bold"}}>More than a collaboration.</h2>
              <p className="section-intro">
                Joining Biogance or Ekinat as a partner means taking part in
                a human adventure: sharing your expertise, your daily life
                and your vision of animal care while actively supporting the
                development of the brand.
              </p>
              <div className="steps">
                <div className="step">
                  <div className="step-number">01</div>
                  <div className="step-content">
                    <strong>Choose your universe</strong>
                    <p>
                      Biogance for pet care, Ekinat for the equestrian world,
                      or a custom project if your idea is unique.
                    </p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">02</div>
                  <div className="step-content">
                    <strong>Share your profile</strong>
                    <p>
                      Tell us about your audience, your expertise, your
                      content style and the animals you work with.
                    </p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">03</div>
                  <div className="step-content">
                    <strong>Build with the brand</strong>
                    <p>
                      Our Marketing team studies every application and comes
                      back with the most relevant next step.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className={`editorial-visual${footerVisualMedia?.media ? " has-media" : ""}`}>
              <SplashMedia data={footerVisualMedia} />
              <div className="visual-label">
                <div>
                  <strong>Partner journey</strong>
                  <br />
                  <span>
                    Creators · Breeders · Clubs · Groomers · Experts ·
                    Veterinarians · YouTubers
                  </span>
                </div>
                <div className="mark">Pro</div>
              </div>
            </div>
          </section>

          {/* RESOURCE BAND */}
          <section className="resource-band" id="catalogues">
            <div>
              <span className="eyebrow" style={{ color: "rgba(255,255,255,.7)" }}>
                Professional resources
              </span>
              <h2 style={{ fontSize: "clamp(34px, 5vw, 72px)", marginTop: "20px" , lineHeight: "1", fontWeight: "bold"}} className="section-title">Your professional starting point.</h2>
              <p>
                Download the product catalogue, choose your professional
                route and continue to the dedicated application page that
                fits your business or partnership project.
              </p>
            </div>
            <div className="resource-list">
              <div className="resource-item">
                <div>
                  <strong>Biogance professional catalogue</strong>
                  <span>
                    Product ranges, routines and key information for
                    professional buyers.
                  </span>
                </div>
                <a className="tiny-link" href="/biogance-professional-catalogue.pdf">
                  Download
                </a>
              </div>
              <div className="resource-item">
                <div>
                  <strong>Reseller application</strong>
                  <span>
                    For pet shops, pharmacies, grooming salons, distributors
                    and concept stores.
                  </span>
                </div>
                <Link className="tiny-link" href="/become-a-reseller">
                  Apply
                </Link>
              </div>
              <div className="resource-item">
                <div>
                  <strong>Partner application</strong>
                  <span>
                    For creators, clubs, breeders, experts, YouTubers and
                    equestrian profiles.
                  </span>
                </div>
                <Link className="tiny-link" href="/become-an-ambassador">
                  Apply
                </Link>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="final-cta" id="apply">
            <div>
              <span className="eyebrow">Stay close</span>
              <h2 style={{fontWeight:"bold"}}>Follow the Biogance universe.</h2>
              <p>
                While our teams review professional and partnership
                applications, discover our latest routines, expert advice,
                product launches and community stories.
              </p>
            </div>
            <div className="social-row">
              <a href="https://www.instagram.com/bioganceofficiel" target="_blank" rel="noreferrer">
                Instagram
              </a>
              <a href="https://www.facebook.com/bioganceofficiel" target="_blank" rel="noreferrer">
                Facebook
              </a>
              <a href="https://youtube.com/@bioganceofficiel?si=IJV8iaJ1YTgSos8z" target="_blank" rel="noreferrer">
                YouTube
              </a>
              <a href="https://www.tiktok.com/@bioganceofficiel" target="_blank" rel="noreferrer">
                TikTok
              </a>
            </div>
          </section>
        </main>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes pro-media-spin {
          to {
            transform: rotate(360deg);
          }
        }
        /* SplashMedia is its own component function, so its <img>/<video>
           never receive this file's styled-jsx scope attribute — :global()
           is required here or these rules silently never match anything.
           On small/mobile screens the hero-visual/editorial-visual boxes
           go tall and narrow (single-column stack), so object-fit:cover
           was cropping hard into just the center of the photo — contain
           keeps the whole image visible there instead, at the cost of
           some letterboxing (the existing gradient shows through the gaps). */
        :global(.pro-splash-media) {
          object-fit: cover;
        }
        @media (max-width: 860px) {
          :global(.pro-splash-media) {
            object-fit: cover;
          }
        }
        .pro-landing {
          --black: #111111;
          --ink: #1d1d1d;
          --charcoal: #2b2b2b;
          --white: #ffffff;
          --paper: #f7f7f4;
          --stone: #efefeb;
          --stone-2: #e6e6e0;
          --line: #d8d8d2;
          --soft-line: #e9e9e3;
          --muted: #686868;
          --muted-2: #9b9b96;
          --sage: #eef2ec;
          --green: #5d7a62;
          --max: 1440px;
          --sans: Arial, Helvetica, sans-serif;

          overflow-x: hidden;
          font-family: var(--sans);
          color: var(--ink);
          background: var(--paper);
          -webkit-font-smoothing: antialiased;
          text-rendering: geometricPrecision;
          letter-spacing: -0.01em;
        }
        .pro-landing :global(a) {
          color: inherit;
          text-decoration: none;
        }
        .pro-landing button,
        .pro-landing input,
        .pro-landing select,
        .pro-landing textarea {
          font: inherit;
        }
        .pro-landing p,
        .pro-landing h1,
        .pro-landing h2,
        .pro-landing h3,
        .pro-landing h4 {
          margin-top: 0;
        }

        /* Navbar is fixed (104px desktop / 64px mobile) — same offset used
           across the rest of the site (see ExpertAdvicesDetail.jsx etc). */
        .pro-page-offset {
          padding-top: 104px;
        }
        @media (max-width: 1023px) {
          .pro-page-offset {
            padding-top: 64px;
          }
        }

        /* So the smooth-scrolled section lands below the fixed Navbar
           instead of having its top edge tucked underneath it. */
        #choose,
        #resellers,
        #partners,
        #catalogues,
        #apply {
          scroll-margin-top: 104px;
        }
        @media (max-width: 1023px) {
          #choose,
          #resellers,
          #partners,
          #catalogues,
          #apply {
            scroll-margin-top: 64px;
          }
        }

        .pro-subnav {
          height: 34px;
          border-bottom: 1px solid var(--soft-line);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 34px;
          padding: 0 18px;
          overflow: auto hidden;
          background: var(--white);
          color: #707070;
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* COMPONENTS */
        .page-shell {
          max-width: full;
          margin: 0 auto;
          background: var(--paper);
        }
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: var(--muted);
          font-size: 10px;
          letter-spacing: 0.24em;
          line-height: 1.3;
          text-transform: uppercase;
        }
        .eyebrow::before {
          content: "";
          width: 36px;
          height: 1px;
          background: var(--ink);
          display: inline-block;
        }
        .btn {
          appearance: none;
          border: 1px solid var(--ink);
          background: var(--ink);
          color: white;
          height: 48px;
          min-width: 170px;
          padding: 0 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 10px;
          font-weight: 700;
          transition: background 0.22s ease, color 0.22s ease,
            border-color 0.22s ease, transform 0.22s ease;
        }
        .btn:hover {
          transform: translateY(-1px);
        }
        .btn.secondary {
          background: transparent;
          color: var(--ink);
        }
        .btn.secondary:hover {
          background: var(--ink);
          color: var(--white);
        }

        .kicker-row {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--muted-2);
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          line-height: 1.4;
        }
        .kicker-row .dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--muted-2);
        }

        /* HERO */
        .hero {
          min-height: calc(100vh - 106px);
          border-left: 1px solid var(--line);
          border-right: 1px solid var(--line);
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(420px, 1.08fr);
          background: var(--paper);
        }
        .hero-copy {
          padding: 72px clamp(24px, 5vw, 74px) 66px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;
          border-right: 1px solid var(--line);
        }
        .hero h1 {
          margin: 42px 0 26px;
          max-width: 660px;
          font-size: clamp(38px, 4.6vw, 70px);
          line-height: 1;
          letter-spacing: -0.055em;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--ink);
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .hero h1 span {
          display: block;
            
        }
        .hero-lead {
          max-width: 590px;
          margin: 0 0 34px;
          color: #333;
          font-size: 17px;
          line-height: 1.75;
          letter-spacing: -0.015em;
        }
        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          color: var(--white);
        }
        .hero-meta {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border: 1px solid var(--line);
          margin-top: 64px;
        }
        .meta-item {
          padding: 18px 20px;
          border-right: 1px solid var(--line);
        }
        .meta-item:last-child {
          border-right: 0;
        }
        .meta-item strong {
          display: block;
          margin-bottom: 8px;
          font-size: 19px;
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: -0.04em;
        }
        .meta-item span {
          display: block;
          color: var(--muted);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          line-height: 1.6;
        }

        .hero-visual {
          position: relative;
          overflow: hidden;
          min-height: 620px;
          background: radial-gradient(
              circle at 50% 36%,
              rgba(255, 255, 255, 0.95) 0 8%,
              rgba(255, 255, 255, 0.58) 9% 18%,
              rgba(230, 230, 226, 0.84) 19% 43%,
              rgba(207, 207, 202, 0.9) 44% 100%
            ),
            linear-gradient(135deg, #f5f5f2 0%, #d9d9d4 100%);
        }
        .hero-visual::before {
          content: "";
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.28) 0 1px,
              transparent 1px 22px
            ),
            linear-gradient(90deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0));
          opacity: 0.76;
        }
        /* Real admin-uploaded media (splashData.pro_header/pro_footer)
           replaces the placeholder gradient look — the decorative diagonal
           texture line would otherwise sit on top of a real photo/video. */
        .hero-visual.has-media::before,
        .editorial-visual.has-media::before {
          display: none;
        }
        .hero-card {
          position: absolute;
          left: clamp(28px, 5vw, 76px);
          right: clamp(28px, 5vw, 76px);
          bottom: clamp(32px, 6vw, 82px);
          padding: 30px;
          border: 1px solid rgba(17, 17, 17, 0.18);
          background: rgba(255, 255, 255, 0.42);
          backdrop-filter: blur(18px);
        }
        .hero-card-title {
          margin: 20px 0 42px;
          font-size: clamp(30px, 3.8vw, 56px);
          line-height: 1;
          letter-spacing: -0.07em;
          text-transform: uppercase;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .seal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border: 1px solid rgba(17, 17, 17, 0.22);
        }
        .seal {
          min-height: 92px;
          padding: 18px;
          border-right: 1px solid rgba(17, 17, 17, 0.22);
          border-bottom: 1px solid rgba(17, 17, 17, 0.22);
        }
        .seal:nth-child(2n) {
          border-right: 0;
        }
        .seal:nth-child(n + 3) {
          border-bottom: 0;
        }
        .seal strong {
          display: block;
          margin-bottom: 10px;
          font-size: 10px;
          letter-spacing: 0.19em;
          text-transform: uppercase;
        }
        .seal span {
          display: block;
          color: #555;
          font-size: 13px;
          line-height: 1.5;
        }

        /* ROUTE SECTION */
        .route-section {
          border-left: 1px solid var(--line);
          border-right: 1px solid var(--line);
          border-top: 1px solid var(--line);
          padding: 72px clamp(22px, 5vw, 72px);
          background: var(--white);
        }
        .section-head {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 52px;
          align-items: end;
          margin-bottom: 42px;
        }
        .section-title {
          margin: 22px 0 0;
          font-size: clamp(34px, 4.6vw, 80px);
          line-height: 1;
          font-weight: 700;
          letter-spacing: -0.06em;
          text-transform: uppercase;
          max-width: 700px;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .section-intro {
          color: #3d3d3d;
          font-size: 16px;
          line-height: 1.75;
          max-width: 630px;
          margin: 0;
        }

        .refined-head .section-title {
          max-width: 760px;
        }
        .route-choice-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-top: 34px;
        }
        .route-choice-card {
          min-height: 560px;
          border: 1px solid var(--line);
          background: var(--paper);
          padding: 34px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease,
            background 0.25s ease, color 0.25s ease;
        }
        .route-choice-card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(
              circle at 80% 12%,
              rgba(255, 255, 255, 0.92) 0 8%,
              transparent 8.5% 31%
            ),
            repeating-linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.55) 0 1px,
              transparent 1px 20px
            );
          opacity: 0.72;
        }
        .route-choice-card > :global(*) {
          position: relative;
          z-index: 1;
        }
        .route-choice-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.07);
        }
        .route-choice-card.partner-card {
          background: #171717;
          color: #fff;
        }
        .route-choice-card.partner-card::before {
          background: radial-gradient(
              circle at 82% 14%,
              rgba(255, 255, 255, 0.12) 0 9%,
              transparent 9.5% 33%
            ),
            repeating-linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.055) 0 1px,
              transparent 1px 20px
            );
          opacity: 1;
        }
        .route-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 46px;
        }
        .route-label {
          font-size: 10px;
          color: var(--muted);
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .route-code {
          min-width: 70px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--line);
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
          background: rgba(255, 255, 255, 0.5);
        }
        .partner-card .route-label,
        .partner-card .route-code {
          color: rgba(255, 255, 255, 0.58);
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.04);
        }
        .route-card-main :global(h3) {
          margin: 22px 0 22px;
          max-width: 620px;
          font-size: clamp(32px, 4.4vw, 75px);
          line-height: 0.98;
          letter-spacing: -0.06em;
          text-transform: uppercase;
          font-weight: 500;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .route-card-main :global(p) {
          max-width: 610px;
          margin: 0;
          color: #454545;
          font-size: 15px;
          line-height: 1.4;
        }
        .partner-card .route-card-main :global(p) {
          color: rgba(255, 255, 255, 0.72);
        }
        .route-card-bottom {
          margin-top: 54px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 26px;
          align-items: end;
          border-top: 1px solid var(--line);
          padding-top: 24px;
        }
        .partner-card .route-card-bottom {
          border-color: rgba(255, 255, 255, 0.18);
        }
        .route-card-bottom :global(ul) {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 12px;
        }
        .route-card-bottom :global(li) {
          color: #5d5d5d;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .partner-card .route-card-bottom :global(li) {
          color: rgba(255, 255, 255, 0.58);
        }
        .partner-card :global(.btn.secondary) {
          border-color: #fff;
          color: #111;
          background: #fff;
        }
        .partner-card :global(.btn.secondary:hover) {
          background: transparent;
          color: #fff;
        }
        .route-note-bar {
          margin-top: 18px;
          border: 1px solid var(--line);
          background: var(--white);
          display: flex;
          justify-content: space-between;
          gap: 22px;
          padding: 18px 22px;
          color: var(--muted);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          line-height: 1.55;
        }

        /* SIGNATURE CARDS */
        .signature-section {
          border-left: 1px solid var(--line);
          border-right: 1px solid var(--line);
          border-top: 1px solid var(--line);
          background: var(--paper);
          padding: 72px clamp(22px, 5vw, 72px);
        }
        .signature-grid {
          margin-top: 42px;
          display: grid;
          cursor: pointer;
          grid-template-columns: repeat(4, 1fr);
          border: 1px solid var(--line);
          background: var(--white);
        }
        .signature-card {
          min-height: 260px;
          padding: 30px;
          border-right: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: background 0.22s ease, color 0.22s ease;
        }
        .signature-card:last-child {
          border-right: 0;
        }
        .signature-card:hover {
          background: var(--black);
          color: var(--white);
        }
        .signature-card :global(span) {
          color: var(--muted-2);
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .signature-card :global(h3) {
          margin: 22px 0 16px;
          font-size: 26px;
          line-height: 1;
          letter-spacing: -0.06em;
          text-transform: uppercase;
        }
        .signature-card :global(p) {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.65;
        }
        .signature-card:hover :global(p),
        .signature-card:hover :global(span) {
          color: rgba(255, 255, 255, 0.68);
        }

        /* SPLIT EDITORIAL */
        .editorial-split {
          border-left: 1px solid var(--line);
          border-right: 1px solid var(--line);
          border-top: 1px solid var(--line);
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          background: var(--white);
        }
        .editorial-copy {
          padding: 72px clamp(22px, 5vw, 72px);
        }
        .editorial-copy h2 {
          margin: 20px 0 26px;
          font-size: clamp(34px, 5vw, 96px);
          line-height: 0.98;
          letter-spacing: -0.06em;
          text-transform: uppercase;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .steps {
          margin-top: 36px;
          border: 1px solid var(--line);
        }
        .step {
          display: grid;
          grid-template-columns: 86px 1fr;
          border-bottom: 1px solid var(--line);
        }
        .step:last-child {
          border-bottom: 0;
        }
        .step-number {
          padding: 20px;
          border-right: 1px solid var(--line);
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .step-content {
          padding: 20px;
        }
        .step-content strong {
          display: block;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: -0.04em;
        }
        .step-content p {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.6;
        }
        .editorial-visual {
          min-height: 620px;
          position: relative;
          overflow: hidden;
          border-left: 1px solid var(--line);
          background: radial-gradient(
              circle at 52% 38%,
              rgba(255, 255, 255, 0.92) 0 9%,
              rgba(239, 239, 235, 0.76) 10% 28%,
              rgba(215, 215, 210, 0.92) 29% 100%
            ),
            linear-gradient(135deg, #f5f5f2, #d2d2cc);
        }
        .editorial-visual::before {
          content: "";
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.45) 0 1px,
            transparent 1px 22px
          );
        }
        .visual-label {
          position: absolute;
          left: 36px;
          bottom: 36px;
          right: 36px;
          border: 1px solid rgba(17, 17, 17, 0.2);
          background: rgba(255, 255, 255, 0.48);
          backdrop-filter: blur(18px);
          padding: 22px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 18px;
          align-items: center;
        }
        .visual-label strong {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .visual-label span {
          color: var(--muted);
          font-size: 13px;
          line-height: 1.5;
        }
        .visual-label .mark {
          width: 56px;
          height: 56px;
          border: 1px solid var(--ink);
          display: grid;
          place-items: center;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        /* RESOURCE BAND */
        .resource-band {
          border-left: 1px solid var(--line);
          border-right: 1px solid var(--line);
          border-top: 1px solid var(--line);
          background: var(--black);
          color: var(--white);
          padding: 76px clamp(22px, 5vw, 72px);
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 54px;
          align-items: center;
        }
        .resource-band :global(.section-title) {
          color: var(--white);
          margin-top: 20px;
        }
        .resource-band p {
          color: rgba(255, 255, 255, 0.72);
          font-size: 15px;
          line-height: 1.75;
          max-width: 580px;
        }
        .resource-list {
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .resource-item {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 26px;
          align-items: center;
          padding: 24px 26px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.16);
        }
        .resource-item:last-child {
          border-bottom: 0;
        }
        .resource-item strong {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .resource-item span {
          color: rgba(255, 255, 255, 0.56);
          font-size: 13px;
          line-height: 1.55;
        }
        .tiny-link {
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          border-bottom: 1px solid currentColor;
          padding-bottom: 5px;
          white-space: nowrap;
        }

        /* CTA */
        .final-cta {
          border-left: 1px solid var(--line);
          border-right: 1px solid var(--line);
          border-top: 1px solid var(--line);
          background: var(--white);
          padding: 70px clamp(22px, 5vw, 72px) 78px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 30px;
          align-items: end;
        }
        .final-cta h2 {
          margin: 18px 0 0;
          font-size: clamp(34px, 5.2vw, 104px);
          line-height: 0.98;
          letter-spacing: -0.06em;
          text-transform: uppercase;
          max-width: 780px;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .final-cta p {
          max-width: 560px;
          margin: 24px 0 0;
          color: var(--muted);
          font-size: 15px;
          line-height: 1.7;
        }
        .social-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .social-row a {
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 18px;
          border: 1px solid var(--line);
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .social-row a:hover {
          background: var(--ink);
          color: var(--white);
          border-color: var(--ink);
        }

        /* Small/medium screens (small MacBook Air/Pro widths, tablets,
           phones) — gentler heading sizes than the desktop clamp()s above,
           which are tuned for wide screens and were left untouched there.
           Kept as its own pass so it doesn't touch anything above 1440px. */
        @media (max-width: 1440px) {
          .hero h1 {
            font-size: clamp(34px, 4vw, 58px);
          }
          .hero-card-title {
            font-size: clamp(26px, 3.2vw, 46px);
          }
          .section-title {
            font-size: clamp(28px, 3.8vw, 58px);
          }
          .route-card-main :global(h3) {
            font-size: clamp(26px, 3.6vw, 52px);
          }
          .editorial-copy h2 {
            font-size: clamp(28px, 4vw, 60px);
          }
          .final-cta h2 {
            font-size: clamp(28px, 4vw, 62px);
          }
        }

        @media (max-width: 1180px) {
          .hero {
            grid-template-columns: 1fr;
          }
          .hero-copy {
            border-right: 0;
            border-bottom: 1px solid var(--line);
          }
          .hero-visual {
            /* Was 520px — shorter than the hero-card's actual content
               height (~578px measured on a 390px-wide phone: kicker-row +
               title + the 2x2 seal-grid), so overflow:hidden was clipping
               the card's top (the heading text) off. Tall enough now to
               clear card height + its bottom offset with room to spare. */
            min-height: 680px;
          }
          .signature-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .signature-card:nth-child(2) {
            border-right: 0;
          }
          .signature-card:nth-child(-n + 2) {
            border-bottom: 1px solid var(--line);
          }
          .resource-band {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 860px) {
          .pro-subnav {
            justify-content: flex-start;
          }
          .hero h1 {
            font-size: clamp(30px, 9vw, 52px);
          }
          .hero-meta {
            grid-template-columns: 1fr;
          }
          .meta-item {
            border-right: 0;
            border-bottom: 1px solid var(--line);
          }
          .meta-item:last-child {
            border-bottom: 0;
          }
          .section-head {
            grid-template-columns: 1fr;
            gap: 24px;
            align-items: start;
          }
          .editorial-split {
            grid-template-columns: 1fr;
          }
          .editorial-visual {
            border-left: 0;
            border-top: 1px solid var(--line);
            min-height: 460px;
          }
          .final-cta {
            grid-template-columns: 1fr;
          }
          .social-row {
            justify-content: flex-start;
          }
        }
        @media (max-width: 980px) {
          .route-choice-grid {
            grid-template-columns: 1fr;
          }
          .route-choice-card {
            min-height: 480px;
          }
          .route-card-bottom {
            grid-template-columns: 1fr;
          }
          .route-note-bar {
            flex-direction: column;
          }
        }
        @media (max-width: 560px) {
          .hero-copy,
          .route-section,
          .signature-section,
          .editorial-copy,
          .resource-band,
          .final-cta {
            padding-left: 20px;
            padding-right: 20px;
          }
          .hero-actions,
          .path-actions {
            display: grid;
            grid-template-columns: 1fr;
            width: 100%;
          }
          .btn {
            width: 100%;
          }
          .hero-card {
            left: 20px;
            right: 20px;
            padding: 22px;
          }
          .seal-grid {
            grid-template-columns: 1fr;
          }
          .seal,
          .seal:nth-child(2n),
          .seal:nth-child(n + 3) {
            border-right: 0;
            border-bottom: 1px solid rgba(17, 17, 17, 0.22);
          }
          .seal:last-child {
            border-bottom: 0;
          }
          .signature-grid {
            grid-template-columns: 1fr;
          }
          .signature-card,
          .signature-card:nth-child(2) {
            border-right: 0;
            border-bottom: 1px solid var(--line);
          }
          .signature-card:last-child {
            border-bottom: 0;
          }
          .resource-item {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
