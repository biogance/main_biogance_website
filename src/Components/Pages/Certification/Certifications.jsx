"use client"

import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { useTranslation } from 'react-i18next';
import { BASE_URL, MEDIA_URL } from '../../API/API';
import toast, { Toaster } from 'react-hot-toast';

// ── Certificate Image with loader (same pattern as LandingCards) ────────────
const CertImage = ({ src, alt, className }) => {
  const [imgLoading, setImgLoading] = useState(true);

  return (
    <div className="relative flex items-center justify-center w-full md:w-70 min-h-[80px]">
      {imgLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '3px solid rgba(0,0,0,.1)',
            borderTopColor: '#555',
            animation: 'certSpin 1s linear infinite',
          }} />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setImgLoading(false)}
        onError={() => setImgLoading(false)}
      />
    </div>
  );
};

export default function Certifications() {
  const { t } = useTranslation('certificates');
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await fetch(`${BASE_URL}/app/certificates`);
        const data = await res.json();

        if (data.status === false || data.status === 'false' || !res.ok) {
          const msg =
            data.errors?.length > 0
              ? data.errors[0].message
              : data.action || data.title || 'Something went wrong.';
          toast.error(msg);
        } else if (Array.isArray(data.data) && data.data.length > 0) {
          const formatted = data.data.map((item) => ({
            id: item.id,
            media: `${MEDIA_URL.replace(/\/$/, '')}/${item.media}`,
            description: item.description,
          }));
          setCertificates(formatted);
        } else {
          toast.error('No certificates found.');
        }
      } catch (err) {
        console.error('Certificates fetch error:', err);
        toast.error('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  return (
    <>
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
      <style>{`@keyframes certSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* ── Hero / Top Section ─────────────────────────────────────────────── */}
      <div className="bg-white py-8 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-10xl mx-auto">
          {/* Mobile Layout - Image First */}
          <div className="lg:hidden mb-8">
            <div className="relative">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <img
                  src="/C1.svg"
                  alt="Pet care professional"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <img src="cc2.svg" alt="" className="w-10 h-10" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm mb-2 leading-tight">
                        We're a Certified Pet Care Brand
                      </h3>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        ECOCERT and ISO 22716 certified for safe and eco-responsible pet care.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-4 md:space-y-6">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  {t('ourCertifications')}
                </p>
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
                  {t('complianceWithStandards')}
                </h2>
              </div>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">{t('complianceDescription')}</p>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">{t('pioneersDescription')}</p>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">{t('recognitionDescription')}</p>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">{t('isoCertificationDescription')}</p>
            </div>

            {/* Right Content - Desktop Only */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-lg mt-10 overflow-hidden shadow-xl">
                <img
                  src="/C1.svg"
                  alt="Pet care professional"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 bg-white rounded-2xl shadow-xl p-4 md:p-5 max-w-[calc(100%-2rem)] md:max-w-sm">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 -mt-2">
                      <img src="cc2.svg" alt="" className="w-10 h-10 md:w-14 md:h-14" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm md:text-base mb-2 md:mb-3 leading-tight">
                        {t('certifiedPetCareBrand')}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                        {t('certificationDetails')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── API Certificates Sections ──────────────────────────────────────── */}
      {!loading && certificates.map((cert, index) => (
        <section
          key={cert.id}
          className={`px-6 py-20 ${index === certificates.length - 1 ? 'mb-20' : ''}`}
        >
          <div className="max-w-10xl mx-auto">
            <div className="bg-[#f7f7f7] p-8 md:p-12 rounded-2xl">
              <div className="flex flex-col md:flex-row gap-8">

                {/* Logo / Media */}
                <div className="flex-shrink-0">
                  <CertImage
                    src={cert.media}
                    alt={`Certificate ${index + 1}`}
                    className="w-full md:w-70 h-auto md:h-50"
                  />
                </div>

                {/* Description — HTML format convert karke show karo */}
                <div className="flex-1">
                  <div
                    className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: cert.description }}
                  />
                </div>

              </div>
            </div>
          </div>
        </section>
      ))}

      <Footer />
    </>
  );
}