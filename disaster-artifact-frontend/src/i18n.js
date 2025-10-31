import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        "Community Disaster Archive": "Community Disaster Archive",
        "Search by title or location...": "Search by title or location...",
        "All Types": "All Types",
        "Images": "Images",
        "Videos": "Videos",
        "Documents": "Documents"
      }
    },
    ur: {
      translation: {
        "Community Disaster Archive": "کمیونٹی ڈیزاسٹر آرکائیو",
        "Search by title or location...": "عنوان یا مقام سے تلاش کریں...",
        "All Types": "تمام اقسام",
        "Images": "تصاویر",
        "Videos": "ویڈیوز",
        "Documents": "دستاویزات"
      }
    }
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
