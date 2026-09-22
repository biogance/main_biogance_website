"use client"

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FiTrash2 } from 'react-icons/fi';
import { TbPencil } from 'react-icons/tb';
import { PiPawPrint } from 'react-icons/pi';
import { IoCalendarOutline, IoPersonOutline, IoHeartOutline } from 'react-icons/io5';
import { HiOutlineScale } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import DeletePetModal from './ModalBox/DeletePetModal';
import { AddPetModal } from './ModalBox/AddPetModal';
import { BASE_URL, MEDIA_URL } from '../../API/API';

const MAX_PETS = 3;

// One shimmer block — every skeleton on this page is built from this.
const Bone = ({ w, h, className = "" }) => (
  <span
    className={`block bg-black/[0.06] ${className}`}
    style={{ width: w, height: h, animation: "petShimmer 1.5s ease-in-out infinite" }}
  />
);

function PetCardShimmer() {
  return (
    <div className="w-full max-w-[615px] flex bg-white border border-black/10 overflow-hidden">
      <div className="w-[180px] sm:w-[220px] lg:w-[250px] shrink-0 self-stretch min-h-[260px] p-3 sm:p-4">
        <Bone w="100%" h="100%" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-3 p-5 pb-4">
          <div>
            <Bone w="110px" h="22px" className="mb-2.5" />
            <Bone w="90px" h="13px" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Bone w="36px" h="36px" />
            <Bone w="36px" h="36px" />
          </div>
        </div>
        <div className="flex-1 border-t border-black/10">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3.5 px-5 py-3.5 border-b border-black/[0.06] last:border-b-0">
              <Bone w="40px" h="40px" className="shrink-0" />
              <div>
                <Bone w="56px" h="9px" className="mb-2" />
                <Bone w="80px" h="13px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Progressive image — shimmer while a picture is being decoded, a brief
// spinner just after (mirrors the deliberate staged reveal used elsewhere
// in the account section), then the photo. No src at all → a paw-print
// placeholder, filling whatever box it's dropped into.
function ProgressiveImage({ src, alt }) {
  const [loadingState, setLoadingState] = useState(src ? 'shimmer' : 'placeholder');

  useEffect(() => {
    if (!src) { setLoadingState('placeholder'); return; }
    setLoadingState('shimmer');
    const shimmerTimer = setTimeout(() => {
      setLoadingState('spinner');
      const spinnerTimer = setTimeout(() => setLoadingState('loaded'), 2000);
      return () => clearTimeout(spinnerTimer);
    }, 1000);
    return () => clearTimeout(shimmerTimer);
  }, [src]);

  if (loadingState === 'placeholder') {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-black/[0.05] to-black/[0.02] flex items-center justify-center">
        <PiPawPrint className="w-9 h-9 text-black/15" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black/[0.03]">
      {loadingState === 'shimmer' && <Bone w="100%" h="100%" />}
      {loadingState === 'spinner' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#0b0b0a] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {loadingState === 'loaded' && (
        <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
      )}
    </div>
  );
}

// One row: a square icon badge, a small caps label, the value underneath —
// same shape for every attribute, so a glance down the list reads evenly.
function DetailRow({ icon: Icon, label, value, last = false }) {
  return (
    <div className={`flex items-center gap-4 px-5 py-3.5 ${last ? "" : "border-b border-black/[0.06]"}`}>
      {/* "3D" icon badge — a glossy gradient chip (highlight along the top,
          shadow beneath), and the glyph itself is embossed with a paired
          light/dark drop-shadow so its strokes read as raised, not flat. */}
      <span
        className="relative grid place-items-center w-10 h-10 shrink-0 bg-gradient-to-b from-[#403e38] to-[#0b0b0a] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.22),inset_0_-6px_10px_-6px_rgba(0,0,0,.6),0_8px_14px_-8px_rgba(0,0,0,.55)]"
      >
        <Icon
          className="w-[18px] h-[18px]"
          style={{ filter: "drop-shadow(-0.5px -0.5px 0 rgba(255,255,255,.55)) drop-shadow(1px 1.5px 1.5px rgba(0,0,0,.6))" }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none"
        />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8a8880]">{label}</p>
        <p className="mt-0.5 text-[14.5px] font-medium text-[#0b0b0a] truncate">{value || '—'}</p>
      </div>
    </div>
  );
}

// Photo on the left, identity + attribute list on the right — one card
// shape used for every pet.
function PetCard({ pet, onEdit, onDelete, t }) {
  const hasPhoto = Boolean(pet.profile_picture);

  return (
    <div className="w-full max-w-[615px] flex bg-white border border-black/10 overflow-hidden transition-shadow duration-300 hover:shadow-[0_30px_60px_-32px_rgba(0,0,0,.3)]">
      <div className="w-[180px] sm:w-[220px] lg:w-[250px] shrink-0 p-3 sm:p-4 bg-white">
        <div className="relative w-full h-full">
          <ProgressiveImage
            src={hasPhoto ? `${MEDIA_URL}${pet.profile_picture}` : ''}
            alt={pet.name}
          />
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-3 p-5 pb-4">
          <div className="min-w-0">
            <h3 className="text-[20px] sm:text-[22px] font-bold leading-tight tracking-[-0.01em] text-[#0b0b0a] truncate">
              {pet.name}
            </h3>
            <p className="mt-1 text-[13px] text-[#8a8880] truncate">{pet.breed}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onEdit}
              aria-label="Edit pet"
              className="relative grid place-items-center w-9 h-9 shrink-0 bg-gradient-to-b from-[#403e38] to-[#0b0b0a] text-white cursor-pointer overflow-hidden transition-all duration-150 shadow-[inset_0_1px_0_rgba(255,255,255,.22),inset_0_-6px_10px_-6px_rgba(0,0,0,.6),0_8px_14px_-8px_rgba(0,0,0,.55)] hover:-translate-y-px active:translate-y-0"
            >
              <TbPencil
                className="w-4 h-4"
                style={{ filter: "drop-shadow(-0.5px -0.5px 0 rgba(255,255,255,.55)) drop-shadow(1px 1.5px 1.5px rgba(0,0,0,.6))" }}
              />
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
            </button>
            <button
              onClick={onDelete}
              aria-label="Delete pet"
              className="group relative grid place-items-center w-9 h-9 shrink-0 bg-gradient-to-b from-[#403e38] to-[#0b0b0a] text-white cursor-pointer overflow-hidden transition-all duration-150 shadow-[inset_0_1px_0_rgba(255,255,255,.22),inset_0_-6px_10px_-6px_rgba(0,0,0,.6),0_8px_14px_-8px_rgba(0,0,0,.55)] hover:from-red-600 hover:to-red-700 hover:-translate-y-px active:translate-y-0"
            >
              <FiTrash2
                className="w-4 h-4"
                style={{ filter: "drop-shadow(-0.5px -0.5px 0 rgba(255,255,255,.55)) drop-shadow(1px 1.5px 1.5px rgba(0,0,0,.6))" }}
              />
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
            </button>
          </div>
        </div>

        <div className="flex-1 border-t border-black/10">
          <DetailRow icon={IoCalendarOutline} label={t('petProfile.petDetails.age')} value={pet.age} />
          <DetailRow icon={IoPersonOutline} label={t('petProfile.petDetails.gender')} value={pet.gender} />
          <DetailRow icon={HiOutlineScale} label={t('petProfile.petDetails.weight')} value={pet.weight} />
          <DetailRow
            icon={IoHeartOutline}
            label={t('petProfile.petDetails.specialNeeds')}
            value={pet.special_need || pet.specialNeeds}
            last
          />
        </div>
      </div>
    </div>
  );
}

export default function PetProfile() {
  const { t } = useTranslation('myaccount');
  const { t: tSidebar } = useTranslation('sidebar');
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [petToEdit, setPetToEdit] = useState(null);

  const getToken = () => {
    try {
      const splashData = JSON.parse(localStorage.getItem('splashData') || '{}');
      return splashData?.user?.token || localStorage.getItem('token') || '';
    } catch { return ''; }
  };

  const fetchPets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/user/pet/list`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data?.status === false) {
        toast.error(data?.action_message || data?.action || 'Something went wrong.');
        setPets([]);
      } else {
        setPets(data?.data || data?.pets || []);
      }
    } catch (e) {
      console.error('Failed to fetch pets:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPets(); }, [fetchPets]);

  const handleEdit = (pet) => {
    setPetToEdit(pet);
    setIsModalOpen(true);
  };

  const handleDelete = (pet) => {
    setPetToDelete(pet);
    setIsDeleteModalOpen(true);
  };

  const handleAddPet = () => {
    setPetToEdit(null);
    setIsModalOpen(true);
  };

  const atLimit = pets.length >= MAX_PETS;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes petShimmer { 0%, 100% { opacity: .35; } 50% { opacity: .8; } }
      ` }} />

      <div className="bg-[#f3f3f3]">
        <div className="p-4 md:p-8 max-w-10xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8 md:mb-10">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#8a8880] mb-2">
                {tSidebar('groupAccount')}
              </p>
              <h1 className="text-[28px] sm:text-[32px] font-semibold leading-tight tracking-[-0.02em] text-[#0b0b0a]">
                {t('petProfile.title')}
              </h1>
              <p className="mt-2 text-[14px] text-[#8a8880] max-w-md">
                {t('petProfile.subtitle')}
              </p>
            </div>

            {!isLoading && pets.length > 0 && (
              <div className="relative group/tip shrink-0">
                <button
                  onClick={atLimit ? undefined : handleAddPet}
                  className={`inline-flex items-center gap-2 px-6 py-3 text-[13.5px] font-medium tracking-[0.02em] border whitespace-nowrap transition-all duration-200 ${
                    atLimit
                      ? 'bg-black/[0.04] text-[#8a8880] border-black/10 cursor-not-allowed'
                      : 'bg-gradient-to-b from-[#25221e] to-[#0b0b0a] text-white border-[#0b0b0a] shadow-[0_14px_30px_-14px_rgba(0,0,0,.55)] cursor-pointer hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px'
                  }`}
                >
                  {t('petProfile.addPet')}
                </button>
                {atLimit && (
                  <div className="absolute right-0 top-full mt-2 w-56 opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity duration-150 z-10">
                    <div className="bg-[#0b0b0a] text-white px-4 py-3 border border-white/10 shadow-[0_20px_40px_-16px_rgba(0,0,0,.5)]">
                      <p className="text-[12.5px] font-semibold">{t('petProfile.limitReachedTitle')}</p>
                      <p className="mt-0.5 text-[12px] text-white/60">{t('petProfile.limitReachedDescription')}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {Array.from({ length: 2 }).map((_, index) => (
                <PetCardShimmer key={index} />
              ))}
            </div>
          ) : pets.length === 0 ? (
            <div className="bg-white border border-black/10 flex flex-col items-center justify-center min-h-[40vh] py-12 px-4">
              <div className="w-40 h-40 sm:w-48 sm:h-48 mb-6 flex items-center justify-center">
                <img src="petempty.svg" alt="" />
              </div>
              <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#0b0b0a] mb-2">
                {t('petProfile.noPets.title')}
              </h3>
              <p className="text-[13.5px] text-[#8a8880] text-center max-w-md mb-6 leading-relaxed">
                {t('petProfile.noPets.description')}
              </p>
              <button
                onClick={handleAddPet}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-[#25221e] to-[#0b0b0a] text-white text-[13.5px] font-medium tracking-[0.02em] border border-[#0b0b0a] shadow-[0_14px_30px_-14px_rgba(0,0,0,.55)] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer"
              >
                {t('petProfile.noPets.addFirstPet')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {pets.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  onEdit={() => handleEdit(pet)}
                  onDelete={() => handleDelete(pet)}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddPetModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setPetToEdit(null); }}
        onSuccess={fetchPets}
        petToEdit={petToEdit}
      />

      <DeletePetModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        petId={petToDelete?.id}
        petName={petToDelete?.name}
        onSuccess={() => {
          setIsDeleteModalOpen(false);
          setPetToDelete(null);
          fetchPets();
        }}
      />
    </>
  );
}
