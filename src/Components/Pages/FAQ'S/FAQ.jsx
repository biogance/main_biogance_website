"use client"
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoChevronDown } from 'react-icons/io5';
import Navbar from '../Navbar';
import Footer from '../Footer';

const AccordionItem = ({ question, answer, isOpen, onToggle }) => {
  const [contentHeight, setContentHeight] = React.useState(0);
  const contentRef = React.useRef(null);

  React.useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden ">
      <button
        onClick={onToggle}
        className="w-full flex items-center cursor-pointer justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors duration-200"
      >
        <span className="text-black font-medium text-md pr-4">{question}</span>
        <IoChevronDown 
          className={`w-5 h-5 text-gray-600 flex-shrink-0 transition-transform duration-400 ease-out ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>
      <div
        ref={contentRef}
        style={{ height: `${contentHeight}px` }}
        className="overflow-hidden transition-all duration-400 ease-out"
      >
        <div className={`px-4 pb-4 pt-2 text-black text-sm transform transition-all duration-300 ${
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        }`}>
          {answer}
        </div>
      </div>
    </div>
  );
};

export default function FAQ() {
  const { t } = useTranslation("faq");
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (itemId, sectionId) => {
    setOpenItems(prev => {
      const newState = { ...prev };
      
      // Agar item already open hai to close karo
      if (newState[itemId]) {
        delete newState[itemId];
        return newState;
      }
      
      // Same section ke saare items close karo
      Object.keys(newState).forEach(key => {
        if (key.startsWith(sectionId)) {
          delete newState[key];
        }
      });
      
      // Current item ko open karo
      newState[itemId] = true;
      return newState;
    });
  };
   
  return (
    <>
        <div className="fixed top-0 left-0 right-0 z-50">
             <Navbar/>
          </div>
    
      <div className="min-h-screen bg-white">
        <div className="max-w-10xl mx-auto px-6 py-22">
          <div className="grid md:grid-cols-[280px_1fr] gap-12">
            {/* Sidebar */}
            <div className="md:sticky md:top-18 md:self-start">
              <h1 className="mb-1 text-black font-semibold text-xl">
                {t('faq.title')}
              </h1>
              <p className="text-black font-semibold text-xl">{t('faq.subtitle')}</p>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
              {/* Section 1: About Biogance */}
              <section>
                <h2 className="mb-6 text-black font-semibold text-lg">{t('faq.sections.aboutBiogance.title')}</h2>
                <div className="space-y-4">
                  <AccordionItem
                    question={t('faq.sections.aboutBiogance.q1.question')}
                    answer={t('faq.sections.aboutBiogance.q1.answer')}
                    isOpen={openItems['section1-item-1']}
                    onToggle={() => toggleItem('section1-item-1', 'section1')}
                  />

                  <AccordionItem
                    question={t('faq.sections.aboutBiogance.q2.question')}
                    answer={t('faq.sections.aboutBiogance.q2.answer')}
                    isOpen={openItems['section1-item-2']}
                    onToggle={() => toggleItem('section1-item-2', 'section1')}
                  />

                  <AccordionItem
                    question={t('faq.sections.aboutBiogance.q3.question')}
                    answer={t('faq.sections.aboutBiogance.q3.answer')}
                    isOpen={openItems['section1-item-3']}
                    onToggle={() => toggleItem('section1-item-3', 'section1')}
                  />
                </div>
              </section>

              {/* Section 2: Orders & Shipping */}
              <section>
                <h2 className="mb-6 text-black font-semibold text-lg">{t('faq.sections.ordersShipping.title')}</h2>
                <div className="space-y-4">
                  <AccordionItem
                    question={t('faq.sections.ordersShipping.q1.question')}
                    answer={t('faq.sections.ordersShipping.q1.answer')}
                    isOpen={openItems['section2-item-4']}
                    onToggle={() => toggleItem('section2-item-4', 'section2')}
                  />

                  <AccordionItem
                    question={t('faq.sections.ordersShipping.q2.question')}
                    answer={t('faq.sections.ordersShipping.q2.answer')}
                    isOpen={openItems['section2-item-5']}
                    onToggle={() => toggleItem('section2-item-5', 'section2')}
                  />

                  <AccordionItem
                    question={t('faq.sections.ordersShipping.q3.question')}
                    answer={t('faq.sections.ordersShipping.q3.answer')}
                    isOpen={openItems['section2-item-6']}
                    onToggle={() => toggleItem('section2-item-6', 'section2')}
                  />
                </div>
              </section>

              {/* Section 3: Returns & Refunds */}
              <section>
                <h2 className="mb-6 text-black font-semibold text-lg">{t('faq.sections.returnsRefunds.title')}</h2>
                <div className="space-y-4">
                  <AccordionItem
                    question={t('faq.sections.returnsRefunds.q1.question')}
                    answer={t('faq.sections.returnsRefunds.q1.answer')}
                    isOpen={openItems['section3-item-7']}
                    onToggle={() => toggleItem('section3-item-7', 'section3')}
                  />

                  <AccordionItem
                    question={t('faq.sections.returnsRefunds.q2.question')}
                    answer={t('faq.sections.returnsRefunds.q2.answer')}
                    isOpen={openItems['section3-item-8']}
                    onToggle={() => toggleItem('section3-item-8', 'section3')}
                  />
                </div>
              </section>

              {/* Section 4: Loyalty Program */}
              <section>
                <h2 className="mb-6 text-black font-semibold text-lg">{t('faq.sections.loyaltyProgram.title')}</h2>
                <div className="space-y-4">
                  <AccordionItem
                    question={t('faq.sections.loyaltyProgram.q1.question')}
                    answer={t('faq.sections.loyaltyProgram.q1.answer')}
                    isOpen={openItems['section4-item-9']}
                    onToggle={() => toggleItem('section4-item-9', 'section4')}
                  />

                  <AccordionItem
                    question={t('faq.sections.loyaltyProgram.q2.question')}
                    answer={t('faq.sections.loyaltyProgram.q2.answer')}
                    isOpen={openItems['section4-item-10']}
                    onToggle={() => toggleItem('section4-item-10', 'section4')}
                  />
                </div>
              </section>

              {/* Section 5: My Account & Settings */}
              <section>
                <h2 className="mb-6 text-black font-semibold text-lg">{t('faq.sections.accountSettings.title')}</h2>
                <div className="space-y-4">
                  <AccordionItem
                    question={t('faq.sections.accountSettings.q1.question')}
                    answer={t('faq.sections.accountSettings.q1.answer')}
                    isOpen={openItems['section5-item-11']}
                    onToggle={() => toggleItem('section5-item-11', 'section5')}
                  />

                  <AccordionItem
                    question={t('faq.sections.accountSettings.q2.question')}
                    answer={t('faq.sections.accountSettings.q2.answer')}
                    isOpen={openItems['section5-item-12']}
                    onToggle={() => toggleItem('section5-item-12', 'section5')}
                  />

                  <AccordionItem
                    question={t('faq.sections.accountSettings.q3.question')}
                    answer={t('faq.sections.accountSettings.q3.answer')}
                    isOpen={openItems['section5-item-13']}
                    onToggle={() => toggleItem('section5-item-13', 'section5')}
                  />
                </div>
              </section>

              {/* Section 6: Support & Refunds */}
              <section>
                <h2 className="mb-6 text-black font-semibold text-lg">{t('faq.sections.supportRefunds.title')}</h2>
                <div className="space-y-4">
                  <AccordionItem
                    question={t('faq.sections.supportRefunds.q1.question')}
                    answer={t('faq.sections.supportRefunds.q1.answer')}
                    isOpen={openItems['section6-item-14']}
                    onToggle={() => toggleItem('section6-item-14', 'section6')}
                  />

                  <AccordionItem
                    question={t('faq.sections.supportRefunds.q2.question')}
                    answer={
                      <div>
                        {t('faq.sections.supportRefunds.q2.answer')}
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>{t('faq.sections.supportRefunds.q2.list.item1')}</li>
                          <li>{t('faq.sections.supportRefunds.q2.list.item2')}</li>
                          <li>{t('faq.sections.supportRefunds.q2.list.item3')}</li>
                          <li>{t('faq.sections.supportRefunds.q2.list.item4')}</li>
                        </ul>
                      </div>
                    }
                    isOpen={openItems['section6-item-15']}
                    onToggle={() => toggleItem('section6-item-15', 'section6')}
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}