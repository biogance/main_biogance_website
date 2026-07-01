"use client"

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FiTrash2, FiX } from 'react-icons/fi';
import { TbPencil } from 'react-icons/tb';
import { PiPawPrint } from 'react-icons/pi';
import DeletePetModal from './ModalBox/DeletePetModal';
import { AddPetModal } from './ModalBox/AddPetModal';
import { BASE_URL, MEDIA_URL } from '../../API/API';



// Shimmer Card Component for Pet Cards
const PetCardShimmer = () => (
  <div className="bg-white  p-4 border border-gray-200">
    <div className="-mx-4 px-4 pb-4 mb-6 border-b border-gray-100">
      <div className="flex items-start gap-4">
        {/* Image Shimmer - Now properly circular and responsive */}
        <div className="flex-shrink-0">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200px 100%',
              animation: 'shimmer 1.5s infinite'
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          {/* Name Shimmer */}
          <div
            style={{
              width: '120px',
              height: '28px',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200px 100%',
              animation: 'shimmer 1.5s infinite',
              marginBottom: '8px'
            }}
          />
          {/* Breed Shimmer */}
          <div
            style={{
              width: '80px',
              height: '16px',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200px 100%',
              animation: 'shimmer 1.5s infinite'
            }}
          />
        </div>
        <div className="flex items-center gap-1">
          {/* Edit Button Shimmer */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200px 100%',
              animation: 'shimmer 1.5s infinite'
            }}
          />
          {/* Delete Button Shimmer */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200px 100%',
              animation: 'shimmer 1.5s infinite'
            }}
          />
        </div>
      </div>
    </div>

    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-gray-600">Age</span>
        <div
          style={{
            width: '70px',
            height: '16px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Gender</span>
        <div
          style={{
            width: '50px',
            height: '16px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Weight</span>
        <div
          style={{
            width: '60px',
            height: '16px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      </div>
      <div className="flex justify-between items-start">
        <span className="text-gray-600">Special Needs</span>
        <div
          style={{
            width: '120px',
            height: '16px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      </div>
    </div>
  </div>
);

// Progressive Image Loader Component
const ProgressiveImage = ({ src, alt, className }) => {
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
      <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-50 border border-gray-200 shadow-md flex items-center justify-center">
        <PiPawPrint className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
      </div>
    );
  }

  return (
    <div className="relative flex-shrink-0">
      {loadingState === 'shimmer' && (
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      )}
      {loadingState === 'spinner' && (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center border shadow-md border-gray-200 p-1">
          <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {loadingState === 'loaded' && (
        <img src={src} alt={alt} className={className} />
      )}
    </div>
  );
};

function PetCard({ pet, onEdit, onDelete, t }) {
  return (
    <div className="bg-white  p-4 border border-gray-200">
      <div className="-mx-4 px-4 pb-4 mb-6 border-b border-gray-100">
        <div className="flex items-start gap-4">
          <ProgressiveImage
            src={pet.profile_picture ? `${MEDIA_URL}${pet.profile_picture}` : ''}
            alt={pet.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border shadow-md border-gray-200 p-1"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl mb-1 font-semibold text-gray-900 truncate">{pet.name}</h3>
            <p className="text-gray-600 text-sm sm:text-base truncate">{pet.breed}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-2 cursor-pointer hover:bg-gray-100 transition-colors"
              aria-label="Edit pet"
            >
              <TbPencil className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 cursor-pointer hover:bg-red-50  transition-colors"
              aria-label="Delete pet"
            >
              <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm sm:text-base">{t('petProfile.petDetails.age')}</span>
          <span className="text-gray-900 text-sm sm:text-base">{pet.age}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm sm:text-base">{t('petProfile.petDetails.gender')}</span>
          <span className="text-gray-900 text-sm sm:text-base">{pet.gender}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm sm:text-base">{t('petProfile.petDetails.weight')}</span>
          <span className="text-gray-900 text-sm sm:text-base">{pet.weight}</span>
        </div>
        <div className="flex justify-between items-start">
          <span className="text-gray-600 text-sm sm:text-base">{t('petProfile.petDetails.specialNeeds')}</span>
          <span className="text-gray-900 text-right max-w-[60%] text-sm sm:text-base">
            {pet.special_need || pet.specialNeeds || '—'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PetProfile() {
  const { t } = useTranslation('myaccount');
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
      setPets(data?.data || data?.pets || []);
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

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
      `}} />

      <div className="min-h-screen">
        <div className="max-w-10xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white  p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl text-black font-semibold mb-1">{t('petProfile.title')}</h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  {t('petProfile.subtitle')}
                </p>
              </div>
              {!isLoading && pets.length > 0 && (
                <div className="relative group inline-block">
                  <button
                    onClick={pets.length >= 3 ? undefined : handleAddPet}
                    className={`px-4 sm:px-6 py-2 sm:py-2.5  text-sm font-medium transition-colors duration-200 shadow-sm whitespace-nowrap ${
                      pets.length >= 3
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gray-900 text-white cursor-pointer hover:bg-gray-800'
                    }`}
                  >
                    {t('petProfile.addPet')}
                  </button>
                  {pets.length >= 3 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-10">
                      <div className="bg-gray-900 text-white text-xs  px-3 py-2 whitespace-nowrap text-center shadow-lg">
                        Limit reached<br />Only 3 pets per Account.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <PetCardShimmer key={index} />
                ))}
              </div>
            ) : pets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 md:py-20">
                <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 mb-8">
                  <img src="petempty.svg" alt="" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  {t('petProfile.noPets.title')}
                </h3>
                <p className="text-gray-500 text-sm sm:text-base text-center max-w-lg mb-8 leading-relaxed px-4">
                  {t('petProfile.noPets.description')}
                </p>
                <button
                  onClick={handleAddPet}
                  className="bg-gray-900 cursor-pointer text-white px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-medium hover:bg-gray-800 transition-colors duration-200 shadow-sm"
                >
                  {t('petProfile.noPets.addFirstPet')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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