"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LuLayoutDashboard } from "react-icons/lu";
import { TbNotes } from "react-icons/tb";
import { RxRocket } from "react-icons/rx";
import { FaRegHeart } from "react-icons/fa";
import {
  IoLocationOutline,
  IoPersonOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { BsArrowBarLeft } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import { MEDIA_URL } from "../../API/API";

const FONT_SANS = "'Outfit', system-ui, -apple-system, 'Segoe UI', sans-serif";
const FONT_SERIF = "'Instrument Serif', Georgia, serif";
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap";

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

// Sections of the account area, grouped the way people scan them: what you
// buy, who you are, and where to get help. `img` items use an SVG from /public
// (tinted through CSS filters so they follow the active/inactive colour).
export const ACCOUNT_NAV = [
  {
    id: "shop",
    label: "groupShop",
    items: [
      { key: "dashboard", label: "dashboard", Icon: LuLayoutDashboard },
      { key: "orders", label: "orders", Icon: TbNotes },
      { key: "favorites", label: "favorites", Icon: FaRegHeart },
      { key: "loyalty", label: "loyalty", Icon: RxRocket },
    ],
  },
  {
    id: "account",
    label: "groupAccount",
    items: [
      { key: "profile", label: "profile", Icon: IoPersonOutline },
      { key: "pet", label: "petProfile", img: "/pet.svg" },
      { key: "addresses", label: "addresses", Icon: IoLocationOutline },
      { key: "settings", label: "settings", Icon: IoSettingsOutline },
    ],
  },
  {
    id: "help",
    label: "groupHelp",
    items: [{ key: "support", label: "support", img: "/refund.svg" }],
  },
];

export const ACCOUNT_NAV_ITEMS = ACCOUNT_NAV.flatMap((g) => g.items);

// The signed-in user (name / email / picture) as cached in splashData.
function useAccountUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const read = () => {
      try {
        setUser(
          JSON.parse(localStorage.getItem("splashData") || "null")?.user ||
            null,
        );
      } catch {
        setUser(null);
      }
    };
    const id = setTimeout(read, 0);
    window.addEventListener("splashDataReady", read);
    window.addEventListener("storage", read);
    return () => {
      clearTimeout(id);
      window.removeEventListener("splashDataReady", read);
      window.removeEventListener("storage", read);
    };
  }, []);
  return user;
}

const initialsOf = (name) =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("") || "•";

function NavIcon({ item, active, dark = false }) {
  if (item.Icon) return <item.Icon className="w-[17px] h-[17px] shrink-0" />;
  // /public SVGs are black; flip to white on the dark panel unless the row is
  // the active one.
  return (
    <img
      src={item.img}
      alt=""
      className={`w-[17px] h-[17px] shrink-0 brightness-0 transition-[filter,opacity] duration-300 ${
        dark ? (active ? "invert" : "invert opacity-70") : ""
      }`}
    />
  );
}

// Identity block — avatar, greeting, name in serif italic, email.
function UserCard({ user, t }) {
  const name = user?.name || t("guest");
  return (
    <div className="flex flex-col gap-5">
      <span className="relative grid place-items-center w-[72px] h-[72px] overflow-hidden bg-white text-[#0b0b0a] text-[24px] font-semibold tracking-[0.04em] ring-1 ring-white/30 ring-offset-4 ring-offset-[#0b0b0a]">
        {user?.profile_picture ? (
          <img
            src={`${MEDIA_URL}${user.profile_picture}`}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          initialsOf(user?.name)
        )}
      </span>
      <div className="min-w-0 -mb-5">
        <p className="m-0 mb-1.5 text-[10px] font-medium tracking-[0.34em] uppercase text-white/45">
          {t("hello")}
        </p>
        <p
          className="m-0 truncate text-[30px] leading-[1.05] italic text-white"
          style={{ fontFamily: FONT_SERIF }}
        >
          {name}
        </p>
        {/* {user?.email && (
          <p className="truncate text-[12px] tracking-[0.02em] text-white/50">{user.email}</p>
        )} */}
      </div>
    </div>
  );
}

// The list of sections. A single white-bordered box slides between rows to mark the
// active one (positioned by writing to the DOM directly — no re-renders).
function NavList({ activeItem, onSelect, t }) {
  const navRef = useRef(null);
  const hlRef = useRef(null);
  const rowRefs = useRef({});

  const place = useCallback(() => {
    const row = rowRefs.current[activeItem];
    const hl = hlRef.current;
    if (!row || !hl) return;
    hl.style.height = `${row.offsetHeight}px`;
    hl.style.transform = `translateY(${row.offsetTop}px)`;
    hl.style.opacity = "1";
  }, [activeItem]);

  useEffect(() => {
    place();
  }, [place]);

  useEffect(() => {
    window.addEventListener("resize", place);
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(place) : null;
    if (ro && navRef.current) ro.observe(navRef.current);
    document.fonts?.ready?.then(place).catch(() => {});
    return () => {
      window.removeEventListener("resize", place);
      ro?.disconnect();
    };
  }, [place]);

  return (
    <nav ref={navRef} aria-label={t("menu")} className="relative">
      <span
        ref={hlRef}
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 border border-white box-border opacity-0 transition-[transform,height,opacity] duration-500 ease-[cubic-bezier(.2,.7,.2,1)]"
      />
      {ACCOUNT_NAV.map((group) => (
        <div key={group.id} className="mt-6 first:mt-0">
          <p className="m-0 mb-2 flex items-center gap-3 text-[10px] font-medium tracking-[0.3em] uppercase text-white/35">
            <span>{t(group.label)}</span>
            <span className="flex-1 h-px bg-white/10" />
          </p>
          <ul className="m-0 p-0 list-none">
            {group.items.map((item) => {
              const active = activeItem === item.key;
              return (
                <li key={item.key}>
                  <button
                    ref={(el) => {
                      rowRefs.current[item.key] = el;
                    }}
                    type="button"
                    onClick={() => onSelect(item.key)}
                    aria-current={active ? "page" : undefined}
                    className={`group relative w-full h-12 px-4 flex items-center gap-3.5 bg-transparent border-0 cursor-pointer text-[14px] tracking-[0.01em] transition-colors duration-300 ${
                      active
                        ? "text-white font-semibold"
                        : "text-white/75 font-normal hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <NavIcon item={item} active={active} dark />
                    <span className="flex-1 min-w-0 truncate text-left">
                      {t(item.label)}
                    </span>
                    {/* <span
                      aria-hidden="true"
                      className={`text-[10px] tabular-nums tracking-[0.18em] transition-opacity duration-300 ${
                        active ? "opacity-50" : "opacity-30 group-hover:opacity-60"
                      }`}
                    >
                      {String(ACCOUNT_NAV_ITEMS.indexOf(item) + 1).padStart(2, "0")}
                    </span> */}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

// Styled to match the nav rows in NavList exactly (same height, padding,
// icon size, hover state) so it reads as a continuation of the list rather
// than a separate button.
function LogoutButton({ onClick, t }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full h-12 px-4 flex items-center gap-3.5 bg-transparent border-0 cursor-pointer text-[14px] tracking-[0.01em] text-white/75 font-normal transition-colors duration-300 hover:text-white hover:bg-white/[0.06]"
    >
      <BsArrowBarLeft className="w-[17px] h-[17px] shrink-0" />
      <span className="flex-1 min-w-0 truncate text-left">{t("logout")}</span>
    </button>
  );
}

// The dark panel itself (desktop sidebar).
function Panel({
  activeItem,
  onSelect,
  onLogout,
  t,
  user,
  className = "",
  children,
}) {
  return (
    <div
      className={`relative overflow-hidden bg-[#0b0b0a] text-white flex flex-col ${className}`}
      style={{ fontFamily: FONT_SANS }}
    >
      <link rel="stylesheet" href={FONT_HREF} precedence="default" />

      {/* Atmosphere: soft top glow + grain */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-24 w-[420px] h-[420px] opacity-[0.14] bg-[radial-gradient(circle,#fff,transparent_65%)] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: GRAIN }}
      />

      <div className="relative flex-1 min-h-0 flex flex-col">
        {children}
        {/* The identity card, the list, and Log out all scroll together — Log
            out sits right under the last nav group (Help & support) instead
            of being pinned to the panel's bottom edge. */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain ac-noscroll">
          <div className="px-7 pt-8">
            <UserCard user={user} t={t} />
          </div>
          <div className="mx-7 h-px bg-white/10" />
          <div className="px-3 pt-6 pb-4">
            <NavList activeItem={activeItem} onSelect={onSelect} t={t} />
            <LogoutButton onClick={onLogout} t={t} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Desktop (lg+) sidebar.
export function Sidebar({ activeItem, onItemClick, onDelete }) {
  const { t } = useTranslation("sidebar");
  const user = useAccountUser();
  return (
    <Panel
      activeItem={activeItem}
      onSelect={onItemClick}
      onLogout={onDelete}
      t={t}
      user={user}
      className="h-full w-full"
    />
  );
}

// Mobile / tablet (< lg): no drawer — the menu icon already lives in the
// site Navbar. Instead: a short identity strip, then the account sections
// as a sticky, horizontally scrollable row of tabs (the active one in ink
// and kept scrolled into view), with Log out at the end of the row.
export function MobileAccountNav({ activeItem, onItemClick, onDelete }) {
  const { t } = useTranslation("sidebar");
  const user = useAccountUser();
  const rowRef = useRef(null);
  const tabRefs = useRef({});
  const name = user?.name || t("guest");

  // Keep the active tab centred in the row (also after a tab is picked).
  useEffect(() => {
    const row = rowRef.current;
    const tab = tabRefs.current[activeItem];
    if (!row || !tab) return;
    row.scrollTo({
      left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [activeItem]);

  return (
    // display:contents so the sticky tab bar sticks against the whole page,
    // not just this short wrapper.
    <div className="contents lg:hidden" style={{ fontFamily: FONT_SANS }}>
      <link rel="stylesheet" href={FONT_HREF} precedence="default" />

      {/* Identity strip */}
      <div className="relative overflow-hidden bg-[#0b0b0a] px-4 py-4 text-white sm:px-6 sm:py-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
          style={{ backgroundImage: GRAIN }}
        />
        <div className="relative flex items-center gap-3.5">
          <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden bg-white text-[15px] font-semibold tracking-[0.04em] text-[#0b0b0a] sm:h-12 sm:w-12">
            {user?.profile_picture ? (
              <img
                src={`${MEDIA_URL}${user.profile_picture}`}
                alt={name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              initialsOf(user?.name)
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[9px] font-medium uppercase tracking-[0.3em] text-white/45">
              {t("hello")}
            </p>
            <p
              className="m-0 truncate text-[22px] italic leading-[1.1] text-white sm:text-[24px]"
              style={{ fontFamily: FONT_SERIF }}
            >
              {name}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky tabs — sit right under the fixed site header (104px) */}
      <div className="sticky top-[104px] z-30 border-b border-black/10 bg-[#f3f3f3]/95 backdrop-blur-md">
        <nav
          ref={rowRef}
          aria-label={t("menu")}
          className="ac-noscroll flex items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6"
        >
          {ACCOUNT_NAV_ITEMS.map((item) => {
            const active = activeItem === item.key;
            return (
              <button
                key={item.key}
                ref={(el) => {
                  tabRefs.current[item.key] = el;
                }}
                type="button"
                onClick={() => onItemClick(item.key)}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap border px-3.5 text-[12.5px] transition-colors duration-200 ${
                  active
                    ? "border-[#0b0b0a] bg-[#0b0b0a] font-semibold text-white"
                    : "border-black/[0.12] bg-white font-medium text-[#0b0b0a]/80 active:bg-black/[0.04]"
                }`}
              >
                <NavIcon item={item} active={active} dark={active} />
                {t(item.label)}
              </button>
            );
          })}
          <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-black/10" />
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap border border-black/[0.12] bg-transparent px-3.5 text-[12.5px] font-medium text-[#0b0b0a]/70 transition-colors active:bg-black/[0.04]"
          >
            <BsArrowBarLeft className="h-[17px] w-[17px] shrink-0" />
            {t("logout")}
          </button>
        </nav>
      </div>
    </div>
  );
}
