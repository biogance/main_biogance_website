import { useState } from 'react';
import { PiDog, PiCat, PiHorse, PiBird, PiGameController, PiGridFour } from 'react-icons/pi';
import { GiRabbit, GiLizard } from 'react-icons/gi';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('dogs');

  const categories = [
    { id: 'dogs', name: 'Dogs & Puppies', icon: <PiDog size={24} /> },
    { id: 'cats', name: 'Cats & Kittens', icon: <PiCat size={24} /> },
    { id: 'horses', name: 'Horses', icon: <PiHorse size={24} /> },
    { id: 'mammals', name: 'Small Mammals', icon: <GiRabbit size={24} /> },
    { id: 'birds', name: 'Birds & Poultry', icon: <PiBird size={24} /> },
    { id: 'reptiles', name: 'Reptiles', icon: <GiLizard size={24} /> },
    { id: 'games', name: 'Games & Treats', icon: <PiGameController size={24} /> },
    { id: 'all', name: 'All Ranges', icon: <PiGridFour size={24} /> },
  ];

  const contentSections = [
    {
      title: 'Grooming & Care',
      image: 'https://images.unsplash.com/photo-1641484202528-c33769340d44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGdyb29taW5nJTIwd2hpdGUlMjBkb2d8ZW58MXx8fHwxNzY3OTUzODQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      items: [
        'Shampoos & Conditioners',
        'Dry & Leave-In Shampoos',
        'Sensitive Area Care',
        'Skin & Coat Care',
        'Shedding Care',
        'Detanglers & Brushes',
        'Anti-Free Radical Treatment',
        'Dermoccare Veto-Pharma Range'
      ]
    },
    {
      title: 'Lifestyle & Wellness',
      image: 'https://images.unsplash.com/photo-1557897467-d59fb33eb834?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHJlbGF4aW5nJTIwd2l0aCUyMGRvZ3xlbnwxfHx8fDE3Njc5NTM4NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      items: [
        'Relaxation',
        'Toys & Treats',
        'Accessories & Textiles',
        'Scented Waters',
        'Our Kits',
        'What\'s New'
      ]
    },
    {
      title: 'Health & Nutrition',
      image: 'https://images.unsplash.com/photo-1629581327302-45202bbc4bd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBidWxsZG9nJTIwb3V0ZG9vcnxlbnwxfHx8fDE3Njc5NTM4NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      items: [
        'Pest Care',
        'Food Supplements',
        'Biogance Premium & Natural Range',
        'ECOCERT Organiclisme Controlled Range',
        'Plouf Fruity Range (Low Budget)'
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-[200px] bg-[#2a2a2a] p-3 flex-shrink-0">
        <div className="space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeCategory === category.id
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-[#3a3a3a]'
              }`}
            >
              <span className="flex-shrink-0">{category.icon}</span>
              <span className="text-sm">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="grid grid-cols-3 gap-6 max-w-7xl">
          {contentSections.map((section, index) => (
            <div key={index} className="flex flex-col">
              {/* Section Title */}
              <h2 className="text-sm mb-4">{section.title}</h2>
              
              {/* Section Image */}
              <div className="mb-4">
                <img
                  src={section.image}
                  alt={section.title}
                  className="w-full h-[100px] object-cover rounded-lg"
                />
              </div>

              {/* Section Items */}
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="text-sm text-gray-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}