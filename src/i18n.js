import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonEN from "../src/locales/en/common.json";
import navbarEN from "../src/locales/en/navbar.json";
import homeEN from "../src/locales/en/home.json";
import footerEN from "../src/locales/en/footer.json";
import ourproductEN from "../src/locales/en/ourproduct.json";
import proEN from "../src/locales/en/pro.json";
import whoweEN from "../src/locales/en/whowe.json";
import searchmodalEN from "../src/locales/en/searchmodal.json";
import commitmentEN from "../src/locales/en/commitment.json";
import certificatesEN from "../src/locales/en/certificates.json";
import ingredientsEN from "../src/locales/en/ingredients.json";
import ourloyaltyEN from "../src/locales/en/ourloyalty.json";
import onboardingEN from "../src/locales/en/onboarding.json";
import sidebarEN from "../src/locales/en/sidebar.json";
import myaccountEN from "../src/locales/en/myaccount.json";
import termsconditionEN from "../src/locales/en/termscondition.json";
import faqEN from "../src/locales/en/faq.json";







import commonFR from "../src/locales/fr/common.json";
import navbarFR from "../src/locales/fr/navbar.json";
import homeFR from "../src/locales/fr/home.json";
import footerFR from "../src/locales/fr/footer.json";
import ourproductFR from "../src/locales/fr/ourproduct.json";
import proFR from "../src/locales/fr/pro.json";
import whoweFR from "../src/locales/fr/whowe.json";
import searchmodalFR from "../src/locales/fr/searchmodal.json";
import commitmentFR from "../src/locales/fr/commitment.json";
import certificatesFR from "../src/locales/fr/certificates.json";
import ingredientsFR from "../src/locales/fr/ingredients.json";
import ourloyaltyFR from "../src/locales/fr/ourloyalty.json";
import onboardingFR from "../src/locales/fr/onboarding.json";
import sidebarFR from "../src/locales/fr/sidebar.json";
import myaccountFR from "../src/locales/fr/myaccount.json";
import termsconditionFR from "../src/locales/fr/termscondition.json";
import faqFR from "../src/locales/fr/faq.json";


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
                whowe: whoweEN,
                searchmodal: searchmodalEN,
                commitment: commitmentEN,
                certificates: certificatesEN,
                ingredients: ingredientsEN,
                ourloyalty: ourloyaltyEN,
                onboarding: onboardingEN,
                 sidebar: sidebarEN,
                myaccount: myaccountEN,
                termscondition: termsconditionEN,
                faq: faqEN,
            },
            fr: {
                common: commonFR,
                navbar: navbarFR,
                home: homeFR,
                footer: footerFR,
                ourproduct: ourproductFR,
                pro: proFR,
                whowe: whoweFR,
                searchmodal: searchmodalFR,
                commitment: commitmentFR,
                certificates: certificatesFR,
                ingredients: ingredientsFR,
                ourloyalty: ourloyaltyFR,
                onboarding: onboardingFR,
                sidebar: sidebarFR,
                myaccount: myaccountFR,
                termscondition: termsconditionFR,
                faq: faqFR,
            },
        },
        fallbackLng: "en",
        ns: ["common, navbar , home , footer, ourproduct, pro, whowe, searchmodal, commitment, certificates , ingredients, ourloyalty , onboarding , sidebar , myaccount "],
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