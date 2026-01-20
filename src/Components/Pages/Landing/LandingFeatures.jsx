import React from 'react'
import { useTranslation } from 'react-i18next';

export const LandingFeatures = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: () => <img src="head.svg" alt="" className="w-10 h-10" />,
      translationKey: 'clientService',
    },
    {
      icon: () => <img src="truck.svg" alt="" className="w-10 h-10" />,
      translationKey: 'freeDelivery',
    },
    {
      icon: () => <img src="earth.svg" alt="" className="w-10 h-10" />,
      translationKey: 'madeInFrance',
    },
    {
      icon: () => <img src="card.svg" alt="" className="w-10 h-10" />,
      translationKey: 'securePayment',
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
                  <h3 className="text-base text-black font-bold mb-1">
                    {t(`home:features.${feature.translationKey}.title`)}
                  </h3>
                  {t(`home:features.${feature.translationKey}.subtitle`, { defaultValue: '' }) && (
                    <p className="text-sm text-black mb-1">
                      {t(`home:features.${feature.translationKey}.subtitle`)}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    {t(`home:features.${feature.translationKey}.description`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};