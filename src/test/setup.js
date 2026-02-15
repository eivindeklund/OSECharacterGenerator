import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: vi.fn(),
      resolvedLanguage: 'en',
    },
  }),
  Trans: ({ i18nKey, children }) => {
    if (i18nKey) {
      if (i18nKey === 'AppName') return 'OSE Character Generator';
      if (i18nKey === 'start') return 'Start';
      if (i18nKey === 'Tavern') return 'Tavern';
      if (i18nKey === 'mainPage') return 'Main Page';
      if (i18nKey.includes('.')) {
        const parts = i18nKey.split('.');
        return parts[parts.length - 1].toUpperCase();
      }
      return i18nKey;
    }
    return children;
  },
  I18nextProvider: ({ children }) => children,
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

