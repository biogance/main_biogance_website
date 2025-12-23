"use client"
import React, { useState } from 'react';
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
      <Navbar/>
      <div className="min-h-screen bg-white">
        <div className="max-w-10xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-[280px_1fr] gap-12">
            {/* Sidebar */}
            <div className="md:sticky md:top-18 md:self-start">
              <h1 className="mb-1 text-black font-semibold text-xl">
                Frequently Asked Questions
              </h1>
              <p className="text-black font-semibold text-xl">(FAQs)</p>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
              {/* Section 1: About Biogance */}
              <section>
                <h2 className="mb-6 text-black font-semibold text-lg">1. About Biogance</h2>
                <div className="space-y-4">
                  <AccordionItem
                    question="What makes Biogance products different from other pet care brands?"
                    answer="Biogance is a pioneer in organic and natural pet care, using ECOCERT-certified ingredients, GMP production standards, and formulas free from parabens, phenoxyethanol, and animal oils."
                    isOpen={openItems['section1-item-1']}
                    onToggle={() => toggleItem('section1-item-1', 'section1')}
                  />

                  <AccordionItem
                    question="Are Biogance products tested on animals?"
                    answer="No. Our products are never tested on animals. We are truly committed to animal welfare, safety, and sustainability."
                    isOpen={openItems['section1-item-2']}
                    onToggle={() => toggleItem('section1-item-2', 'section1')}
                  />

                  <AccordionItem
                    question="Are these all products tested on animals?"
                    answer="Yes! Our organic range ship-supplies, such as lemon, tea tree, birds, roselle, and small mammals, each formulated for their specific needs."
                    isOpen={openItems['section1-item-3']}
                    onToggle={() => toggleItem('section1-item-3', 'section1')}
                  />
                </div>
              </section>

              {/* Section 2: Orders & Shipping */}
              <section>
                <h2 className="mb-6 text-black font-semibold text-lg">2. Orders & Shipping</h2>
                <div className="space-y-4">
                  <AccordionItem
                    question="How can I track my order?"
                    answer="Once your order is confirmed, you'll receive a tracking link by email. You can also check your My Account → My Orders."
                    isOpen={openItems['section2-item-4']}
                    onToggle={() => toggleItem('section2-item-4', 'section2')}
                  />

                  <AccordionItem
                    question="How long does delivery take?"
                    answer="Delivery times vary by location, but most orders are processed within 24-48 hours and delivered in 3–5 working days."
                    isOpen={openItems['section2-item-5']}
                    onToggle={() => toggleItem('section2-item-5', 'section2')}
                  />

                  <AccordionItem
                    question="Can I cancel my order?"
                    answer="Yes, if your order hasn't shipped yet, you can cancel it directly from My Orders. If it has already been sent, kindly use either our return process; we'll return it back if you want a refund before it's even delivered."
                    isOpen={openItems['section2-item-6']}
                    onToggle={() => toggleItem('section2-item-6', 'section2')}
                  />
                </div>
              </section>

              {/* Section 3: Returns & Refunds */}
              <section>
                <h2 className="mb-6 text-black font-semibold text-lg">3. Returns & Refunds</h2>
                <div className="space-y-4">
                  <AccordionItem
                    question="What if I receive a damaged or defective product?"
                    answer="If a product arrives faulty (e.g., broken pump, leakage), you can request a refund or exchange from the Support & Refunds tab in your account."
                    isOpen={openItems['section3-item-7']}
                    onToggle={() => toggleItem('section3-item-7', 'section3')}
                  />

                  <AccordionItem
                    question="How long does a refund take?"
                    answer="Refunds are usually processed within 7–10 business days after we receive the returned product."
                    isOpen={openItems['section3-item-8']}
                    onToggle={() => toggleItem('section3-item-8', 'section3')}
                  />
                </div>
              </section>

              {/* Section 4: Loyalty Program */}
              <section>
                <h2 className="mb-6 text-black font-semibold text-lg">4. Loyalty Program</h2>
                <div className="space-y-4">
                  <AccordionItem
                    question="How does the Biogance Loyalty Program work?"
                    answer="For every €10 spent, you earn 1 point. Each point equals €1, which you can convert into discount vouchers. You also earn bonus points on your birthday, newsletter signup, or surveys."
                    isOpen={openItems['section4-item-9']}
                    onToggle={() => toggleItem('section4-item-9', 'section4')}
                  />

                  <AccordionItem
                    question="Can I transfer my loyalty points?"
                    answer="No, points are limited to the account and cannot be transferred or shared."
                    isOpen={openItems['section4-item-10']}
                    onToggle={() => toggleItem('section4-item-10', 'section4')}
                  />
                </div>
              </section>

              {/* Section 5: My Account & Settings */}
              <section>
                <h2 className="mb-6 text-black font-semibold text-lg">5. My Account & Settings</h2>
                <div className="space-y-4">
                  <AccordionItem
                    question="Can I update my password anywhere?"
                    answer="Yes. In Settings → Update Password, you can change it anytime. For security, updating your password will log you out of all devices."
                    isOpen={openItems['section5-item-11']}
                    onToggle={() => toggleItem('section5-item-11', 'section5')}
                  />

                  <AccordionItem
                    question="How many pets can I add to my account?"
                    answer="You can add up to 5 pets. This helps us recommend tailored products."
                    isOpen={openItems['section5-item-12']}
                    onToggle={() => toggleItem('section5-item-12', 'section5')}
                  />

                  <AccordionItem
                    question="What happens if I delete my account?"
                    answer="When you request account deletion, we'll ask you for a reason (feedback helps us improve). After confirmation, your account and data will be permanently removed."
                    isOpen={openItems['section5-item-13']}
                    onToggle={() => toggleItem('section5-item-13', 'section5')}
                  />
                </div>
              </section>

              {/* Section 6: Support & Refunds */}
              <section>
                <h2 className="mb-6 text-black font-semibold text-lg">6. Support & Refunds</h2>
                <div className="space-y-4">
                  <AccordionItem
                    question="How can I contact support?"
                    answer="You can submit tickets directly in My Account → Support & Refunds. You'll see all active and closed tickets with chat history."
                    isOpen={openItems['section6-item-14']}
                    onToggle={() => toggleItem('section6-item-14', 'section6')}
                  />

                  <AccordionItem
                    question="What issues can I raise a ticket for?"
                    answer={
                      <div>
                        Common reasons include:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Order Refund</li>
                          <li>Product Query</li>
                          <li>Shipping Delay</li>
                          <li>Quality Issue</li>
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