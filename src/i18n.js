import en from './locales/en.json';
import km from './locales/km.json';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
    legacy: false, // Important for Composition API
    locale: localStorage.getItem('preferredLanguage') || 'en',
    fallbackLocale: 'en',
    messages: {
        en,
        km
    }
});

export default i18n;
