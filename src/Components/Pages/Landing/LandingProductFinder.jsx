import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export function LandingProductFinder({ data }) {
  const { t, i18n } = useTranslation('home');
  const isFrench = i18n.language === 'fr';
  const router = useRouter();
  // Three-tier cascading finder — same "pet → speciality → need" flow as
  // HOMEPAGE V2.html's perfectMatchData finder, but built from the real
  // category tree instead of hardcoded demo data. The tree is 3 levels:
  // category (type "collection") -> speciality (type "perfect-specificity",
  // sitting in the category's own sub_categories) -> need (type
  // "perfect-need", sitting in the speciality's own sub_categories). This
  // used to filter for "universe"/"family" — those types belong to
  // OurProducts.jsx's separate shop-filter tree, not this one, so they
  // never matched anything here and the 2nd/3rd tiers stayed empty.
  const [selectedPet, setSelectedPet] = useState('');
  const [selectedCare, setSelectedCare] = useState('');
  const [selectedConcern, setSelectedConcern] = useState('');
  const [categories, setCategories] = useState([]);

  // Same french_name fallback OurProducts.jsx uses for its own category /
  // universe (speciality) / family (need) names — this file already applied
  // it to the top-level pet buttons but not to the speciality/need tiers
  // below them, so those stayed English-only even in French mode.
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

  // Selecting a pet just resets the two lower tiers so the user picks the
  // speciality (and then the need) themselves, instead of the first option
  // in each list being auto-selected for them.
  const handleSelectPet = (cat) => {
    setSelectedPet(cat.id);
    setSelectedCare('');
    setSelectedConcern('');
  };

  const handleSelectCare = (careObj) => {
    setSelectedCare(careObj.id);
    setSelectedConcern('');
  };

  // Background images array
  const backgroundImages = [
    'https://images.unsplash.com/photo-1764821800130-3b09a6f08cff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.pexels.com/photos/31192222/pexels-photo-31192222.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.pexels.com/photos/1041099/pexels-photo-1041099.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto slideshow every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Manual navigation
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
    <>
     
      <section id="finder" className="w-full bg-white pt-[clamp(82px,9vw,138px)] scroll-mt-24">
        
        <div className="w-full grid grid-cols-1 min-[1101px]:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] gap-[26px] min-[721px]:gap-[clamp(34px,4vw,64px)] items-end px-4 min-[721px]:px-[clamp(24px,2.4vw,46px)] mb-[34px] min-[721px]:mb-[46px]">
          <div>
            <div className="flex items-center gap-3 text-black">
              <span className="w-[34px] h-px bg-current"></span>
              <span className="text-[10px] tracking-[0.22em] uppercase">{t('productFinder.sectionEyebrow')}</span>
            </div>
            <h2 className="mt-[18px] mb-0 text-[50px] min-[721px]:text-[clamp(48px,7vw,108px)] leading-[0.9] tracking-[-0.072em] uppercase font-[100] text-black">
              {t('productFinder.sectionHeadingLine1')}<br />{t('productFinder.sectionHeadingLine2')}
            </h2>
          </div>
          <p className="mb-2 max-w-[600px] text-[#595955] text-[15px] leading-[1.75]">
            {t('productFinder.sectionSubtitle')}
          </p>
        </div>
      </section>

    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0">
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
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content — card styled like .finder-card / .finder-intro / .question /
          .choice / .finder-result in HOMEPAGE V2.html */}
      <div className="relative min-h-screen flex items-center justify-center sm:justify-start px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12">
        <div className="bg-white/[0.14] backdrop-blur-[4px] p-6 sm:p-8 md:p-9 max-w-[360px] w-full border border-white/50">

          {/* Header (.finder-intro) */}
          <div className="mb-0">
            <h2 className="text-white text-[34px] sm:text-[clamp(34px,3.7vw,60px)] leading-[0.9] tracking-[-0.065em] uppercase font-medium mb-[18px]">
              {t('productFinder.heading')}
            </h2>
            <p className="text-white/90 text-sm leading-[1.72] mb-6">
              {t('productFinder.description')}
            </p>
          </div>

          {/* Step 1 — Who is your pet? (.question + .choice-row.pet-tabs) */}
          <div className="text-white/95 text-[10px] tracking-[0.16em] uppercase mt-[18px] mb-3">
            {t('productFinder.whoIsYourPet')}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectPet(cat)}
                className={`px-[14px] py-[11px] cursor-pointer text-[11px] font-semibold transition-all duration-200 border ${
                  selectedPet === cat.id
                    ? 'bg-white/[0.18] text-white border-white/70'
                    : 'bg-white/5 text-white hover:bg-white/[0.18] border-white/40 hover:border-white/70'
                }`}
              >
                {getName(cat)}
              </button>
            ))}
          </div>

          {/* Step 2 — What do you want to care for? (.choice-row.need-tabs) */}
          {careOptions.length > 0 && (
            <>
              <div className="text-white/95 text-[10px] tracking-[0.16em] uppercase mt-[18px] mb-3">
                {t('productFinder.whatToCareFor')}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {careOptions.map((care) => (
                  <button
                    key={care.id}
                    onClick={() => handleSelectCare(care)}
                    className={`px-[14px] py-[11px] cursor-pointer text-[11px] font-semibold transition-all duration-200 border ${
                      selectedCare === care.id
                        ? 'bg-white/[0.18] text-white border-white/70'
                        : 'bg-white/5 text-white hover:bg-white/[0.18] border-white/40 hover:border-white/70'
                    }`}
                  >
                    {getName(care)}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 3 — What is the main concern? (.choice-row.concern-tabs) */}
          {concernOptions.length > 0 && (
            <>
              <div className="text-white/95 text-[10px] tracking-[0.16em] uppercase mt-[18px] mb-3">
                {t('productFinder.mainConcern')}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {concernOptions.map((concern) => (
                  <button
                    key={concern.id}
                    onClick={() => setSelectedConcern(concern.id)}
                    className={`px-[14px] py-[11px] cursor-pointer text-[11px] font-semibold transition-all duration-200 border ${
                      selectedConcern === concern.id
                        ? 'bg-white/[0.18] text-white border-white/70'
                        : 'bg-white/5 text-white hover:bg-white/[0.18] border-white/40 hover:border-white/70'
                    }`}
                  >
                    {getName(concern)}
                  </button>
                ))}
              </div>
            </>
          )}

         
          <div className="mt-[22px] pt-[18px] border-t border-white/25">
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
              className="w-full min-h-[48px] cursor-pointer bg-white text-[#171717] border border-white hover:bg-transparent hover:text-white hover:border-white/70 uppercase text-[9px] tracking-[0.15em] font-bold transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#171717]"
            >
              {t('productFinder.viewProducts')}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {/* <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 right-4 sm:right-6 md:right-10 flex gap-2 sm:gap-3 md:gap-4">
        <button
          onClick={goToPrevious}
          className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 cursor-pointer backdrop-blur-md hover:bg-white/30 border border-white/40 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
        >
          <FaChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </button>
        <button
          onClick={goToNext}
          className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 cursor-pointer backdrop-blur-md hover:bg-white/30 border border-white/40 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
        >
          <FaChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </button>
      </div> */}
    </div>
    </>
  );
}