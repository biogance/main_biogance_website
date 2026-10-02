import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { MEDIA_URL } from '../../API/API';
import {
  LuArrowLeft,
  LuArrowRight,
  LuArrowUpRight,
  LuCheck,
  LuPawPrint,
  LuRotateCcw,
  LuX,
} from 'react-icons/lu';

// Fallback background (public/PF.webp) — used until the splash data is in
// localStorage, or when admin hasn't uploaded media for a slot.
const BACKGROUND_IMAGE = '/DPF.webp';

// Last splash-derived values, kept in memory while the tab lives so that
// coming back to the home page paints the right media/categories on the
// first frame (no fallback-image flash); they are still re-read from
// localStorage on every mount.
let finderMemory = { categories: [], sectionMediaSet: { desktop: null, tab: null, mobile: null }, modalMedia: null, screenTier: 'desktop' };

// Admin-uploaded media for a slot, from the splash response
// ({ media, media_type: "image" | "video" }) — either is valid, so render a
// muted looping <video> or an <img> accordingly.
function FinderMedia({ data, className }) {
  const media = typeof data?.media === 'string' ? data.media : '';
  if (!media) return <img src={BACKGROUND_IMAGE} alt="" className={className} />;
  const src = /^https?:\/\//i.test(media) ? media : `${MEDIA_URL}${media}`;
  const isVideo = data.media_type === 'video' || /\.(mp4|webm|ogg|mov)$/i.test(media);
  return isVideo ? (
    <video key={src} src={src} autoPlay loop muted playsInline className={className} />
  ) : (
    <img key={src} src={src} alt="" className={className} />
  );
}

// Product finder — the section is just an image stage with the heading,
// one "View products" CTA and a pet-profile / coupon note. The CTA opens a
// modal holding the three-tier cascading finder (pet → speciality → need),
// built from the real category tree: category -> speciality (type
// "perfect-specificity", in the category's sub_categories) -> need (type
// "perfect-need", in the speciality's sub_categories).
export function LandingProductFinder({ data }) {
  const { t, i18n } = useTranslation('home');
  const isFrench = i18n.language === 'fr';
  const router = useRouter();

  const [selectedPet, setSelectedPet] = useState('');
  const [selectedCare, setSelectedCare] = useState('');
  const [selectedConcern, setSelectedConcern] = useState('');
  const [categories, setCategories] = useState(() => finderMemory.categories);
  // Section background per screen size, each an image or a video:
  // desktop = home_perfect_product, tablet = home_perfect_tab_media,
  // mobile = home_perfect_mobile_media.
  const [sectionMediaSet, setSectionMediaSet] = useState(() => finderMemory.sectionMediaSet);
  // Only the media for the current screen size is rendered (so a phone never
  // downloads the desktop video). Tiers match the rest of the landing page:
  // mobile < 721px, tablet 721–1100px, desktop from 1101px.
  const [screenTier, setScreenTier] = useState(() => finderMemory.screenTier);
  useEffect(() => {
    const read = () => {
      const w = window.innerWidth;
      const tier = w < 721 ? 'mobile' : w < 1101 ? 'tab' : 'desktop';
      finderMemory = { ...finderMemory, screenTier: tier };
      setScreenTier(tier);
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);
  // Falls back to the next larger size when a slot has no media.
  const hasMedia = (m) => (typeof m?.media === 'string' && m.media ? m : null);
  const sectionMedia =
    (screenTier === 'mobile' && hasMedia(sectionMediaSet.mobile)) ||
    (screenTier !== 'desktop' && hasMedia(sectionMediaSet.tab)) ||
    sectionMediaSet.desktop;
  // Modal visual (home_view_product). All of these come from the cached
  // splash data.
  const [modalMedia, setModalMedia] = useState(() => finderMemory.modalMedia);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  // Wizard shows one step at a time; dir drives the slide-in direction.
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const goToStep = (next) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const getName = (item) => {
    if (!item) return '';
    return isFrench ? (item.french_name || item.name || '') : (item.name || '');
  };

  // Top-level pet categories (with their full sub_categories tree) come from
  // the splash API response, cached in localStorage as "splashData" (see
  // PageLoader.jsx) — same source FilterProducts.jsx reads for its filters.
  useEffect(() => {
    const loadCategories = () => {
      try {
        const splash = JSON.parse(localStorage.getItem('splashData') || 'null');
        const list = (splash?.categories || [])
          .filter((cat) => !cat.parent_id)
          .slice()
          .sort((a, b) => (a.sorting_number || 0) - (b.sorting_number || 0));
        const mediaSet = {
          desktop: splash?.home_perfect_product || null,
          tab: splash?.home_perfect_tab_media || null,
          mobile: splash?.home_perfect_mobile_media || null,
        };
        const modal = splash?.home_view_product || null;
        finderMemory = { ...finderMemory, categories: list, sectionMediaSet: mediaSet, modalMedia: modal };
        setCategories(list);
        setSectionMediaSet(mediaSet);
        setModalMedia(modal);
      } catch {
        setCategories([]);
      }
    };
    loadCategories();
    window.addEventListener('splashDataReady', loadCategories);
    return () => window.removeEventListener('splashDataReady', loadCategories);
  }, []);

  const selectedPetObj = categories.find((cat) => cat.id === selectedPet);
  const careOptions = selectedPetObj?.sub_categories?.filter((s) => s.type === 'perfect-specificity') || [];
  const selectedCareObj = careOptions.find((c) => c.id === selectedCare);
  const concernOptions = selectedCareObj?.sub_categories?.filter((s) => s.type === 'perfect-need') || [];
  const selectedConcernObj = concernOptions.find((c) => c.id === selectedConcern);

  // Selecting a pet resets the two lower tiers. Picking an option never
  // moves on by itself — the footer "Next" button does.
  const handleSelectPet = (cat) => {
    setSelectedPet(cat.id);
    setSelectedCare('');
    setSelectedConcern('');
  };

  const handleSelectCare = (careObj) => {
    setSelectedCare(careObj.id);
    setSelectedConcern('');
  };

  const resetFinder = () => {
    setSelectedPet('');
    setSelectedCare('');
    setSelectedConcern('');
    goToStep(0);
  };

  const openModal = () => {
    setDir(1);
    setStep(0);
    setIsOpen(true);
  };

  // The hero's "Find the perfect product" button (MainVideo.jsx) opens this
  // modal through a window event.
  useEffect(() => {
    window.addEventListener('biogance-open-finder', openModal);
    return () => window.removeEventListener('biogance-open-finder', openModal);
  }, []);

  // Modal: lock page scroll, close on Escape, animate out before unmounting.
  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 250);
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && closeModal();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  const viewProducts = () => {
    if (!selectedPetObj) return;
    sessionStorage.setItem(
      'shopDeepLink',
      JSON.stringify({ type: 'family', category_id: selectedPetObj.id }),
    );
    window.dispatchEvent(new Event('shopDeepLinkReady'));
    router.push('/shop');
  };

  // Steps shown in the modal; 2 and 3 unlock as the previous one is picked.
  const steps = [
    {
      n: '01',
      short: t('productFinder.stepPet', 'Pet'),
      label: t('productFinder.whoIsYourPet'),
      options: categories,
      value: selectedPet,
      onPick: handleSelectPet,
      unlocked: true,
    },
    {
      n: '02',
      short: t('productFinder.stepCare', 'Care'),
      label: t('productFinder.whatToCareFor'),
      options: careOptions,
      value: selectedCare,
      onPick: handleSelectCare,
      unlocked: !!selectedPet,
    },
    {
      n: '03',
      short: t('productFinder.stepConcern', 'Concern'),
      label: t('productFinder.mainConcern'),
      options: concernOptions,
      value: selectedConcern,
      onPick: (c) => setSelectedConcern(c.id),
      unlocked: !!selectedCare,
    },
  ];

  // Modal — split layout: image + vertical stepper on the left, question +
  // option list on the right.
  const pickedObjs = [selectedPetObj, selectedCareObj, selectedConcernObj];
  // Footer CTA: "Next" on steps 1–2, "View products" on the last step — or
  // earlier when the picked option has nothing further to choose from.
  const nextHasOptions = step < steps.length - 1 && steps[step + 1].options.length > 0;
  const showNext = step < steps.length - 1 && !(steps[step].value && !nextHasOptions);
  const modal = (
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-3 min-[400px]:p-4 ${
        isClosing ? 'backdrop-out' : 'backdrop-in'
      }`}
      onClick={closeModal}
    >
      <style>{`
        @keyframes pfStepIn { from { opacity: 0; transform: translateX(var(--pf-from)); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('productFinder.heading')}
        onClick={(e) => e.stopPropagation()}
        className={`flex h-[min(600px,calc(100dvh-24px))] w-full max-w-[520px] overflow-hidden bg-white shadow-[0_50px_110px_-30px_rgba(0,0,0,.55)] min-[400px]:h-[min(600px,calc(100dvh-32px))] md:h-[min(620px,88vh)] md:max-w-[980px] ${
          isClosing ? 'modal-pop-out' : 'modal-pop-in'
        }`}
      >
        {/* Left — image + vertical stepper (desktop) */}
        <aside className="hidden w-[260px] shrink-0 flex-col bg-[#f5f4f0] md:flex lg:w-[330px]">
          <div className="relative h-[44%] shrink-0 overflow-hidden">
            <FinderMedia data={modalMedia} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#f5f4f0] via-[#f5f4f0]/10 to-transparent" />
          </div>
          <div className="flex flex-1 flex-col px-5 pb-6 lg:px-7 lg:pb-7">
            <div className="my-auto py-4">
            <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8a8880]">
              <span className="h-px w-6 bg-black/30" />
              {t('productFinder.sectionEyebrow')}
            </p>
            <ol className="relative mt-5 flex flex-col gap-1">
              {/* rail */}
              <span aria-hidden="true" className="absolute bottom-4 left-[13px] top-4 w-px bg-black/10" />
              {steps.map((s, i) => {
                const active = i === step;
                const picked = pickedObjs[i];
                const reachable = s.unlocked && s.options.length > 0;
                return (
                  <li key={s.n} className="relative">
                    <button
                      type="button"
                      disabled={!reachable}
                      onClick={() => goToStep(i)}
                      className={`flex w-full items-start gap-3.5 py-2.5 text-left transition-colors cursor-pointer disabled:cursor-default ${
                        active ? 'text-[#0b0b0a]' : reachable ? 'text-[#5c5a54] hover:text-[#0b0b0a]' : 'text-black/25'
                      }`}
                    >
                      <span
                        className={`relative z-[1] grid h-[27px] w-[27px] shrink-0 place-items-center text-[10px] font-bold tabular-nums transition-colors ${
                          picked
                            ? 'bg-[#0b0b0a] text-white'
                            : active
                              ? 'border border-[#0b0b0a] bg-white'
                              : 'border border-black/15 bg-[#f5f4f0]'
                        }`}
                      >
                        {picked ? <LuCheck className="h-3.5 w-3.5 stroke-[3]" /> : s.n}
                      </span>
                      <span className="min-w-0 pt-0.5">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.2em]">{s.short}</span>
                        <span className={`mt-1 block truncate text-[13px] ${picked ? 'font-medium text-[#0b0b0a]' : 'text-[#8a8880]'}`}>
                          {picked ? getName(picked) : t('productFinder.notChosen', 'Not chosen yet')}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            </div>
            <button
              type="button"
              onClick={resetFinder}
              disabled={!selectedPet}
              className="inline-flex w-fit items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5c5a54] transition-colors hover:text-[#0b0b0a] cursor-pointer disabled:pointer-events-none disabled:opacity-30"
            >
              <LuRotateCcw className="h-3.5 w-3.5" />
              {t('productFinder.reset', 'Reset')}
            </button>
          </div>
        </aside>

        {/* Right — question + options */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 items-start justify-between gap-4 px-4 pt-4 min-[400px]:px-5 min-[400px]:pt-5 lg:px-8 lg:pt-7">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a8880] tabular-nums">
                {t('productFinder.step', 'Step')} {steps[step].n}
                <span className="text-black/25"> / 03</span>
              </p>
              <h2
                key={`q2-${step}`}
                className="mt-2 text-[clamp(22px,3vw,34px)] font-light leading-[1.1] tracking-[-0.02em] text-[#0b0b0a]"
                style={{ '--pf-from': dir > 0 ? '16px' : '-16px', animation: 'pfStepIn .35s cubic-bezier(.2,.7,.2,1) both' }}
              >
                {steps[step].label}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeModal}
              aria-label={t('productFinder.close', 'Close')}
              className="grid h-9 w-9 shrink-0 place-items-center border border-black/10 text-[#0b0b0a] min-[400px]:h-10 min-[400px]:w-10 transition-colors duration-200 hover:border-[#0b0b0a] hover:bg-[#0b0b0a] hover:text-white cursor-pointer"
            >
              <LuX className="h-[18px] w-[18px]" />
            </button>
          </div>

          {/* Mobile progress + picked chips (the left panel is hidden there) */}
          <div className="shrink-0 px-4 pt-4 min-[400px]:px-5 md:hidden">
            <div className="grid grid-cols-3 gap-1.5">
              {steps.map((s, i) => (
                <span key={s.n} className={`h-[3px] ${i <= step ? 'bg-[#0b0b0a]' : 'bg-black/10'}`} />
              ))}
            </div>
            {pickedObjs.some(Boolean) && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {pickedObjs.filter(Boolean).map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => goToStep(i)}
                    className="bg-[#f5f4f0] px-2.5 py-1 text-[11px] font-medium text-[#0b0b0a] cursor-pointer"
                  >
                    {getName(p)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 min-[400px]:px-5 min-[400px]:py-5 lg:px-8" style={{ overscrollBehavior: 'contain' }}>
            {(() => {
              const s = steps[step];
              const isPetStep = step === 0;
              if (s.options.length === 0) return <p className="text-[13px] text-[#8a8880]">—</p>;
              return (
                <ul
                  key={step}
                  className={`grid ${isPetStep ? 'grid-cols-1 gap-2 min-[480px]:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2 lg:gap-x-6'}`}
                  style={{ '--pf-from': dir > 0 ? '24px' : '-24px', animation: 'pfStepIn .35s cubic-bezier(.2,.7,.2,1) both' }}
                >
                  {s.options.map((opt, idx) => {
                    const on = s.value === opt.id;
                    if (isPetStep) {
                      return (
                        <li key={opt.id}>
                          <button
                            type="button"
                            onClick={() => s.onPick(opt)}
                            aria-pressed={on}
                            className={`group flex h-14 w-full items-center gap-3 border px-3 text-left min-[400px]:h-16 min-[400px]:gap-4 min-[400px]:px-4 transition-all duration-200 cursor-pointer ${
                              on
                                ? 'border-[#0b0b0a] bg-[#0b0b0a] text-white'
                                : 'border-black/10 bg-white text-[#0b0b0a] hover:border-[#0b0b0a] hover:shadow-[0_14px_28px_-20px_rgba(0,0,0,.45)]'
                            }`}
                          >
                            <span
                              className={`grid h-10 w-10 shrink-0 place-items-center transition-colors ${
                                on ? 'bg-white/10' : 'bg-[#f5f4f0] group-hover:bg-[#ebe9e3]'
                              }`}
                            >
                              {opt.media ? (
                                <img
                                  src={`${MEDIA_URL}${opt.media}`}
                                  alt=""
                                  className={`h-6 w-6 object-contain brightness-0 ${on ? 'invert' : ''}`}
                                />
                              ) : (
                                <LuPawPrint className="h-5 w-5" />
                              )}
                            </span>
                            <span className="min-w-0 flex-1 text-[13px] font-semibold leading-tight">{getName(opt)}</span>
                            {on ? (
                              <LuCheck className="h-4 w-4 shrink-0 stroke-[3]" />
                            ) : (
                              <LuArrowRight className="h-4 w-4 shrink-0 text-black/25 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#0b0b0a]" />
                            )}
                          </button>
                        </li>
                      );
                    }
                    return (
                      <li key={opt.id} className="border-b border-black/10">
                        <button
                          type="button"
                          onClick={() => s.onPick(opt)}
                          aria-pressed={on}
                          className="group flex w-full items-center gap-4 py-4 text-left cursor-pointer"
                        >
                          <span className={`w-6 shrink-0 text-[11px] tabular-nums ${on ? 'font-bold text-[#0b0b0a]' : 'text-black/30'}`}>
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span
                            className={`flex-1 text-[14px] transition-colors ${
                              on ? 'font-semibold text-[#0b0b0a]' : 'text-[#3a3936] group-hover:text-[#0b0b0a]'
                            }`}
                          >
                            {getName(opt)}
                          </span>
                          {/* selected → tick; otherwise a faint arrow on hover */}
                          {on ? (
                            <LuCheck aria-hidden="true" className="h-5 w-5 shrink-0 stroke-[2.5] text-[#0b0b0a]" />
                          ) : (
                            <LuArrowRight
                              aria-hidden="true"
                              className="h-4 w-4 shrink-0 -translate-x-1 text-[#0b0b0a] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              );
            })()}
          </div>

          <div className="flex shrink-0 items-center gap-3 border-t border-black/10 px-4 py-3 min-[400px]:px-5 min-[400px]:py-4 lg:px-8">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => goToStep(step - 1)}
                className="group inline-flex h-12 items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0b0b0a] cursor-pointer"
              >
                <LuArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                {t('productFinder.back', 'Back')}
              </button>
            ) : (
              <button
                type="button"
                onClick={resetFinder}
                disabled={!selectedPet}
                className="inline-flex h-12 items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5c5a54] cursor-pointer disabled:pointer-events-none disabled:opacity-30 md:hidden"
              >
                <LuRotateCcw className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={showNext ? () => goToStep(step + 1) : viewProducts}
              disabled={!steps[step].value}
              className="ml-auto inline-flex h-12 w-full max-w-[220px] items-center min-[480px]:max-w-[300px] justify-center gap-2.5 bg-[#0b0b0a] px-6 text-[12px] font-bold uppercase tracking-[0.14em] text-white transition-colors duration-200 hover:bg-[#2a2a28] cursor-pointer disabled:cursor-not-allowed disabled:bg-black/[0.08] disabled:text-[#8a8880]"
            >
              {showNext ? t('productFinder.next', 'Next') : t('productFinder.viewProducts')}
              <LuArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section id="finder" className="w-full scroll-mt-24 bg-[#f5f4f0]">
      <div className="relative w-full overflow-hidden bg-[#0c0c0e]">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <FinderMedia data={sectionMedia} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
      </div>

      {/* Heading, CTA and note — inside the stage */}
      <div className="relative z-10 flex min-h-[560px] w-full flex-col justify-center px-4 py-14 min-[721px] min-[721px]:px-[clamp(24px,2.4vw,46px)] min-[721px]:py-[clamp(60px,6vw,96px)]">
        <div className="max-w-[640px]">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 shrink-0 bg-white/60 sm:w-12" />
            <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/80 sm:text-[10px]">
              {t('productFinder.sectionEyebrow')}
            </span>
          </div>
          <h2 className="m-0 text-[clamp(32px,5vw,64px)] uppercase leading-[1.02] tracking-[-0.035em]">
            <span className="block font-light text-white/85">{t('productFinder.sectionHeadingLine1')}</span>
            <span className="block font-extrabold text-white">{t('productFinder.sectionHeadingLine2')}</span>
          </h2>
          <p className="mt-5 max-w-[520px] text-[14px] leading-[1.7] text-white/80 sm:text-[15px]">
            {t('productFinder.sectionSubtitle')}
          </p>

          <button
            type="button"
            onClick={openModal}
            className="group mt-8 inline-flex h-12 items-center gap-3 border border-white bg-white px-8 text-[11px] font-bold uppercase tracking-[0.22em] text-[#0b0b0a] transition-colors duration-300 hover:bg-transparent hover:text-white cursor-pointer"
          >
            {t('productFinder.findPerfectProduct', 'Find perfect product')}
            <LuArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>

          <p className="mt-5 text-[13px] leading-relaxed text-white/75">
            {t('productFinder.profileNote')}{' '}
            <button
              type="button"
              onClick={() => router.push('/my-account?tab=pet')}
              className="inline-flex items-center gap-1 font-semibold text-white decoration-white underline-offset-4 hover:underline cursor-pointer"
            >
              {t('productFinder.learnMore')}
              <LuArrowRight className="h-3.5 w-3.5" />
            </button>
          </p>
        </div>
      </div>

      </div>

      {isOpen && typeof document !== 'undefined' && createPortal(modal, document.body)}
    </section>
  );
}
