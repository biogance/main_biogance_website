"use client"

import { useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { TbPencil } from 'react-icons/tb';
import { AddPetModal } from './ModalBox/AddPetModal';
import DeletePetModal from './ModalBox/DeletePetModal';


function PetCard({ pet, onEdit, onDelete }) {
  return (
  <div className="bg-white rounded-xl p-4 border border-gray-200">
  {/* Header with full-width bottom border */}
  <div className="-mx-4 px-4 pb-4 mb-6 border-b border-gray-100">
    <div className="flex items-start gap-4 ">
      <img
        src={pet.image}
        alt={pet.name}
        className="w-20 h-20 rounded-full object-cover border-1 shadow-md border-gray-200 p-1"
      />
      <div className="flex-1">
        <h3 className="text-xl mb-1 font-semibold text-gray-900">{pet.name}</h3>
        <p className="text-gray-600">{pet.breed}</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onEdit}
          className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Edit pet"
        >
          <TbPencil className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 cursor-pointer hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Delete pet"
        >
          <FiTrash2 className="w-5 h-5 text-red-500" />
        </button>
      </div>
    </div>
  </div>

  {/* Rest of the content */}
  <div className="space-y-3">
    <div className="flex justify-between">
      <span className="text-gray-600">Age</span>
      <span className="text-gray-900">{pet.age}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600">Gender</span>
      <span className="text-gray-900">{pet.gender}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600">Weight</span>
      <span className="text-gray-900">{pet.weight}</span>
    </div>
    <div className="flex justify-between items-start">
      <span className="text-gray-600">Special Needs</span>
      <span className="text-gray-900 text-right max-w-[60%]">{pet.specialNeeds}</span>
    </div>
  </div>
</div>
  );
}

export default function PetProfile() {
  const [pets, setPets] = useState([
    {
      id: 1,
      name: 'Scooby',
      breed: 'Labrador',
      age: '2.5 years',
      gender: 'Male',
      weight: '2.9 kg',
      specialNeeds: 'Sensitive skin, Joint care',
      image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop'
    },
    {
      id: 2,
      name: 'Bella',
      breed: 'Beagle',
      age: '3 years',
      gender: 'Female',
      weight: '9.5 kg',
      specialNeeds: 'Allergies, Regular exercise',
      image: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&h=400&fit=crop'
    },
    {
      id: 3,
      name: 'Max',
      breed: 'German Shepherd',
      age: '4 years',
      gender: 'Male',
      weight: '30 kg',
      specialNeeds: 'Anxiety, Training required',
      image: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&h=400&fit=crop'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);

  const handleEdit = (petId) => {
    console.log('Edit pet:', petId);
    // Add edit functionality here
  };

  const handleDelete = (pet) => {
    setPetToDelete(pet);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (petToDelete) {
      setPets(pets.filter(pet => pet.id !== petToDelete.id));
      setPetToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleAddPet = () => {
    setIsModalOpen(true);
  };

  const handleAddPetSubmit = (newPet) => {
    const petWithId = { ...newPet, id: pets.length + 1 };
    setPets([...pets, petWithId]);
  };

  return (
    <>
      <div className="max-w-10xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl text-black font-semibold mb-1">Pet Profile</h2>
              <p className="text-gray-600 text-sm">
                All your pets in one place. Add profiles to get personalized product recommendations.
              </p>
            </div>
            {pets.length > 0 && (
              <button
                onClick={handleAddPet}
                className="bg-gray-900 cursor-pointer text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors duration-200 shadow-sm"
              >
                Add Pet
              </button>
            )}
          </div>

          {/* Conditional Rendering */}
          {pets.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-12 md:py-20">
              <div className="w-56 h-56 md:w-72 md:h-72 mb-8">
                <img
                  src="/petp.svg"
                  alt="Empty pet profile illustration"
                  className="w-full h-full object-contain"
                />
              </div>

              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                No Pet Profiles yet
              </h3>

              <p className="text-gray-500 text-base text-center max-w-lg mb-8 leading-relaxed">
                Add your pet's details for personalized product recommendations - and earn 20 loyalty points for each pet you add!
              </p>

              <button
                onClick={handleAddPet}
                className="bg-gray-900 cursors-pointer text-white px-8 py-3.5 rounded-lg text-base font-medium hover:bg-gray-800 transition-colors duration-200 shadow-sm cursor-pointer"
              >
                Add Your First Pet
              </button>
            </div>
          ) : (
            // Pet Cards Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  onEdit={() => handleEdit(pet.id)}
                  onDelete={() => handleDelete(pet)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddPetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddPet={handleAddPetSubmit}
      />

      <DeletePetModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        petName={petToDelete?.name}
      />
    </>
  );
}