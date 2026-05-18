import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Lang = "ar" | "en";

const translations = {
  ar: {
    navHome: "الرئيسية",
    navDestinations: "الوجهات",
    navWhatsapp: "واتساب",

    heroTagline: "الجود للسياحة والسفر",
    heroTitle1: "اكتشف العالم",
    heroTitle2: "بأسلوب راقٍ",
    heroSubEn: "Discover the world in style",
    heroDesc: "نقدم لك أفضل باقات السياحة إلى إسطنبول، أنطاليا، بالي، ماليزيا وأكثر من 12 وجهة فاخرة",
    heroCta: "استعرض الوجهات",
    heroContact: "تواصل معنا",

    statDestinations: "وجهة سياحية",
    statClients: "عميل سعيد",
    statRating: "تقييم المتوسط",
    statYears: "سنوات خبرة",

    featuredTag: "اكتشف معنا",
    featuredTitle: "الوجهات المميزة",
    featuredSubtitle: "Featured Destinations",

    popularTag: "الأكثر طلباً",
    popularTitle: "باقات إسطنبول المميزة",
    popularSubtitle: "Istanbul Popular Packages",

    whyTag: "لماذا الجود",
    whyTitle: "تجربتك هي أولويتنا",
    whySubtitle: "Why Choose Al Jood",
    reason1Title: "أسعار شفافة",
    reason1TitleEn: "Transparent Pricing",
    reason1Desc: "لا رسوم مخفية. السعر المعروض هو ما تدفعه فعلاً.",
    reason2Title: "باقات مخصصة",
    reason2TitleEn: "Custom Packages",
    reason2Desc: "نصمم رحلتك حسب ميزانيتك وتفضيلاتك.",
    reason3Title: "دعم 24/7",
    reason3TitleEn: "24/7 Support",
    reason3Desc: "فريقنا متاح على واتساب في أي وقت تحتاجه.",
    reason4Title: "فنادق مختارة",
    reason4TitleEn: "Curated Hotels",
    reason4Desc: "كل فندق في قائمتنا تم اختياره بعناية لضمان جودتك.",

    allDestinationsBtn: "جميع الوجهات / All Destinations",

    destTag: "استكشف معنا",
    destTitle: "جميع الوجهات",
    destSubtitle: "All Destinations",
    destSearch: "ابحث عن وجهة... Search destinations...",
    destNoResults: "لا توجد نتائج لبحثك / No results found",
    destHotelUnit: "فندق",
    destFromPrice: "من",
    destPriceSuffix: "د.أ",

    backToAll: "جميع الوجهات / All Destinations",
    availablePackagesUnit: "باقة متاحة",
    hotelUnit: "فندق",
    priceFrom: "من",
    pricePerPerson: "د.أ للشخص",
    filterTitle: "تصفية الباقات / Filter Packages",
    allNights: "كل الليالي",
    nightsUnit: "ليالي",
    allStars: "كل النجوم",
    starsUnit: "نجوم",
    allAreas: "كل المناطق",
    allMeals: "كل الأنظمة",
    resetFilters: "إزالة الفلاتر / Reset",
    availPkgsTitle: "الباقات المتاحة",
    pkgUnit: "باقة",
    noPackages: "لا توجد باقات بهذه المعايير",
    noPackagesSubtitle: "No packages match your filters",
    backToDestinations: "العودة إلى الوجهات",
    destinationNotFound: "الوجهة غير موجودة / Destination not found",

    nightLabel: "ليلة",
    bookNow: "احجز الآن",
    inquiryTitle: "استفسار عن الباقة",
    guestNameLabel: "الاسم الكريم *",
    guestNamePlaceholder: "أدخل اسمك",
    guestPhoneLabel: "رقم الهاتف",
    adultsLabel: "بالغين",
    childrenLabel: "أطفال",
    sendWhatsapp: "إرسال عبر واتساب",
    sending: "جاري الإرسال...",
    nameRequired: "يرجى إدخال اسمك",
    errorRetry: "حدث خطأ، يرجى المحاولة مجدداً",
    jod: "د.أ",
    perPersonLabel: "للشخص",

    footerDesc: "نقدم لكم أفضل باقات السياحة والسفر إلى أجمل الوجهات العالمية بأسعار تنافسية وخدمة متميزة.",
    footerDestTitle: "الوجهات / Destinations",
    footerContactTitle: "تواصل معنا / Contact",
    footerCity: "عمان، الأردن",
    footerCopyright: "© 2024 الجود للسياحة والسفر. جميع الحقوق محفوظة.",
    footerCopyrightEn: "© 2024 Al Jood Travel & Tourism. All rights reserved.",
  },
  en: {
    navHome: "Home",
    navDestinations: "Destinations",
    navWhatsapp: "WhatsApp",

    heroTagline: "Al Jood Travel & Tourism",
    heroTitle1: "Discover the World",
    heroTitle2: "In Style",
    heroSubEn: "أفضل باقات سياحية بأسعار شفافة",
    heroDesc: "We offer the best tourism packages to Istanbul, Antalya, Bali, Malaysia and over 12 luxury destinations",
    heroCta: "Explore Destinations",
    heroContact: "Contact Us",

    statDestinations: "Destinations",
    statClients: "Happy Clients",
    statRating: "Avg Rating",
    statYears: "Years Experience",

    featuredTag: "Discover with us",
    featuredTitle: "Featured Destinations",
    featuredSubtitle: "الوجهات المميزة",

    popularTag: "Most Popular",
    popularTitle: "Istanbul Featured Packages",
    popularSubtitle: "باقات إسطنبول المميزة",

    whyTag: "Why Al Jood",
    whyTitle: "Your Experience is Our Priority",
    whySubtitle: "تجربتك هي أولويتنا",
    reason1Title: "Transparent Pricing",
    reason1TitleEn: "أسعار شفافة",
    reason1Desc: "No hidden fees. The price shown is exactly what you pay.",
    reason2Title: "Custom Packages",
    reason2TitleEn: "باقات مخصصة",
    reason2Desc: "We design your trip according to your budget and preferences.",
    reason3Title: "24/7 Support",
    reason3TitleEn: "دعم على مدار الساعة",
    reason3Desc: "Our team is available on WhatsApp anytime you need us.",
    reason4Title: "Curated Hotels",
    reason4TitleEn: "فنادق مختارة",
    reason4Desc: "Every hotel on our list is carefully selected to ensure your quality.",

    allDestinationsBtn: "All Destinations",

    destTag: "Explore with us",
    destTitle: "All Destinations",
    destSubtitle: "جميع الوجهات",
    destSearch: "Search destinations... ابحث عن وجهة...",
    destNoResults: "No results found / لا توجد نتائج",
    destHotelUnit: "hotels",
    destFromPrice: "from",
    destPriceSuffix: "JOD",

    backToAll: "All Destinations",
    availablePackagesUnit: "packages available",
    hotelUnit: "hotels",
    priceFrom: "from",
    pricePerPerson: "JOD/person",
    filterTitle: "Filter Packages / تصفية الباقات",
    allNights: "All Nights",
    nightsUnit: "nights",
    allStars: "All Stars",
    starsUnit: "stars",
    allAreas: "All Areas",
    allMeals: "All Meal Plans",
    resetFilters: "Reset Filters",
    availPkgsTitle: "Available Packages",
    pkgUnit: "packages",
    noPackages: "No packages match your filters",
    noPackagesSubtitle: "لا توجد باقات بهذه المعايير",
    backToDestinations: "Back to Destinations",
    destinationNotFound: "Destination not found / الوجهة غير موجودة",

    nightLabel: "Night(s)",
    bookNow: "Book Now",
    inquiryTitle: "Package Inquiry",
    guestNameLabel: "Full Name *",
    guestNamePlaceholder: "Enter your name",
    guestPhoneLabel: "Phone Number",
    adultsLabel: "Adults",
    childrenLabel: "Children",
    sendWhatsapp: "Send via WhatsApp",
    sending: "Sending...",
    nameRequired: "Please enter your name",
    errorRetry: "An error occurred, please try again",
    jod: "JOD",
    perPersonLabel: "per person",

    footerDesc: "We offer the best tourism and travel packages to the most beautiful destinations worldwide at competitive prices and distinguished service.",
    footerDestTitle: "Destinations",
    footerContactTitle: "Contact",
    footerCity: "Amman, Jordan",
    footerCopyright: "© 2024 Al Jood Travel & Tourism. All rights reserved.",
    footerCopyrightEn: "© 2024 الجود للسياحة والسفر. جميع الحقوق محفوظة.",
  },
} as const;

type Translations = typeof translations.ar;

interface LanguageContextValue {
  lang: Lang;
  isAr: boolean;
  isEn: boolean;
  t: Translations;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem("aljood_lang");
      return saved === "en" ? "en" : "ar";
    } catch {
      return "ar";
    }
  });

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
    try {
      localStorage.setItem("aljood_lang", lang);
    } catch {}
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === "ar" ? "en" : "ar"));

  const value: LanguageContextValue = {
    lang,
    isAr: lang === "ar",
    isEn: lang === "en",
    t: translations[lang] as Translations,
    toggleLang,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
