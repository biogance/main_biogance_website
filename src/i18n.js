import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonEN from "../src/locales/en/common.json";
import navbarEN from "../src/locales/en/navbar.json";
import homeEN from "../src/locales/en/home.json";
import footerEN from "../src/locales/en/footer.json";
import ourproductEN from "../src/locales/en/ourproduct.json";
import proEN from "../src/locales/en/pro.json";






import commonFR from "../src/locales/fr/common.json";
import navbarFR from "../src/locales/fr/navbar.json";
import homeFR from "../src/locales/fr/home.json";
import footerFR from "../src/locales/fr/footer.json";
import ourproductFR from "../src/locales/fr/ourproduct.json";
import proFR from "../src/locales/fr/pro.json";

i18n
    .use(LanguageDetector) // Ye add karein
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                common: commonEN,
                navbar: navbarEN,
                home: homeEN,
                footer: footerEN,
                ourproduct: ourproductEN,
                pro: proEN,
            },
            fr: {
                common: commonFR,
                navbar: navbarFR,
                home: homeFR,
                footer: footerFR,
                ourproduct: ourproductFR,
                pro: proFR,
            },
        },
        fallbackLng: "en",
        ns: ["common, navbar , home , footer, ourproduct, pro"], 
        defaultNS: "common",
        interpolation: {
            escapeValue: false, // React already escapes
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        }
    });

export default i18n;