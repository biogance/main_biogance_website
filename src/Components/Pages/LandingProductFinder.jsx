import { useState, useEffect } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export function LandingProductFinder() {
  const [selectedPet, setSelectedPet] = useState('');
  const [expandedSection, setExpandedSection] = useState(null);
  
  // Background images array
  const backgroundImages = [
    'https://images.unsplash.com/photo-1764821800130-3b09a6f08cff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1560807707-8cc77767d783?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1560807707-8cc77767d783?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto slideshow every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 2500);

    return () => clearInterval(interval); // Cleanup on unmount
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

  const petTypes = [
    'Dog', 'Puppy', 'Cat', 'Horse', 'Reptile', 'Small Mammal', 'Bird & Farmyard',
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden">
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
        <div className="absolute inset-0 bg-black/40" /> {/* Dark overlay */}
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-start px-8 md:px-12 lg:px-16">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-5 max-w-md w-full border border-white/30">
          
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-white text-4xl font-bold mb-3">Find the Perfect Product</h2>
            <p className="text-white/80 text-sm">
              Answer a few quick questions to help us find the best match for your pet's needs
            </p>
          </div>

          {/* Pet Selector */}
          <div className="mb-8">
            <h3 className="text-white text-sm font-medium mb-4">Who is your pet?</h3>
            <div className="flex flex-wrap gap-3">
              {petTypes.map((pet) => (
                <button
                  key={pet}
                  onClick={() => setSelectedPet(pet)}
                  className={`px-5 py-3 rounded-xl cursor-pointer text-sm font-medium transition-all duration-200 ${
                    selectedPet === pet
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/30'
                  }`}
                >
                  {pet}
                </button>
              ))}
            </div>
          </div>

          {/* Expandable Sections */}
          <div className="space-y-6">
            <div >
              <button
                onClick={() => setExpandedSection(expandedSection === 'special' ? null : 'special')}
                className="text-white/90 hover:text-white text-sm font-medium transition"
              >
                What's special about your pet?
              </button>
              <button
                onClick={() => setExpandedSection(expandedSection === 'special' ? null : 'special')}
                className="w-10 h-10 mt-2 cursor-pointer bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg flex items-center justify-center transition-all"
              >
                <AiOutlinePlus className="w-5 h-5 text-white" />
              </button>
            </div>

            <div>
              <button
                onClick={() => setExpandedSection(expandedSection === 'universe' ? null : 'universe')}
                className="text-white/90 hover:text-white text-sm font-medium transition"
              >
                Product universe
              </button>
              <button
                onClick={() => setExpandedSection(expandedSection === 'universe' ? null : 'universe')}
                className="w-10 h-10 mt-2 cursor-pointer bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg flex items-center justify-center transition-all"
              >
                <AiOutlinePlus className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* View Products Button */}
          <button className="w-full mt-10 cursor-pointer bg-white text-black font-bold py-5 rounded-xl hover:bg-gray-100 transition-all duration-200 text-lg shadow-lg">
            View Products
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute bottom-10 right-10 flex gap-4">
        <button
          onClick={goToPrevious}
          className="w-10 h-10 bg-white/20 cursor-pointer backdrop-blur-md hover:bg-white/30 border border-white/40 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
        >
          <FaChevronLeft className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={goToNext}
          className="w-10 h-10 bg-white/20 cursor-pointer backdrop-blur-md hover:bg-white/30 border border-white/40 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
        >
          <FaChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

     
    </div>
  );
}