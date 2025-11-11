import i18n from 'i18next';
import en_US from '@/i18n/en-US.json';
import it_IT from '@/i18n/it-IT.json';
import { initReactI18next } from 'react-i18next';
import useSettingsStore from '@/stores/settings.store.ts';

const language = useSettingsStore.getState().language;

const resources = {
  'en-US': {
    translation: en_US,
  },
  'it-IT': {
    translation: it_IT,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: language,
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
