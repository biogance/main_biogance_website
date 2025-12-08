import React from 'react'
import { FaHeadphones } from 'react-icons/fa';

export const LandingFeatures = () => {
  const features = [
    {
      icon: () => <img src="head.svg" alt="" className="w-10 h-10" />,
      title: 'Service Client',
      subtitle: '+33 2 41 73 15 15',
      description: 'Available 9h-12h / 14h-16h',
    },
    {
       icon: () => <img src="truck.svg" alt="" className="w-10 h-10" />,
      title: 'Free Delivery',
      description: 'Enjoy FREE delivery on orders over €39 (France collection points only)',
    },
    {
      icon: () => <img src="earth.svg" alt="" className="w-10 h-10" />,
      title: '100%',
      description: 'All our products are proudly 100% Made in France',
    },
    {
       icon: () => <img src="card.svg" alt="" className="w-10 h-10" />,
      title: 'Secure Payment',
      description: 'Shop confidently with our secure payment system',
    },
  ];

  return (
    <section className="bg-gray-50 py-12 px-10">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex flex-col border border-[#E2E2E2] rounded-xl p-4 items-start gap-3">
                <Icon className="w-10 h-10 stroke-[1.5]" />
                <div>
                  <h3 className="text-base text-black font-bold mb-1">{feature.title}</h3>
                  {feature.subtitle && (
                    <p className="text-sm text-black mb-1">{feature.subtitle}</p>
                  )}
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
