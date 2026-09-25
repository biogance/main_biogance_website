import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { GoArrowUpRight } from 'react-icons/go';
import LandingSectionHead from './LandingSectionHead';

export function LandingProductFinder({ data }) {
  const { t, i18n } = useTranslation('home');
  const isFrench = i18n.language === 'fr';
  const router = useRouter();

  const [selectedPet, setSelectedPet] = useState('');
  const [selectedCare, setSelectedCare] = useState('');
  const [selectedConcern, setSelectedConcern] = useState('');
  const [categories, setCategories] = useState([]);

  const getName = (item) => {
    if (!item) return '';
    return isFrench ? (item.french_name || item.name || '') : (item.name || '');
  };

  useEffect(() => {
    const loadCategories = () => {
      try {
        const splash = JSON.parse(localStorage.getItem('splashData') || 'null');
        const list = (splash?.categories || [])
          .filter((cat) => !cat.parent_id)
          .slice()
          .sort((a, b) => (a.sorting_number || 0) - (b.sorting_number || 0));
        setCategories(list);
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

  const handleSelectPet = (cat) => {
    setSelectedPet(cat.id);
    setSelectedCare('');
    setSelectedConcern('');
  };

  const handleSelectCare = (careObj) => {
    setSelectedCare(careObj.id);
    setSelectedConcern('');
  };

  const backgroundImages = [
    'https://images.unsplash.com/photo-1764821800130-3b09a6f08cff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.pexels.com/photos/31192222/pexels-photo-31192222.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.pexels.com/photos/1041099/pexels-photo-1041099.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? backgroundImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) =>
      prev === backgroundImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <section id="finder" className="w-full bg-[#f5f4f0] pt-[clamp(60px,7vw,110px)] pb-[clamp(60px,7vw,110px)] scroll-mt-24 relative overflow-hidden">
      {/* Header Container */}
      <div className="w-full px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] mb-8 min-[721px]:mb-12">
        <LandingSectionHead
          tone="light"
          index="03"
          eyebrow={t('productFinder.sectionEyebrow')}
          line1={t('productFinder.sectionHeadingLine1')}
          line2={t('productFinder.sectionHeadingLine2')}
          subtitle={t('productFinder.sectionSubtitle')}
        />
      </div>

      {/* Main Product Finder Luxury Stage (Edge-to-Edge Container, No Side Padding) */}
      <div className="w-full px-0">
        <div className="relative w-full min-h-[580px] bg-[#0c0c0e] border-y border-black overflow-hidden rounded-none shadow-2xl flex flex-col justify-between">
          {/* Background Image Slideshow — Crisp & Vibrant Image Visibility */}
          <div className="absolute inset-0 z-0">
            {backgroundImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: `url('${image}')`,
                }}
              />
            ))}
            {/* Subtle Gradient + Backdrop Overlay — Text is crisp, image is bright */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/20" />
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
          </div>

          {/* Interactive Content Module */}
          <div className="relative z-10 w-full px-4 sm:px-10 md:px-14 py-8 sm:py-12 flex flex-col justify-between h-full flex-1">
            {/* Top Bar: Step Indicator & Title */}
            <div className="w-full mb-8">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
                <span className="shrink-0 px-2.5 py-0.5 bg-white text-black text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.2em] uppercase rounded-none">
                  FINDER WIZARD
                </span>
                <span className="hidden min-[400px]:block h-px w-10 bg-white/40" />
                <span className="text-[10px] font-mono tracking-[0.22em] text-white/80 uppercase">
                  CUSTOM FORMULATION RECOMMENDATION
                </span>
              </div>
              <h2 className="text-white text-[28px] sm:text-[clamp(32px,3.8vw,52px)] font-extrabold leading-[1.05] tracking-[-0.035em] uppercase max-w-[700px] drop-shadow-md">
                {t('productFinder.heading')}
              </h2>
              <p className="mt-2 text-white/90 text-[13px] sm:text-[14px] leading-[1.7] max-w-[560px] font-normal drop-shadow-sm">
                {t('productFinder.description')}
              </p>
            </div>

            {/* 3-Step Selection Wizard Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 my-auto py-4">
              {/* Step 1: Pet Category */}
              <div className="flex flex-col items-start border-t border-white/30 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 flex items-center justify-center bg-white text-black text-[9px] font-mono font-bold rounded-none">
                    01
                  </span>
                  <span className="text-white text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase drop-shadow-sm">
                    {t('productFinder.whoIsYourPet')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 w-full">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectPet(cat)}
                      className={`px-4 py-2.5 cursor-pointer text-[10px] sm:text-[11px] font-bold tracking-[0.16em] uppercase transition-all duration-300 border rounded-none ${
                        selectedPet === cat.id
                          ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-[1.02]'
                          : 'bg-black/30 backdrop-blur-md text-white border-white/40 hover:bg-white/20 hover:border-white/80'
                      }`}
                    >
                      {getName(cat)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Care Specialty — Only visible once pet category (Step 1) is selected */}
              {selectedPet && careOptions.length > 0 ? (
                <div className="flex flex-col items-start border-t border-white/30 pt-4 transition-all duration-500 animate-fadeIn">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-5 h-5 flex items-center justify-center bg-white text-black text-[9px] font-mono font-bold rounded-none">
                      02
                    </span>
                    <span className="text-white text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase drop-shadow-sm">
                      {t('productFinder.whatToCareFor')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full">
                    {careOptions.map((care) => (
                      <button
                        key={care.id}
                        onClick={() => handleSelectCare(care)}
                        className={`px-4 py-2.5 cursor-pointer text-[10px] sm:text-[11px] font-bold tracking-[0.16em] uppercase transition-all duration-300 border rounded-none ${
                          selectedCare === care.id
                            ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-[1.02]'
                            : 'bg-black/30 backdrop-blur-md text-white border-white/40 hover:bg-white/20 hover:border-white/80'
                        }`}
                      >
                        {getName(care)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Step 3: Specific Concern — Only visible once care specialty (Step 2) is selected */}
              {selectedCare && concernOptions.length > 0 ? (
                <div className="flex flex-col items-start border-t border-white/30 pt-4 transition-all duration-500 animate-fadeIn">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-5 h-5 flex items-center justify-center bg-white text-black text-[9px] font-mono font-bold rounded-none">
                      03
                    </span>
                    <span className="text-white text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase drop-shadow-sm">
                      {t('productFinder.mainConcern')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full">
                    {concernOptions.map((concern) => (
                      <button
                        key={concern.id}
                        onClick={() => setSelectedConcern(concern.id)}
                        className={`px-4 py-2.5 cursor-pointer text-[10px] sm:text-[11px] font-bold tracking-[0.16em] uppercase transition-all duration-300 border rounded-none ${
                          selectedConcern === concern.id
                            ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-[1.02]'
                            : 'bg-black/30 backdrop-blur-md text-white border-white/40 hover:bg-white/20 hover:border-white/80'
                        }`}
                      >
                        {getName(concern)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Bottom Action Strip: CTA Button Only */}
            <div className="w-full pt-6 mt-6 border-t border-white/30 flex items-center justify-start">
              <button
                disabled={!selectedPetObj}
                onClick={() => {
                  if (!selectedPetObj) return;
                  sessionStorage.setItem(
                    'shopDeepLink',
                    JSON.stringify({ type: 'family', category_id: selectedPetObj.id }),
                  );
                  window.dispatchEvent(new Event('shopDeepLinkReady'));
                  router.push('/shop');
                }}
                className="group w-full sm:w-auto h-12 px-8 bg-white text-black border border-white hover:bg-black hover:text-white hover:border-white uppercase text-[10px] sm:text-[11px] tracking-[0.22em] font-bold rounded-none transition-all duration-300 shadow-[0_10px_25px_rgba(255,255,255,0.2)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black inline-flex items-center justify-center gap-3"
              >
                {t('productFinder.viewProducts')}
                <GoArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}