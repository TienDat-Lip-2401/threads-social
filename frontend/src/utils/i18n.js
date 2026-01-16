import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enTranslation from '@/locales/en/translation.json'
import viTranslation from '@/locales/vi/translation.json'

const resources = {
    en: {
        translation: enTranslation
    },
    vi: {
        translation: viTranslation
    }
}

// Lấy language từ localStorage hoặc dùng mặc định
const savedLanguage = localStorage.getItem('language') || 'en'

i18n.use(LanguageDetector) // Tự động detect ngôn ngữ từ browser
    .use(initReactI18next) // Kết nối với React
    .init({
        resources,
        lng: savedLanguage, // Ngôn ngữ khởi đầu
        fallbackLng: 'en', // Ngôn ngữ mặc định nếu không detect được
        interpolation: {
            escapeValue: false // React đã tự escape
        }
    })

export default i18n
