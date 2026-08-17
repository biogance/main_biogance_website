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
import productdetailEN from "../src/locales/en/productdetail.json";
import aboutproductEN from "../src/locales/en/aboutproduct.json";
import expertadviceEN from "../src/locales/en/expertadvice.json";
import productreviewsEN from "../src/locales/en/productreviews.json";
import stickyaddtocartEN from "../src/locales/en/stickyaddtocart.json";
import filterEN from "../src/locales/en/filter.json";
import modaladdtocartEN from "../src/locales/en/modaladdtocart.json";
import checkoutEN from "../src/locales/en/checkout.json";
import prosectionEN from "../src/locales/en/prosection.json";
import resellerEN from "../src/locales/en/reseller.json";
import ambassadorEN from "../src/locales/en/ambassador.json";
import laboratoryEN from "../src/locales/en/laboratory.json";
import breedEN from "../src/locales/en/breed.json";
import trackorderEN from "../src/locales/en/trackorder.json";



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
import productdetailFR from "../src/locales/fr/productdetail.json";
import aboutproductFR from "../src/locales/fr/aboutproduct.json";
import expertadviceFR from "../src/locales/fr/expertadvice.json";
import productreviewsFR from "../src/locales/fr/productreviews.json";
import stickyaddtocartFR from "../src/locales/fr/stickyaddtocart.json";
import filterFR from "../src/locales/fr/filter.json";
import modaladdtocartFR from "../src/locales/fr/modaladdtocart.json";
import checkoutFR from "../src/locales/fr/checkout.json";
import prosectionFR from "../src/locales/fr/prosection.json";
import resellerFR from "../src/locales/fr/reseller.json";
import ambassadorFR from "../src/locales/fr/ambassador.json";
import laboratoryFR from "../src/locales/fr/laboratory.json";
import breedFR from "../src/locales/fr/breed.json";
import trackorderFR from "../src/locales/fr/trackorder.json";

i18n
    .use(LanguageDetector)
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
                productdetail: productdetailEN,
                aboutproduct: aboutproductEN,
                expertadvice: expertadviceEN,
                productreviews: productreviewsEN,
                stickyaddtocart: stickyaddtocartEN,
                filter: filterEN,
                modaladdtocart: modaladdtocartEN,
                checkout: checkoutEN,
                prosection: prosectionEN,
                reseller: resellerEN,
                ambassador: ambassadorEN,
                laboratory: laboratoryEN,
                breed: breedEN,
                trackorder: trackorderEN,
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
                productdetail: productdetailFR,
                aboutproduct: aboutproductFR,
                expertadvice: expertadviceFR,
                productreviews: productreviewsFR,
                stickyaddtocart: stickyaddtocartFR,
                filter: filterFR,
                modaladdtocart: modaladdtocartFR,
                checkout: checkoutFR,
                prosection: prosectionFR,
                reseller: resellerFR,
                ambassador: ambassadorFR,
                laboratory: laboratoryFR,
                breed: breedFR,
                trackorder: trackorderFR,
            },
        },
        fallbackLng: "en",
        ns: ["common, navbar , home , footer, ourproduct, pro, whowe, searchmodal, commitment, certificates , ingredients, ourloyalty , onboarding , sidebar , myaccount , productdetail , aboutproduct , expertadvice , productreviews , stickyaddtocart, filter, modaladdtocart, checkout, prosection, reseller, ambassador, laboratory, breed"],
        defaultNS: "common",
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        }
    });

export default i18n;
